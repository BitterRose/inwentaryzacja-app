import React from 'react';
import { History } from 'lucide-react';
import type { Product, InventoryData, InventoryHistory, UserSession } from '../../types';
import { formatNumber } from '../../utils/helpers';
import { NumericKeyboard } from '../common/NumericKeyboard';
import { HistoryEntry } from '../inventory/HistoryEntry';

interface CounterInputViewProps {
  selectedProduct: Product;
  setSelectedProduct: (product: Product | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  inventoryData: InventoryData;
  inventoryHistory: InventoryHistory;
  handleQuantitySubmit: (isAddition?: boolean) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  updateHistoryEntry: (productId: number, entryId: number, newQuantity: number) => void;
  deleteHistoryEntry: (productId: number, entryId: number) => void;
  quantityInputRef: React.RefObject<HTMLInputElement | null>;
  userSession: UserSession;
}

export const CounterInputView: React.FC<CounterInputViewProps> = ({ 
  selectedProduct, setSelectedProduct, inputValue, setInputValue, inventoryData, 
  inventoryHistory, handleQuantitySubmit, handleKeyPress, updateHistoryEntry, 
  deleteHistoryEntry, quantityInputRef, userSession 
}) => {
  const currentUserData = inventoryData[userSession.groupId]?.[userSession.personId]?.[selectedProduct.id];
  const currentUserHistory = inventoryHistory[userSession.groupId]?.[userSession.personId]?.[selectedProduct.id];

  const handleNumberClick = (num: string): void => {
    setInputValue(inputValue + num);
  };

  const handleBackspace = (): void => {
    setInputValue(inputValue.slice(0, -1));
  };

  const handleClear = (): void => {
    setInputValue('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="mb-6">
        <button
          onClick={() => setSelectedProduct(null)}
          className="w-full mb-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 border-2 border-blue-300 shadow-md"
        >
          <span className="text-lg">←</span>
          Powrót do wyszukiwania
        </button>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm bg-white px-3 py-1 rounded-full border border-blue-300 text-blue-700">
              {selectedProduct.sapCode}
            </span>
            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              {userSession.personName}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
          <p className="text-indigo-600 font-medium font-mono">Grupa: {selectedProduct.materialGroup}</p>
          <div className="flex items-center justify-between mt-3">
            {currentUserData !== undefined && (
              <div className="text-sm text-blue-700 bg-white px-3 py-2 rounded-lg border border-blue-200">
                Dotychczas zliczone: <span className="font-bold text-green-600">{formatNumber(currentUserData)}</span>
                {currentUserHistory && currentUserHistory.length > 1 && (
                  <span className="text-xs ml-1 text-purple-600">({currentUserHistory.length} wpisów)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {currentUserData !== undefined 
            ? 'Wprowadź dodatkową ilość (z innej lokalizacji)' 
            : 'Wprowadź zliczoną ilość'
          }
        </label>
        <input
          ref={quantityInputRef}
          type="text"
          inputMode="none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-4 text-2xl text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
          placeholder="0"
          readOnly
        />
        
        <div className="mt-4">
          <NumericKeyboard
            onNumberClick={handleNumberClick}
            onBackspace={handleBackspace}
            onClear={handleClear}
            size="large"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => handleQuantitySubmit(true)}
          disabled={inputValue === ''}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span>{currentUserData !== undefined ? '+ Dodaj do dotychczasowej ilości' : 'Zapisz ilość'}</span>
        </button>
      </div>

      {currentUserHistory && currentUserHistory.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            Historia wpisów ({currentUserHistory.length})
          </h4>
          <div className="space-y-2">
            {currentUserHistory.map((entry, index) => (
              <HistoryEntry
                key={entry.id}
                entry={entry}
                index={index}
                onUpdate={(newQuantity) => updateHistoryEntry(selectedProduct.id, entry.id, newQuantity)}
                onDelete={() => deleteHistoryEntry(selectedProduct.id, entry.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};