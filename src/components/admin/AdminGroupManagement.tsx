import React, { useState } from 'react';
import { Users } from 'lucide-react';
import type { CountingGroup, Product, InventoryData, ComparisonData } from '../../types';

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
                
                <div className="grid grid-cols-3 gap-4 mb-4">
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
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-red-700 mb-2">Różnice</h4>
                    <div className="text-2xl font-bold text-red-600">{discrepancies}</div>
                    <div className="text-sm text-gray-600">do rozwiązania</div>
                  </div>
                </div>
                
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