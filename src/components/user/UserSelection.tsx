import React from 'react';
import { Package, Settings, UserCheck } from 'lucide-react';
import type { CountingGroup, UserSession } from '../../types';

interface UserSelectionProps {
  groups: CountingGroup[];
  onUserSelect: (session: UserSession) => void;
  onAdminAccess: () => void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({ groups, onUserSelect, onAdminAccess }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2 flex items-center justify-center gap-3">
            <Package className="text-blue-600" />
            System Inwentaryzacji
          </h1>
          <p className="text-gray-600 text-center mb-8">Wybierz swoją grupę i pozycję w zespole</p>
          
          <div className="grid gap-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-indigo-600 mb-4 font-medium">
                  Grupy materiałowe: {group.materialGroups.join(', ')}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => onUserSelect({
                      groupId: group.id,
                      personId: 'person1',
                      personName: group.person1
                    })}
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <UserCheck className="w-5 h-5" />
                    {group.person1}
                  </button>
                  <button
                    onClick={() => onUserSelect({
                      groupId: group.id,
                      personId: 'person2',
                      personName: group.person2
                    })}
                    className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <UserCheck className="w-5 h-5" />
                    {group.person2}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={onAdminAccess}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center gap-2 mx-auto"
            >
              <Settings className="w-5 h-5" />
              Panel Administratora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};