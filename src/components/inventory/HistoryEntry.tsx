import React, { useState, useEffect } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import type { InventoryEntry } from '../../types';
import { formatNumber, formatTime } from '../../utils/helpers';
import { NumericKeyboard } from '../common/NumericKeyboard';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface HistoryEntryProps {
  entry: InventoryEntry;
  index: number;
  onUpdate: (newQuantity: number) => void;
  onDelete: () => void;
}

export const HistoryEntry: React.FC<HistoryEntryProps> = ({ entry, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(entry.quantity.toString());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const handleSave = (): void => {
    const newQuantity = parseInt(editValue);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onUpdate(newQuantity);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-entry-id="${entry.id}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const targetPosition = window.scrollY + rect.top - (windowHeight * 0.15);
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isEditing, entry.id]);

  const handleCancel = (): void => {
    setEditValue(entry.quantity.toString());
    setIsEditing(false);
  };

  const handleDelete = (): void => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleNumberClick = (num: string): void => {
    setEditValue(editValue + num);
  };

  const handleBackspace = (): void => {
    setEditValue(editValue.slice(0, -1));
  };

  const handleClear = (): void => {
    setEditValue('');
  };

  return (
    <>
      <div 
        data-entry-id={entry.id}
        className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 min-w-0">
            #{index + 1} · {formatTime(entry.timestamp)}
          </span>
          <span className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{entry.location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  readOnly
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center"
                />
                <button
                  onClick={handleSave}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2">
                <NumericKeyboard
                  onNumberClick={handleNumberClick}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  size="normal"
                />
              </div>
            </div>
          ) : (
            <>
              <span className="font-semibold text-gray-900 min-w-0 bg-blue-50 px-2 py-1 rounded">{formatNumber(entry.quantity)}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edytuj ilość"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Usuń wpis"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Usuń wpis"
        message={`Czy na pewno chcesz usunąć wpis #${index + 1} z ilością ${entry.quantity}?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Usuń"
        cancelText="Anuluj"
      />
    </>
  );
};