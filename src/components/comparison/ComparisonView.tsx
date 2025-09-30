import React from 'react';
import { GitCompare, AlertTriangle, CheckCircle } from 'lucide-react';
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
              Porównanie wyników
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

  // Kategoryzacja produktów
  const productsWithDifferenceBetweenPeople = comparedProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data !== person2Data;
  });

  const productsAgreedButDifferentFromSystem = comparedProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data === person2Data && person1Data !== product.expectedQty;
  });

  const productsFullyCorrect = comparedProducts.filter(product => {
    const { person1Data, person2Data } = getProductComparison(product.id);
    return person1Data === person2Data && person1Data === product.expectedQty;
  });

  const totalIssues = productsWithDifferenceBetweenPeople.length + productsAgreedButDifferentFromSystem.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <GitCompare className="text-blue-600" />
              Porównanie wyników
            </h2>
            <p className="text-gray-600">{group.name}</p>
          </div>
          <button
            onClick={onBackToUser}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Powrót do liczenia
          </button>
        </div>

        {/* Podsumowanie */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-300 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">{totalIssues}</div>
            <div className="text-sm font-medium text-red-700">Do sprawdzenia</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-300 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">{productsAgreedButDifferentFromSystem.length}</div>
            <div className="text-sm font-medium text-orange-700">Różnica z systemem</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{productsFullyCorrect.length}</div>
            <div className="text-sm font-medium text-green-700">Wszystko OK</div>
          </div>
        </div>
      </div>

      {/* 1. PRIORYTET: Różnice między osobami */}
      {productsWithDifferenceBetweenPeople.length > 0 && (
        <div className="bg-white rounded-lg shadow-xl p-6 border-4 border-red-500">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-700 mb-2">
                Uwaga! Różne wyniki między osobami
              </h3>
              <p className="text-gray-700 text-lg">
                Wy i druga osoba policzyliście <strong>różne ilości</strong> tych produktów. 
                Kliknij <strong>"Edytuj"</strong> aby sprawdzić swoje wpisy.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {productsWithDifferenceBetweenPeople.map(product => {
              const { person1Data, person2Data } = getProductComparison(product.id);
              
              return (
                <div key={product.id} className="border-2 border-red-400 rounded-lg p-5 bg-gradient-to-r from-red-50 to-red-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-600 font-mono">SAP: {product.sapCode}</p>
                    </div>
                    <button
                      onClick={() => onEditProduct(product)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                    >
                      Edytuj
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      userSession.personId === 'person1' 
                        ? 'bg-white border-blue-500 shadow-lg' 
                        : 'bg-white border-gray-300'
                    }`}>
                      <div className="text-sm font-medium text-gray-600 mb-2">{group.person1}</div>
                      <div className="text-2xl font-bold text-green-600">{formatNumber(person1Data || 0)}</div>
                      {userSession.personId === 'person1' && (
                        <div className="text-sm text-blue-600 font-semibold mt-2">← Twój wynik</div>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${
                      userSession.personId === 'person2' 
                        ? 'bg-white border-blue-500 shadow-lg' 
                        : 'bg-white border-gray-300'
                    }`}>
                      <div className="text-sm font-medium text-gray-600 mb-2">{group.person2}</div>
                      <div className="text-2xl font-bold text-purple-600">{formatNumber(person2Data || 0)}</div>
                      {userSession.personId === 'person2' && (
                        <div className="text-sm text-blue-600 font-semibold mt-2">← Twój wynik</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Zgoda między osobami, ale różnica z systemem */}
      {productsAgreedButDifferentFromSystem.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-3 border-orange-400">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-orange-500 text-white p-3 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-700 mb-2">
                Zgoda między osobami, ale różnica z systemem
              </h3>
              <p className="text-gray-700">
                Wy i druga osoba policzyliście <strong>tę samą ilość</strong>, ale różni się ona od tego co jest w systemie.
                Możesz zweryfikować swoje wpisy klikając <strong>"Edytuj"</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {productsAgreedButDifferentFromSystem.map(product => {
              const { person1Data } = getProductComparison(product.id);
              const countedQty = person1Data || 0;
              
              return (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                    <p className="text-sm text-gray-600 font-mono">SAP: {product.sapCode}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white px-5 py-3 rounded-lg border-2 border-orange-400 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">Zliczone przez obie osoby</div>
                      <div className="text-2xl font-bold text-orange-600">{formatNumber(countedQty)}</div>
                    </div>
                    <div className="px-4 py-2 rounded-lg font-bold bg-orange-500 text-white">
                      ⚠ Różni się
                    </div>
                    <button
                      onClick={() => onEditProduct(product)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Edytuj
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Wszystko OK */}
      {productsFullyCorrect.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-400">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-green-500 text-white p-3 rounded-full">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Wszystko poprawne
              </h3>
              <p className="text-gray-700">
                Te produkty zostały policzone <strong>identycznie</strong> przez obie osoby 
                i <strong>zgadzają się</strong> z systemem.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {productsFullyCorrect.map(product => {
              const { person1Data } = getProductComparison(product.id);
              const countedQty = person1Data || 0;
              
              return (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600 font-mono">SAP: {product.sapCode}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white px-5 py-3 rounded-lg border-2 border-green-400 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">Zliczone</div>
                      <div className="text-2xl font-bold text-green-600">{formatNumber(countedQty)}</div>
                    </div>
                    <div className="px-5 py-3 rounded-lg font-bold bg-green-500 text-white text-lg">
                      ✓ OK
                    </div>
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