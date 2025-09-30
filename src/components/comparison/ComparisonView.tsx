import React from 'react';
import { GitCompare } from 'lucide-react';
import type { Product, InventoryData, UserSession, CountingGroup } from '../../types';
import { formatNumber } from '../../utils/helpers';

interface ComparisonViewProps {
  products: Product[];
  inventoryData: InventoryData;
  userSession: UserSession;
  groups: CountingGroup[];
  onBackToUser: () => void;
  onEditProduct: (product: Product) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  products,
  inventoryData,
  userSession,
  groups,
  onBackToUser,
  onEditProduct
}) => {
  const group = groups.find(g => g.id === userSession.groupId);
  if (!group) return null;

  const groupProducts = products.filter(p => 
    group.materialGroups.includes(p.materialGroup)
  );

  const getProductComparison = (productId: number) => {
    const person1Data = inventoryData[userSession.groupId]?.person1?.[productId];
    const person2Data = inventoryData[userSession.groupId]?.person2?.[productId];
    
    return { person1Data, person2Data };
  };

  // Sprawdź czy druga osoba ukończyła liczenie
  const otherPersonId = userSession.personId === 'person1' ? 'person2' : 'person1';
  const otherPersonFinished = groupProducts.every(product => 
    inventoryData[userSession.groupId]?.[otherPersonId]?.[product.id] !== undefined
  );

  // Jeśli druga osoba nie skończyła - pokaż ekran oczekiwania
  if (!otherPersonFinished) {
    const otherPersonName = userSession.personId === 'person1' ? group.person2 : group.person1;
    const otherPersonProgress = groupProducts.filter(product => 
      inventoryData[userSession.groupId]?.[otherPersonId]?.[product.id] !== undefined
    ).length;
    
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
        </div>

        <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 text-center">
          <div className="mb-6">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <GitCompare className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Oczekiwanie na drugą osobę
          </h3>
          
          <p className="text-lg text-gray-600 mb-6">
            <strong>{otherPersonName}</strong> nadal liczy produkty
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
            <div className="text-sm text-gray-600 mb-2">Postęp:</div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {otherPersonProgress} / {groupProducts.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(otherPersonProgress / groupProducts.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Strona odświeży się automatycznie gdy <strong>{otherPersonName}</strong> ukończy liczenie
          </p>
        </div>
      </div>
    );
  }

  // Tylko produkty gdzie obie osoby policzyły
  const comparedProducts = groupProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data !== undefined && person2Data !== undefined;
  });

  const discrepancies = comparedProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data !== person2Data;
  });

  const agreements = comparedProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data === person2Data;
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
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-700 mb-2">Różnice</h3>
            <div className="text-2xl font-bold text-red-600">{discrepancies.length}</div>
            <div className="text-xs text-gray-600 mt-1">wymaga weryfikacji</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">Zgodne</h3>
            <div className="text-2xl font-bold text-green-600">{agreements.length}</div>
            <div className="text-xs text-gray-600 mt-1">identyczne wyniki</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Instrukcja:</strong> Jeśli zauważysz różnicę, kliknij "Edytuj" przy produkcie, 
            aby przejść do ekranu edycji i zweryfikować swoje wpisy w historii.
          </p>
        </div>
      </div>

      {discrepancies.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-700 mb-4">⚠️ Różnice wymagające weryfikacji</h3>
          <p className="text-sm text-gray-600 mb-4">
            Kliknij "Edytuj" aby przejść do ekranu danego produktu i sprawdzić swoje wpisy.
          </p>
          <div className="space-y-4">
            {discrepancies.map(product => {
              const { person1Data, person2Data } = getProductComparison(product.id);
              
              return (
                <div key={product.id} className="border border-red-300 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">SAP: {product.sapCode}</p>
                    </div>
                    <button
                      onClick={() => onEditProduct(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Edytuj
                    </button>
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
    </div>
  );
};