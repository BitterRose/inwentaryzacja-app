import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import type { Product, InventoryData, ComparisonData, UserSession, CountingGroup } from '../../types';
import { formatNumber } from '../../utils/helpers';
import { NumericKeyboard } from '../common/NumericKeyboard';

interface ComparisonViewProps {
  products: Product[];
  inventoryData: InventoryData;
  comparisonData: ComparisonData;
  userSession: UserSession;
  groups: CountingGroup[];
  onResolveDiscrepancy: (productId: number, finalQuantity: number) => void;
  onBackToUser: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  products,
  inventoryData,
  comparisonData,
  userSession,
  groups,
  onResolveDiscrepancy,
  onBackToUser
}) => {
  const group = groups.find(g => g.id === userSession.groupId);
  if (!group) return null;

  const groupProducts = products.filter(p => 
    group.materialGroups.includes(p.materialGroup)
  );

  const getProductComparison = (productId: number) => {
    const person1Data = inventoryData[userSession.groupId]?.person1?.[productId];
    const person2Data = inventoryData[userSession.groupId]?.person2?.[productId];
    const resolved = comparisonData[userSession.groupId]?.[productId]?.resolved || false;
    const finalQuantity = comparisonData[userSession.groupId]?.[productId]?.finalQuantity;
    
    return { person1Data, person2Data, resolved, finalQuantity };
  };

  const discrepancies = groupProducts.filter(product => {
    const { person1Data, person2Data, resolved } = getProductComparison(product.id);
    return person1Data !== undefined && person2Data !== undefined && 
           person1Data !== person2Data && !resolved;
  });

  const resolvedDiscrepancies = groupProducts.filter(product => {
    const { resolved } = getProductComparison(product.id);
    return resolved;
  });

  const agreements = groupProducts.filter(product => {
    const { person1Data, person2Data, resolved } = getProductComparison(product.id);
    return person1Data !== undefined && person2Data !== undefined && 
           person1Data === person2Data && !resolved;
  });

  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<number | null>(null);
  const [correctionValue, setCorrectionValue] = useState<string>('');

  const handleCorrection = () => {
    if (selectedDiscrepancy && correctionValue !== '') {
      const quantity = parseInt(correctionValue);
      if (!isNaN(quantity) && quantity >= 0) {
        onResolveDiscrepancy(selectedDiscrepancy, quantity);
        setSelectedDiscrepancy(null);
        setCorrectionValue('');
      }
    }
  };

  const handleNumberClick = (num: string): void => {
    setCorrectionValue(correctionValue + num);
  };

  const handleBackspace = (): void => {
    setCorrectionValue(correctionValue.slice(0, -1));
  };

  const handleClear = (): void => {
    setCorrectionValue('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitCompare className="text-blue-600" />
            Porównanie wyników - {group.name}
          </h2>
          <button
            onClick={onBackToUser}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Powrót do liczenia
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-700 mb-2">Różnice do rozwiązania</h3>
            <div className="text-2xl font-bold text-red-600">{discrepancies.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">Zgodne wyniki</h3>
            <div className="text-2xl font-bold text-green-600">{agreements.length}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Rozwiązane różnice</h3>
            <div className="text-2xl font-bold text-blue-600">{resolvedDiscrepancies.length}</div>
          </div>
        </div>
      </div>

      {discrepancies.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-700 mb-4">Różnice wymagające korekty</h3>
          <div className="space-y-4">
            {discrepancies.map(product => {
              const { person1Data, person2Data } = getProductComparison(product.id);
              const isSelected = selectedDiscrepancy === product.id;
              
              return (
                <div key={product.id} className="border border-red-300 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">SAP: {product.sapCode}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDiscrepancy(isSelected ? null : product.id);
                        setCorrectionValue('');
                      }}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      {isSelected ? 'Anuluj' : 'Skoryguj'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">{group.person1}</div>
                      <div className="text-lg font-bold text-green-600">{formatNumber(person1Data || 0)}</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">{group.person2}</div>
                      <div className="text-lg font-bold text-purple-600">{formatNumber(person2Data || 0)}</div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wprowadź poprawną ilość:
                      </label>
                      <input
                        type="text"
                        value={correctionValue}
                        readOnly
                        className="w-full px-4 py-3 text-xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 mb-4"
                        placeholder="0"
                      />
                      
                      <div className="mb-4">
                        <NumericKeyboard
                          onNumberClick={handleNumberClick}
                          onBackspace={handleBackspace}
                          onClear={handleClear}
                          size="normal"
                        />
                      </div>
                      
                      <button
                        onClick={handleCorrection}
                        disabled={correctionValue === ''}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                      >
                        Zatwierdź korektę
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {agreements.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-green-200">
          <h3 className="text-lg font-bold text-green-700 mb-4">Zgodne wyniki</h3>
          <div className="grid gap-3">
            {agreements.map(product => {
              const { person1Data } = getProductComparison(product.id);
              
              return (
                <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-300 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">SAP: {product.sapCode}</p>
                  </div>
                  <div className="bg-white px-3 py-2 rounded border border-green-300">
                    <div className="text-lg font-bold text-green-600">{formatNumber(person1Data || 0)}</div>
                    <div className="text-xs text-gray-500">zgodnie</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resolvedDiscrepancies.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-700 mb-4">Rozwiązane różnice</h3>
          <div className="grid gap-3">
            {resolvedDiscrepancies.map(product => {
              const { finalQuantity } = getProductComparison(product.id);
              
              return (
                <div key={product.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-300 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">SAP: {product.sapCode}</p>
                  </div>
                  <div className="bg-white px-3 py-2 rounded border border-blue-300">
                    <div className="text-lg font-bold text-blue-600">{formatNumber(finalQuantity || 0)}</div>
                    <div className="text-xs text-gray-500">skorygowane</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};