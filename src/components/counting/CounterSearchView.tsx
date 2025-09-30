import React from 'react';
import { Search, CheckCircle, AlertCircle, GitCompare } from 'lucide-react';
import type { Product, InventoryData, InventoryHistory, ProductStatus, UserSession } from '../../types';
import { formatNumber, getMaterialGroupColor } from '../../utils/helpers';
import { NumericKeyboard } from '../common/NumericKeyboard';

interface CounterSearchViewProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: 'sap' | 'name';
  setSearchType: (type: 'sap' | 'name') => void;
  filteredProducts: Product[];
  inventoryData: InventoryData;
  inventoryHistory: InventoryHistory;
  getProductStatus: (product: Product) => ProductStatus;
  handleProductSelect: (product: Product) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  userSession: UserSession;
  onCompareResults: () => void;
}

export const CounterSearchView: React.FC<CounterSearchViewProps> = ({ 
  searchTerm, setSearchTerm, searchType, setSearchType, filteredProducts, inventoryData, inventoryHistory, 
  getProductStatus, handleProductSelect, handleKeyPress, searchInputRef, userSession, onCompareResults
}) => {
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (searchType === 'sap') {
      const numericValue = value.replace(/\D/g, '');
      setSearchTerm(numericValue);
    } else {
      setSearchTerm(value);
    }
  };

  const handleNumberClick = (num: string): void => {
    if (searchType === 'sap' && searchTerm.length < 8) {
      setSearchTerm(searchTerm + num);
    }
  };

  const handleBackspace = (): void => {
    setSearchTerm(searchTerm.slice(0, -1));
  };

  const handleClear = (): void => {
    setSearchTerm('');
  };

  const getStatusColors = (status: ProductStatus) => {
    switch (status) {
      case 'pending': 
        return {
          border: 'border-gray-300',
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          hover: 'hover:border-blue-400 hover:shadow-lg'
        };
      case 'counted': 
        return {
          border: 'border-blue-300',
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          hover: 'hover:border-blue-500 hover:shadow-lg'
        };
      case 'person_diff':
        return {
          border: 'border-orange-300',
          bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
          hover: 'hover:border-orange-500 hover:shadow-lg'
        };
      case 'verified':
        return {
          border: 'border-green-300',
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          hover: 'hover:border-green-500 hover:shadow-lg'
        };
      case 'match': 
        return {
          border: 'border-green-300',
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          hover: 'hover:border-green-500 hover:shadow-lg'
        };
      case 'diff': 
        return {
          border: 'border-yellow-300',
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          hover: 'hover:border-yellow-500 hover:shadow-lg'
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchType('sap');
                setSearchTerm('');
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all shadow-sm ${
                searchType === 'sap' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-105' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              📱 Kod SAP
            </button>
            <button
              onClick={() => {
                setSearchType('name');
                setSearchTerm('');
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all shadow-sm ${
                searchType === 'name' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md scale-105' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              🔍 Nazwa produktu
            </button>
          </div>
          
          <button
            onClick={onCompareResults}
            className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            Porównaj wyniki
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          {searchType === 'sap' 
            ? 'Wprowadź 8-cyfrowy kod SAP' 
            : 'Wyszukaj po nazwie produktu'
          }
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {searchType === 'sap' ? (
            <input
              ref={searchInputRef}
              type="text"
              inputMode="none"
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-r from-gray-50 to-white shadow-inner"
              placeholder="np. 10001234"
              maxLength={8}
              autoFocus
              readOnly
            />
          ) : (
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-r from-gray-50 to-white shadow-inner"
              placeholder="np. laptop, krzesło..."
              autoFocus={searchType === 'name'}
            />
          )}
        </div>
        {searchType === 'sap' && (
          <div className="text-sm mt-2 h-6 px-2">
            {searchTerm.length > 0 && searchTerm.length < 8 ? (
              <div className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 inline-block">
                Kod SAP: <span className="font-bold">{searchTerm}</span> 
                <span className="text-blue-500 ml-1">({8 - searchTerm.length} cyfr pozostało)</span>
              </div>
            ) : searchTerm.length === 8 ? (
              <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 inline-block">
                Kod SAP: <span className="font-bold">{searchTerm}</span> (kompletny)
              </div>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        )}

        {searchType === 'sap' && (
          <div className="mt-4">
            <NumericKeyboard
              onNumberClick={handleNumberClick}
              onBackspace={handleBackspace}
              onClear={handleClear}
              disabled={searchTerm.length >= 8}
              size="large"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const status = getProductStatus(product);
          const counted = inventoryData[userSession.groupId]?.[userSession.personId]?.[product.id];
          const colors = getStatusColors(status);
          
          return (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${colors.border} ${colors.bg} ${colors.hover} transform hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm bg-white px-3 py-1 rounded-full border-2 border-gray-300 text-gray-700 shadow-sm">
                      {product.sapCode}
                    </span>
                    {status === 'pending' && <AlertCircle className="w-5 h-5 text-gray-500" />}
                    {status === 'counted' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    {status === 'person_diff' && <AlertCircle className="w-5 h-5 text-orange-600" />}
                    {status === 'verified' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {status === 'match' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {status === 'diff' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">{product.name}</h3>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${getMaterialGroupColor(product.materialGroup)}`}>
                    {product.materialGroup}
                  </span>
                </div>
                <div className="text-right ml-4">
                  {counted !== undefined && (
                    <div className="bg-white rounded-lg p-3 border-2 border-blue-200 shadow-sm">
                      <div className="text-xs text-gray-600 mb-1 text-center">Zliczone</div>
                      <div className="text-xl font-bold text-blue-600 text-center">{formatNumber(counted)}</div>
                      {inventoryHistory[userSession.groupId]?.[userSession.personId]?.[product.id] && 
                       inventoryHistory[userSession.groupId][userSession.personId][product.id].length > 1 && (
                        <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full mt-1 text-center">
                          {inventoryHistory[userSession.groupId][userSession.personId][product.id].length} lokalizacji
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-lg font-medium text-gray-600 mb-2">
            Brak wyników
          </div>
          <div className="text-sm text-gray-500">
            {searchType === 'sap' 
              ? `Nie znaleziono produktu z kodem SAP: ${searchTerm}`
              : `Nie znaleziono produktów zawierających: "${searchTerm}"`
            }
          </div>
        </div>
      )}
    </div>
  );
};