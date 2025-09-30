import React, { useState, useEffect, useRef } from 'react';
import { Package } from 'lucide-react';
import type { 
  Product, 
  UserSession, 
  InventoryData, 
  InventoryHistory, 
  ComparisonData, 
  ProductStatus,
  CountingGroup 
} from './types';
import { formatNumber } from './utils/helpers';
import { NumericKeyboard } from './components/common/NumericKeyboard';
import { UserSelection } from './components/user/UserSelection';
import { CounterSearchView } from './components/counting/CounterSearchView';
import { CounterInputView } from './components/counting/CounterInputView';
import { ComparisonView } from './components/comparison/ComparisonView';
import { AdminGroupManagement } from './components/admin/AdminGroupManagement';
import { defaultGroups, defaultProducts } from './data/mockData';

const App: React.FC = () => {
  // Initialize data from localStorage or defaults
  const [groups] = useState<CountingGroup[]>(() => {
    const saved = localStorage.getItem('inventory-groups');
    return saved ? JSON.parse(saved) : defaultGroups;
  });

  const [products] = useState<Product[]>(() => {
    const baseProducts = defaultProducts;
    
    // Assign products to groups
    return baseProducts.map(product => ({
      ...product,
      assignedGroup: groups.find(g => g.materialGroups.includes(product.materialGroup))?.id
    }));
  });

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('inventory-user-session');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'user' | 'admin' | 'comparison' | 'admin-groups'>('user');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<'sap' | 'name'>('sap');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  
  const [inventoryData, setInventoryData] = useState<InventoryData>(() => {
    const saved = localStorage.getItem('inventory-data');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistory>(() => {
    const saved = localStorage.getItem('inventory-history');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [comparisonData] = useState<ComparisonData>(() => {
    const saved = localStorage.getItem('inventory-comparison');
    return saved ? JSON.parse(saved) : {};
  });

  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [showFillZerosModal, setShowFillZerosModal] = useState<boolean>(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_PIN = '1234';

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('inventory-data', JSON.stringify(inventoryData));
  }, [inventoryData]);

  useEffect(() => {
    localStorage.setItem('inventory-history', JSON.stringify(inventoryHistory));
  }, [inventoryHistory]);

  useEffect(() => {
    localStorage.setItem('inventory-comparison', JSON.stringify(comparisonData));
  }, [comparisonData]);

  useEffect(() => {
    if (userSession) {
      localStorage.setItem('inventory-user-session', JSON.stringify(userSession));
    }
  }, [userSession]);

  // Filter products based on user's group and search
  useEffect(() => {
    if (!userSession) {
      setFilteredProducts([]);
      return;
    }

    const userGroup = groups.find(g => g.id === userSession.groupId);
    if (!userGroup) {
      setFilteredProducts([]);
      return;
    }

    let groupProducts = products.filter(product => 
      userGroup.materialGroups.includes(product.materialGroup)
    );

    if (searchTerm === '') {
      setFilteredProducts(groupProducts);
    } else {
      const filtered = groupProducts.filter(product => {
        if (searchType === 'sap') {
          return product.sapCode.includes(searchTerm);
        } else {
          return product.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
      setFilteredProducts(filtered);
    }
  }, [searchTerm, searchType, products, userSession, groups]);

  // Auto-focus effects
  useEffect(() => {
    if (selectedProduct && quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (showPinModal && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [showPinModal]);

  // Event handlers
  const handleUserSelect = (session: UserSession): void => {
    setUserSession(session);
    setCurrentView('user');
    setIsAdminMode(false);
  };

  const handleAdminAccess = (): void => {
    setShowPinModal(true);
    setPinInput('');
    setPinError(false);
  };

  const handlePinSubmit = (): void => {
    if (pinInput === ADMIN_PIN) {
      setIsAdminMode(true);
      setCurrentView('admin');
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
      // Utwórz tymczasową sesję administratora jeśli nie ma userSession
      if (!userSession) {
        setUserSession({
          groupId: groups[0]?.id || 'group1',
          personId: 'person1',
          personName: 'Administrator'
        });
      }
    } else {
      setPinError(true);
      setPinInput('');
      setTimeout(() => {
        if (pinInputRef.current) {
          pinInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handlePinKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    } else if (e.key === 'Escape') {
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    }
  };

  const closePinModal = (): void => {
    setShowPinModal(false);
    setPinInput('');
    setPinError(false);
  };

  const handleProductSelect = (product: Product): void => {
    setSelectedProduct(product);
    setInputValue('');
  };

  const handleQuantitySubmit = (isAddition: boolean = false): void => {
    if (selectedProduct && inputValue !== '' && userSession) {
      const quantity = parseInt(inputValue);
      if (!isNaN(quantity) && quantity >= 0) {
        const timestamp = Date.now();
        
        const currentUserData = inventoryData[userSession.groupId]?.[userSession.personId]?.[selectedProduct.id];
        const currentUserHistory = inventoryHistory[userSession.groupId]?.[userSession.personId]?.[selectedProduct.id];

        if (isAddition || currentUserData !== undefined) {
          // Add to existing quantity
          setInventoryHistory(prev => ({
            ...prev,
            [userSession.groupId]: {
              ...prev[userSession.groupId],
              [userSession.personId]: {
                ...(prev[userSession.groupId]?.[userSession.personId] || {}),
                [selectedProduct.id]: [
                  ...(currentUserHistory || []),
                  { id: timestamp, quantity, timestamp, location: `Lokalizacja ${(currentUserHistory?.length || 0) + 1}` }
                ]
              }
            }
          }));
          
          setInventoryData(prev => ({
            ...prev,
            [userSession.groupId]: {
              ...prev[userSession.groupId],
              [userSession.personId]: {
                ...(prev[userSession.groupId]?.[userSession.personId] || {}),
                [selectedProduct.id]: (currentUserData || 0) + quantity
              }
            }
          }));
          
          setInputValue('');
          
          setTimeout(() => {
            if (quantityInputRef.current) {
              quantityInputRef.current.focus();
            }
          }, 100);
        } else {
          // First entry for product
          setInventoryHistory(prev => ({
            ...prev,
            [userSession.groupId]: {
              ...prev[userSession.groupId],
              [userSession.personId]: {
                ...(prev[userSession.groupId]?.[userSession.personId] || {}),
                [selectedProduct.id]: [
                  { id: timestamp, quantity, timestamp, location: 'Lokalizacja 1' }
                ]
              }
            }
          }));
          
          setInventoryData(prev => ({
            ...prev,
            [userSession.groupId]: {
              ...prev[userSession.groupId],
              [userSession.personId]: {
                ...(prev[userSession.groupId]?.[userSession.personId] || {}),
                [selectedProduct.id]: quantity
              }
            }
          }));
          
          setSelectedProduct(null);
          setInputValue('');
          setSearchTerm('');
          
          setTimeout(() => {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
            }
          }, 100);
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      if (selectedProduct) {
        handleQuantitySubmit(false);
      } else if (filteredProducts.length === 1) {
        handleProductSelect(filteredProducts[0]);
      }
    }
  };

  const updateHistoryEntry = (productId: number, entryId: number, newQuantity: number): void => {
    if (newQuantity < 0 || !userSession) return;
    
    setInventoryHistory(prev => {
      const currentHistory = prev[userSession.groupId]?.[userSession.personId]?.[productId] || [];
      const updatedHistory = currentHistory.map(entry => 
        entry.id === entryId ? { ...entry, quantity: newQuantity } : entry
      );
      
      const totalQuantity = updatedHistory.reduce((sum, entry) => sum + entry.quantity, 0);
      setInventoryData(prevData => ({
        ...prevData,
        [userSession.groupId]: {
          ...prevData[userSession.groupId],
          [userSession.personId]: {
            ...(prevData[userSession.groupId]?.[userSession.personId] || {}),
            [productId]: totalQuantity
          }
        }
      }));
      
      return {
        ...prev,
        [userSession.groupId]: {
          ...prev[userSession.groupId],
          [userSession.personId]: {
            ...(prev[userSession.groupId]?.[userSession.personId] || {}),
            [productId]: updatedHistory
          }
        }
      };
    });
  };

  const deleteHistoryEntry = (productId: number, entryId: number): void => {
    if (!userSession) return;
    
    setInventoryHistory(prev => {
      const currentHistory = prev[userSession.groupId]?.[userSession.personId]?.[productId] || [];
      const updatedHistory = currentHistory.filter(entry => entry.id !== entryId);
      
      if (updatedHistory.length === 0) {
        setInventoryData(prevData => {
          const newGroupData = { ...(prevData[userSession.groupId]?.[userSession.personId] || {}) };
          delete newGroupData[productId];
          
          return {
            ...prevData,
            [userSession.groupId]: {
              ...prevData[userSession.groupId],
              [userSession.personId]: newGroupData
            }
          };
        });
        
        const newHistory = {
          ...prev,
          [userSession.groupId]: {
            ...prev[userSession.groupId],
            [userSession.personId]: {
              ...(prev[userSession.groupId]?.[userSession.personId] || {})
            }
          }
        };
        delete newHistory[userSession.groupId][userSession.personId][productId];
        return newHistory;
      } else {
        const totalQuantity = updatedHistory.reduce((sum, entry) => sum + entry.quantity, 0);
        setInventoryData(prevData => ({
          ...prevData,
          [userSession.groupId]: {
            ...prevData[userSession.groupId],
            [userSession.personId]: {
              ...(prevData[userSession.groupId]?.[userSession.personId] || {}),
              [productId]: totalQuantity
            }
          }
        }));
        
        return {
          ...prev,
          [userSession.groupId]: {
            ...prev[userSession.groupId],
            [userSession.personId]: {
              ...(prev[userSession.groupId]?.[userSession.personId] || {}),
              [productId]: updatedHistory
            }
          }
        };
      }
    });
  };

  const getProductStatus = (product: Product): ProductStatus => {
    if (!userSession) return 'pending';
    
    const currentUserData = inventoryData[userSession.groupId]?.[userSession.personId]?.[product.id];
    
    // W widoku zwykłego użytkownika - pokazuj tylko czy policzył, czy nie
    if (currentView === 'user') {
      return currentUserData !== undefined ? 'counted' : 'pending';
    }
    
    // W widoku porównania lub admina - pokazuj pełny status
    const otherPersonId = userSession.personId === 'person1' ? 'person2' : 'person1';
    const otherUserData = inventoryData[userSession.groupId]?.[otherPersonId]?.[product.id];
    
    if (currentUserData === undefined) return 'pending';
    
    if (currentView === 'admin') {
      const resolved = comparisonData[userSession.groupId]?.[product.id]?.resolved;
      const finalQuantity = comparisonData[userSession.groupId]?.[product.id]?.finalQuantity;
      
      if (resolved && finalQuantity !== undefined) {
        return finalQuantity === product.expectedQty ? 'match' : 'diff';
      } else if (otherUserData !== undefined) {
        return currentUserData === otherUserData ? 'match' : 'person_diff';
      }
    }
    
    if (currentView === 'comparison') {
      if (otherUserData !== undefined) {
        return currentUserData === otherUserData ? 'match' : 'person_diff';
      }
    }
    
    return 'counted';
  };

  const handlePinNumberClick = (num: string): void => {
    if (pinInput.length < 4) {
      setPinInput(pinInput + num);
      setPinError(false);
    }
  };

  const handlePinBackspace = (): void => {
    setPinInput(pinInput.slice(0, -1));
    setPinError(false);
  };

  const handlePinClear = (): void => {
    setPinInput('');
    setPinError(false);
  };

  const handleLogout = (): void => {
    setUserSession(null);
    setCurrentView('user');
    setSelectedProduct(null);
    setSearchTerm('');
    setInputValue('');
    setIsAdminMode(false);
    setShowFillZerosModal(false);
    localStorage.removeItem('inventory-user-session');
  };

  const handleBackToUser = (): void => {
    setCurrentView('user');
    setSelectedProduct(null);
  };

  const handleFillZeros = (): void => {
    if (!userSession) return;
    
    const userGroup = groups.find(g => g.id === userSession.groupId);
    if (!userGroup) return;
    
    const groupProducts = products.filter(p => userGroup.materialGroups.includes(p.materialGroup));
    const uncountedProducts = groupProducts.filter(p => 
      inventoryData[userSession.groupId]?.[userSession.personId]?.[p.id] === undefined
    );
    
    const timestamp = Date.now();
    
    // Wypełnij wszystkie nieuzupełnione produkty zerami
    const newInventoryData = { ...inventoryData };
    const newInventoryHistory = { ...inventoryHistory };
    
    if (!newInventoryData[userSession.groupId]) {
      newInventoryData[userSession.groupId] = {};
    }
    if (!newInventoryData[userSession.groupId][userSession.personId]) {
      newInventoryData[userSession.groupId][userSession.personId] = {};
    }
    if (!newInventoryHistory[userSession.groupId]) {
      newInventoryHistory[userSession.groupId] = {};
    }
    if (!newInventoryHistory[userSession.groupId][userSession.personId]) {
      newInventoryHistory[userSession.groupId][userSession.personId] = {};
    }
    
    uncountedProducts.forEach(product => {
      newInventoryData[userSession.groupId][userSession.personId][product.id] = 0;
      newInventoryHistory[userSession.groupId][userSession.personId][product.id] = [
        { id: timestamp, quantity: 0, timestamp, location: 'Auto-uzupełnienie' }
      ];
    });
    
    setInventoryData(newInventoryData);
    setInventoryHistory(newInventoryHistory);
    setShowFillZerosModal(false);
    setCurrentView('comparison');
  };

  const handleCancelFillZeros = (): void => {
    setShowFillZerosModal(false);
  };

  const handleCompareResults = (): void => {
    if (!userSession) return;
    
    const userGroup = groups.find(g => g.id === userSession.groupId);
    if (!userGroup) return;
    
    const groupProducts = products.filter(p => userGroup.materialGroups.includes(p.materialGroup));
    
    // Sprawdź które produkty nie zostały policzone przez bieżącego użytkownika
    const uncountedProducts = groupProducts.filter(p => 
      inventoryData[userSession.groupId]?.[userSession.personId]?.[p.id] === undefined
    );
    
    if (uncountedProducts.length > 0) {
      setShowFillZerosModal(true);
    } else {
      setCurrentView('comparison');
    }
  };

  // Calculate progress for current user's group
  const getCurrentGroupProgress = () => {
    if (!userSession) return { counted: 0, total: 0 };
    
    const userGroup = groups.find(g => g.id === userSession.groupId);
    if (!userGroup) return { counted: 0, total: 0 };
    
    const groupProducts = products.filter(p => userGroup.materialGroups.includes(p.materialGroup));
    const countedProducts = groupProducts.filter(p => 
      inventoryData[userSession.groupId]?.[userSession.personId]?.[p.id] !== undefined
    ).length;
    
    return { counted: countedProducts, total: groupProducts.length };
  };

  // PIN Modal - renderuj zawsze, niezależnie od userSession
  const pinModal = showPinModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Dostęp do panelu administratora
        </h3>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Wprowadź PIN aby uzyskać dostęp do panelu administratora
        </p>
        
        <div className="mb-4">
          <input
            ref={pinInputRef}
            type="text"
            inputMode="none"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            onKeyPress={handlePinKeyPress}
            className={`w-full px-4 py-3 text-2xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono tracking-widest ${
              pinError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="• • • •"
            maxLength={4}
            autoComplete="off"
            readOnly
          />
          {pinError && (
            <p className="text-red-600 text-sm mt-2 text-center">
              Nieprawidłowy PIN. Spróbuj ponownie.
            </p>
          )}
          
          <div className="mt-4">
            <NumericKeyboard
              onNumberClick={handlePinNumberClick}
              onBackspace={handlePinBackspace}
              onClear={handlePinClear}
              disabled={pinInput.length >= 4}
              size="large"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={closePinModal}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handlePinSubmit}
            disabled={pinInput.length !== 4}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Potwierdź
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Naciśnij Enter aby potwierdzić lub Escape aby anulować
        </p>
      </div>
    </div>
  );

  // Fill Zeros Modal
  const fillZerosModal = showFillZerosModal && userSession && (() => {
    const userGroup = groups.find(g => g.id === userSession.groupId);
    if (!userGroup) return null;
    
    const groupProducts = products.filter(p => userGroup.materialGroups.includes(p.materialGroup));
    const uncountedProducts = groupProducts.filter(p => 
      inventoryData[userSession.groupId]?.[userSession.personId]?.[p.id] === undefined
    );
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ⚠️ Nieuzupełnione produkty
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Następujące produkty nie zostały jeszcze policzone. Czy chcesz automatycznie uzupełnić je zerami?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Uwaga:</strong> Wszystkie poniższe produkty zostaną zapisane z ilością <strong>0</strong>. 
              Będziesz mógł je później edytować w historii wpisów.
            </p>
          </div>
          
          <div className="mb-6 max-h-60 overflow-y-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Kod SAP</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Nazwa produktu</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {uncountedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-mono">{product.sapCode}</td>
                    <td className="px-4 py-2 text-sm">{product.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancelFillZeros}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Anuluj
            </button>
            <button
              onClick={handleFillZeros}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Uzupełnij zerami ({uncountedProducts.length})
            </button>
          </div>
        </div>
      </div>
    );
  })();

  // Render logic
  if (!userSession && !isAdminMode) {
    return (
      <>
        <UserSelection groups={groups} onUserSelect={handleUserSelect} onAdminAccess={handleAdminAccess} />
        {pinModal}
        {fillZerosModal}
      </>
    );
  }

  // Upewnij się, że userSession istnieje dla pozostałych widoków
  if (!userSession) {
    return null; // To nigdy nie powinno się zdarzyć, ale TypeScript tego wymaga
  }

  // Admin view
  if (currentView === 'admin' || currentView === 'admin-groups') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-blue-600" />
                Panel Administratora
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView(currentView === 'admin' ? 'admin-groups' : 'admin')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentView === 'admin' ? 'Zarządzaj grupami' : 'Statystyki ogólne'}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Wyloguj
                </button>
              </div>
            </div>
          </div>
          
          {currentView === 'admin-groups' ? (
            <AdminGroupManagement 
              groups={groups}
              products={products}
              inventoryData={inventoryData}
              comparisonData={comparisonData}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statystyki ogólne inwentaryzacji</h2>
              <p className="text-gray-600">Panel statystyk będzie dostępny wkrótce...</p>
            </div>
          )}
        </div>
        {pinModal}
        {fillZerosModal}
      </div>
    );
  }

  // Comparison view
  if (currentView === 'comparison') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <ComparisonView
            products={products}
            inventoryData={inventoryData}
            userSession={userSession}
            groups={groups}
            onBackToUser={handleBackToUser}
            onEditProduct={(product) => {
              setSelectedProduct(product);
              setCurrentView('user');
            }}
          />
        </div>
        {pinModal}
        {fillZerosModal}
      </div>
    );
  }

  // User counting view
  const progress = getCurrentGroupProgress();
  const userGroup = groups.find(g => g.id === userSession.groupId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="text-blue-600" />
              {userGroup?.name || 'Inwentaryzacja'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-700">
                  {userSession.personName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Wyloguj
              </button>
            </div>
          </div>
          
{!isAdminMode && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Twój postęp w grupie: <span className="font-bold text-blue-600">{formatNumber(progress.counted)}/{formatNumber(progress.total)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {progress.total > 0 ? Math.round((progress.counted / progress.total) * 100) : 0}% ukończone
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.counted / progress.total) * 100 : 0}%` }}
                ></div>
              </div>
            </>
          )}
        </div>

        {/* Views */}
        {!isAdminMode && (
          <>
            {!selectedProduct ? (
              <CounterSearchView 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchType={searchType}
                setSearchType={setSearchType}
                filteredProducts={filteredProducts}
                inventoryData={inventoryData}
                inventoryHistory={inventoryHistory}
                getProductStatus={getProductStatus}
                handleProductSelect={handleProductSelect}
                handleKeyPress={handleKeyPress}
                searchInputRef={searchInputRef}
                userSession={userSession}
                onCompareResults={handleCompareResults}
              />
            ) : (
              <CounterInputView 
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inventoryData={inventoryData}
                inventoryHistory={inventoryHistory}
                handleQuantitySubmit={handleQuantitySubmit}
                handleKeyPress={handleKeyPress}
                updateHistoryEntry={updateHistoryEntry}
                deleteHistoryEntry={deleteHistoryEntry}
                quantityInputRef={quantityInputRef}
                userSession={userSession}
              />
            )}
          </>
        )}

        {pinModal}
        {fillZerosModal}
      </div>
    </div>
  );
};

export default App;