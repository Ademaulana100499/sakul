'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, Transaction } from '../types';
import { INITIAL_USERS, INITIAL_ITEMS, INITIAL_TRANSACTIONS } from '../data/dummy';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  items: Item[];
  transactions: Transaction[];
  login: (userId: string) => void;
  logout: () => void;
  takeItem: (itemId: string) => { success: boolean; message: string };
  updateStock: (itemId: string, delta: number) => void;
  addItem: (newItem: Omit<Item, 'id'>) => void;
  updateItem: (itemId: string, updatedItem: Partial<Item>) => void;
  deleteItem: (itemId: string) => { success: boolean; message: string };
  resetToDefault: () => void;
  isClient: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on client init (Never persist login session)
  useEffect(() => {
    setIsClient(true);
    const savedUsers = localStorage.getItem('sakul_users');
    const savedItems = localStorage.getItem('sakul_items');
    const savedTrx = localStorage.getItem('sakul_trx');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedTrx) setTransactions(JSON.parse(savedTrx));

    // Clear any persistent user ID to require fresh login every refresh
    localStorage.removeItem('sakul_current_user_id');
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('sakul_users', JSON.stringify(users));
    }
  }, [users, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('sakul_items', JSON.stringify(items));
    }
  }, [items, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('sakul_trx', JSON.stringify(transactions));
    }
  }, [transactions, isClient]);

  const login = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sakul_current_user_id');
  };

  const takeItem = (itemId: string) => {
    if (!currentUser || currentUser.role === 'superadmin') {
      return { success: false, message: 'Harap login sebagai pegawai untuk mengambil barang.' };
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Barang tidak ditemukan.' };
    if (item.stock <= 0) return { success: false, message: 'Stok minuman ini habis di kulkas!' };
    if (currentUser.currentBalance < item.price) {
      return { success: false, message: `Saldo Anda (Rp ${currentUser.currentBalance.toLocaleString('id-ID')}) tidak cukup untuk mengambil ${item.name} (Rp ${item.price.toLocaleString('id-ID')}).` };
    }

    // Update User balance
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, currentBalance: u.currentBalance - item.price };
      }
      return u;
    });

    // Update Item stock
    const updatedItems = items.map(i => {
      if (i.id === itemId) {
        return { ...i, stock: i.stock - 1 };
      }
      return i;
    });

    // Add transaction log
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      quantity: 1,
      total: item.price,
      timestamp: formattedDate
    };

    setUsers(updatedUsers);
    setItems(updatedItems);
    setTransactions([newTrx, ...transactions]);

    const updatedCurrent = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedCurrent) setCurrentUser(updatedCurrent);

    return { success: true, message: `Berhasil mengambil 1 ${item.name}! Saldo berkurang Rp ${item.price.toLocaleString('id-ID')}.` };
  };

  const updateStock = (itemId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + delta);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const addItem = (newItem: Omit<Item, 'id'>) => {
    const item: Item = {
      ...newItem,
      id: `item-${Date.now()}`
    };
    setItems(prev => [item, ...prev]);
  };

  const updateItem = (itemId: string, updatedItem: Partial<Item>) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updatedItem } : item));
  };

  const deleteItem = (itemId: string) => {
    const target = items.find(i => i.id === itemId);
    if (!target) return { success: false, message: 'Barang tidak ditemukan!' };

    setItems(prev => prev.filter(i => i.id !== itemId));
    return { success: true, message: `Berhasil menghapus produk "${target.name}" dari katalog kulkas!` };
  };

  const resetToDefault = () => {
    setUsers(INITIAL_USERS);
    setItems(INITIAL_ITEMS);
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.removeItem('sakul_users');
    localStorage.removeItem('sakul_items');
    localStorage.removeItem('sakul_trx');
    localStorage.removeItem('sakul_current_user_id');
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      items,
      transactions,
      login,
      logout,
      takeItem,
      updateStock,
      addItem,
      updateItem,
      deleteItem,
      resetToDefault,
      isClient
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
