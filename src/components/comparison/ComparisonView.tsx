import React from 'react';
import { GitCompare } from 'lucide-react';
import type { Product, InventoryData, ComparisonData, UserSession, CountingGroup } from '../../types';
import { formatNumber } from '../../utils/helpers';

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

  // Tylko produkty gdzie obie osoby policzyły
  const comparedProducts = groupProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data !== undefined && person2Data !== undefined;
  });

  const discrepancies = comparedProducts.filter(product => {
    const { person1Data, person2Data, resolved } = getProductComparison(product.id);
    return person1Data !== person2Data && !resolved;
  });

  const agreements = comparedProducts.filter(product => {
    const { person1Data, person2Data, resolved } = getProductComparison(product.id);
    return person1Data === person2Data && !resolved;
  });

  const resolvedDiscrepancies = comparedProducts.filter(product => {
    const { resolved } = getProductComparison(product.id);
    return resolved;
  });

  const notYetCounted = groupProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data === undefined || person2Data === undefined;
  });

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
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-700 mb-2">Różnice</h3>
            <div className="text-2xl font-bold text-red-600">{discrepancies.length}</div>
            <div className="text-xs text-gray-600 mt-1">wymaga rozwiązania</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">Zgodne</h3>
            <div className="text-2xl font-bold text-green-600">{agreements.length}</div>
            <div className="text-xs text-gray-600 mt-1">identyczne wyniki</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Rozwiązane</h3>
            <div className="text-2xl font-bold text-blue-600">{resolvedDiscrepancies.length}</div>
            <div className="text-xs text-gray-600 mt-1">po korekcie</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Brak danych</h3>
            <div className="text-2xl font-bold text-gray-600">{notYetCounted.length}</div>
            <div className="text-xs text-gray-600 mt-1">nie policzone przez obie osoby</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Instrukcja:</strong> Jeśli zauważysz różnicę w swoich wynikach z drugim liczącym, 
            wróć do ekranu liczenia i zweryfikuj swoje wpisy w historii. Każda osoba edytuje tylko swoje dane.
          </p>
        </div>
      </div>

      {notYetCounted.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            ⏳ Oczekiwanie na dane ({notYetCounted.length})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Następujące produkty nie zostały jeszcze policzone przez obie osoby:
          </p>
          <div className="grid gap-3">
            {notYetCounted.map(product => {
              const { person1Data, person2Data } = getProductComparison(product.id);
              
              return (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">SAP: {product.sapCode}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">{group.person1}</div>
                      <div className={`font-bold ${person1Data !== undefined ? 'text-green-600' : 'text-gray-400'}`}>
                        {person1Data !== undefined ? formatNumber(person1Data) : '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">{group.person2}</div>
                      <div className={`font-bold ${person2Data !== undefined ? 'text-purple-600' : 'text-gray-400'}`}>
                        {person2Data !== undefined ? formatNumber(person2Data) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {discrepancies.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-700 mb-4">⚠️ Różnice wymagające weryfikacji</h3>
          <p className="text-sm text-gray-600 mb-4">
            Wróć do ekranu liczenia i sprawdź swoje wpisy w historii. Każda osoba weryfikuje i edytuje tylko swoje dane.
          </p>
          <div className="space-y-4">
            {discrepancies.map(product => {
              const { person1Data, person2Data } = getProductComparison(product.id);
              
              return (
                <div key={product.id} className="border border-red-300 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">SAP: {product.sapCode}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded border ${userSession.personId === 'person1' ? 'bg-white border-green-400 border-2' : 'bg-white'}`}>
                      <div className="text-sm text-gray-600">{group.person1}</div>
                      <div className="text-lg font-bold text-green-600">{formatNumber(person1Data || 0)}</div>
                      {userSession.personId === 'person1' && (
                        <div className="text-xs text-blue-600 mt-1">← Twój wynik</div>
                      )}
                    </div>
                    <div className={`p-3 rounded border ${userSession.personId === 'person2' ? 'bg-white border-purple-400 border-2' : 'bg-white'}`}>
                      <div className="text-sm text-gray-600">{group.person2}</div>
                      <div className="text-lg font-bold text-purple-600">{formatNumber(person2Data || 0)}</div>
                      {userSession.personId === 'person2' && (
                        <div className="text-xs text-blue-600 mt-1">← Twój wynik</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {agreements.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-green-200">
          <h3 className="text-lg font-bold text-green-700 mb-4">✓ Zgodne wyniki</h3>
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
          <h3 className="text-lg font-bold text-blue-700 mb-4">✓ Rozwiązane różnice</h3>
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
                    <div className="text-xs text-gray-500">po weryfikacji</div>
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