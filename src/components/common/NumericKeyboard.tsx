import React from 'react';

interface NumericKeyboardProps {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
  size?: 'normal' | 'large';
}

export const NumericKeyboard: React.FC<NumericKeyboardProps> = ({ 
  onNumberClick, onBackspace, onClear, disabled = false, size = 'normal' 
}) => {
  const buttonSize = size === 'large' ? 'h-16' : 'h-12';
  const textSize = size === 'large' ? 'text-2xl' : 'text-xl';
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-3">Klawiatura numeryczna:</p>
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => onNumberClick(num.toString())}
            disabled={disabled}
            className={`${buttonSize} bg-white border border-gray-300 rounded-lg ${textSize} font-semibold hover:bg-blue-50 hover:border-blue-300 transition-colors active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            type="button"
          >
            {num}
          </button>
        ))}
        <button
          onClick={onBackspace}
          disabled={disabled}
          className={`${buttonSize} bg-red-100 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors active:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          type="button"
        >
          Usuń
        </button>
        <button
          onClick={() => onNumberClick('0')}
          disabled={disabled}
          className={`${buttonSize} bg-white border border-gray-300 rounded-lg ${textSize} font-semibold hover:bg-blue-50 hover:border-blue-300 transition-colors active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          type="button"
        >
          0
        </button>
        <button
          onClick={onClear}
          disabled={disabled}
          className={`${buttonSize} bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          type="button"
        >
          Wyczyść
        </button>
      </div>
    </div>
  );
};