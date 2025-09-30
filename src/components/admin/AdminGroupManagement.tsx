import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { CountingGroup, Product, InventoryData, ComparisonData } from '../../types';
import { formatNumber } from '../../utils/helpers';

interface AdminGroupManagementProps {
  groups: CountingGroup[];
  products: Product[];
  inventoryData: InventoryData;
  comparisonData: ComparisonData;
}

export const AdminGroupManagement: React.FC<AdminGroupManagementProps> = ({
  groups,
  products,
  inventoryData,
  comparisonData
}) => {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const availableMaterialGroups = [...new Set(products.map(p => p.materialGroup))];

  const getGroupProgress = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return { person1: 0, person2: 0, total: 0 };

    const groupProducts = products.filter(p => group.materialGroups.includes(p.materialGroup));
    const total = groupProducts.length;
    
    const person1Count = groupProducts.filter(p => 
      inventoryData[groupId]?.person1?.[p.id] !== undefined
    ).length;
    
    const person2Count = groupProducts.filter(p => 
      inventoryData[groupId]?.person2?.[p.id] !== undefined
    ).length;

    return { person1: person1Count, person2: person2Count, total };
  };

  const getDiscrepancies = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return 0;

    const groupProducts = products.filter(p => group.materialGroups.includes(p.materialGroup));
    
    return groupProducts.filter(product => {
      const person1Data = inventoryData[groupId]?.person1?.[product.id];
      const person2Data = inventoryData[groupId]?.person2?.[product.id];
      const resolved = comparisonData[groupId]?.[product.id]?.resolved || false;
      
      return person1Data !== undefined && person2Data !== undefined && 
             person1Data !== person2Data && !resolved;
    }).length;
  };

  const getSystemDifferences = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return { total: 0, details: [] };

    const groupProducts = products.filter(p => group.materialGroups.includes(p.materialGroup));
    
    const details = groupProducts
      .filter(product => {
        const person1Data = inventoryData[groupId]?.person1?.[product.id];
        const person2Data = inventoryData[groupId]?.person2?.[product.id];
        
        // Obie osoby policzyły i się zgadzają
        if (person1Data !== undefined && person2Data !== undefined && person1Data === person2Data) {
          // Ale różni się od systemu
          return person1Data !== product.expectedQty;
        }
        return false;
      })
      .map(product => {
        const countedQty = inventoryData[groupId]?.person1?.[product.id] || 0;
        const expectedQty = product.expectedQty;
        const difference = countedQty - expectedQty;
        
        return {
          product,
          countedQty,
          expectedQty,
          difference
        };
      });

    return { total: details.length, details };
  };

  const getFullyCorrect = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return 0;

    const groupProducts = products.filter(p => group.materialGroups.includes(p.materialGroup));
    
    return groupProducts.filter(product => {
      const person1Data = inventoryData[groupId]?.person1?.[product.id];
      const person2Data = inventoryData[groupId]?.person2?.[product.id];
      
      return person1Data !== undefined && person2Data !== undefined && 
             person1Data === person2Data && person1Data === product.expectedQty;
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="text-blue-600" />
          Zarządzanie grupami liczącymi
        </h2>

        <div className="grid gap-6">
          {groups.map((group) => {
            const progress = getGroupProgress(group.id);
            const discrepancies = getDiscrepancies(group.id);
            const systemDiff = getSystemDifferences(group.id);
            const fullyCorrect = getFullyCorrect(group.id);
            const isExpanded = expandedGroup === group.id;
            
            return (
              <div key={group.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                  <button
                    onClick={() => setEditingGroup(editingGroup === group.id ? null : group.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingGroup === group.id ? 'Anuluj' : 'Edytuj'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Postęp osób */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-green-700 mb-2">{group.person1}</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {progress.person1}/{progress.total}
                    </div>
                    <div className="text-sm text-gray-600">
                      {progress.total > 0 ? Math.round((progress.person1 / progress.total) * 100) : 0}%
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-purple-700 mb-2">{group.person2}</h4>
                    <div className="text-2xl font-bold text-purple-600">
                      {progress.person2}/{progress.total}
                    </div>
                    <div className="text-sm text-gray-600">
                      {progress.total > 0 ? Math.round((progress.person2 / progress.total) * 100) : 0}%
                    </div>
                  </div>
                </div>

                {/* Podsumowanie porównania */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-700 mb-2">Różnice między osobami</h4>
                    <div className="text-2xl font-bold text-red-600">{discrepancies}</div>
                    <div className="text-xs text-gray-600 mt-1">do rozwiązania</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-700 mb-2">Różnice z systemem</h4>
                    <div className="text-2xl font-bold text-orange-600">{systemDiff.total}</div>
                    <div className="text-xs text-gray-600 mt-1">zgodne między sobą</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-700 mb-2">Wszystko OK</h4>
                    <div className="text-2xl font-bold text-green-600">{fullyCorrect}</div>
                    <div className="text-xs text-gray-600 mt-1">w pełni zgodne</div>
                  </div>
                </div>

                {/* Przycisk rozwijania szczegółów różnic z systemem */}
                {systemDiff.total > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                      className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-3 rounded-lg transition-colors font-semibold flex items-center justify-between"
                    >
                      <span>Pokaż szczegóły różnic z systemem ({systemDiff.total})</span>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {/* Szczegóły różnic z systemem */}
                {isExpanded && systemDiff.total > 0 && (
                  <div className="bg-white p-4 rounded-lg border-2 border-orange-300 mb-4">
                    <h4 className="font-bold text-orange-800 mb-3 text-lg">
                      Produkty z różnicą względem systemu
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {systemDiff.details.map(({ product, countedQty, expectedQty, difference }) => (
                        <div key={product.id} className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-900">{product.name}</h5>
                              <p className="text-sm text-gray-600 font-mono">SAP: {product.sapCode}</p>
                              <p className="text-xs text-gray-500 mt-1">Grupa: {product.materialGroup}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded border border-orange-300">
                              <div className="text-xs text-gray-600 mb-1">Zliczone (obie osoby)</div>
                              <div className="text-xl font-bold text-orange-600">{formatNumber(countedQty)}</div>
                            </div>
                            
                            <div className="bg-white p-3 rounded border border-blue-300">
                              <div className="text-xs text-gray-600 mb-1">System SAP</div>
                              <div className="text-xl font-bold text-blue-600">{formatNumber(expectedQty)}</div>
                            </div>
                            
                            <div className={`p-3 rounded ${
                              difference > 0 
                                ? 'bg-orange-200 border border-orange-400' 
                                : 'bg-red-200 border border-red-400'
                            }`}>
                              <div className="text-xs text-gray-700 mb-1">Różnica</div>
                              <div className={`text-xl font-bold ${
                                difference > 0 ? 'text-orange-700' : 'text-red-700'
                              }`}>
                                {difference > 0 ? '+' : ''}{formatNumber(difference)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-indigo-600 mb-4 font-medium">
                  Grupy materiałowe: {group.materialGroups.join(', ')}
                </p>
                
                {editingGroup === group.id && (
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-300 mt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Osoba 1:</label>
                        <input
                          type="text"
                          defaultValue={group.person1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Osoba 2:</label>
                        <input
                          type="text"
                          defaultValue={group.person2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grupy materiałowe:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableMaterialGroups.map(mg => (
                          <label key={mg} className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={group.materialGroups.includes(mg)}
                              className="mr-2"
                            />
                            <span className="text-sm">{mg}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Zapisz zmiany
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};