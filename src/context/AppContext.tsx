'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Item, Transaction } from '../types';
import { INITIAL_USERS, INITIAL_ITEMS, INITIAL_TRANSACTIONS } from '../data/dummy';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchUsersFromDb,
  fetchItemsFromDb,
  fetchTransactionsFromDb,
  insertUserToDb,
  updateUserInDb,
  deleteUserFromDb,
  insertItemToDb,
  updateItemInDb,
  deleteItemFromDb,
  executeTakeItemInDb,
  ensureAdminExistsInDb,
  mapDbUserToUser,
  mapDbItemToItem,
  mapDbTransactionToTransaction
} from '../services/supabaseService';

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
  addUser: (newUser: Omit<User, 'id'>) => void;
  updateUser: (userId: string, data: Partial<Omit<User, 'id' | 'role'>>) => { success: boolean; message: string };
  deleteUser: (userId: string) => { success: boolean; message: string };
  resetToDefault: () => void;
  refreshData: () => Promise<void>;
  isClient: boolean;
  isLoading: boolean;
  isSupabaseActive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load and sync from Supabase
  const loadDatabaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Ensure admin user exists in DB
        await ensureAdminExistsInDb();

        const [dbUsers, dbItems, dbTrx] = await Promise.all([
          fetchUsersFromDb(),
          fetchItemsFromDb(),
          fetchTransactionsFromDb()
        ]);

        setUsers(dbUsers.length > 0 ? dbUsers : INITIAL_USERS);
        setItems(dbItems);
        setTransactions(dbTrx);
      } else {
        // Fallback to localStorage if Supabase is not yet configured
        const savedUsers = localStorage.getItem('sakul_users');
        const savedItems = localStorage.getItem('sakul_items');
        const savedTrx = localStorage.getItem('sakul_trx');

        if (savedUsers) setUsers(JSON.parse(savedUsers));
        if (savedItems) setItems(JSON.parse(savedItems));
        if (savedTrx) setTransactions(JSON.parse(savedTrx));
      }
    } catch (err) {
      console.warn('Database initialization error, using local fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadDatabaseData();
    localStorage.removeItem('sakul_current_user_id');
  }, [loadDatabaseData]);

  // Supabase Realtime Subscription for instant live multi-device updates
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('sakul-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newUser = mapDbUserToUser(payload.new as any);
            setUsers((prev) => (prev.some((u) => u.id === newUser.id) ? prev : [...prev, newUser]));
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbUserToUser(payload.new as any);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setCurrentUser((curr) => (curr && curr.id === updated.id ? updated : curr));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setUsers((prev) => prev.filter((u) => u.id !== deletedId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = mapDbItemToItem(payload.new as any);
            setItems((prev) => (prev.some((i) => i.id === newItem.id) ? prev : [newItem, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbItemToItem(payload.new as any);
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setItems((prev) => prev.filter((i) => i.id !== deletedId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTrx = mapDbTransactionToTransaction(payload.new as any);
            setTransactions((prev) => (prev.some((t) => t.id === newTrx.id) ? prev : [newTrx, ...prev]));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Backup sync to localStorage for offline robustness
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('sakul_users', JSON.stringify(users));
      localStorage.setItem('sakul_items', JSON.stringify(items));
      localStorage.setItem('sakul_trx', JSON.stringify(transactions));
    }
  }, [users, items, transactions, isClient]);

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

    const newBalance = currentUser.currentBalance - item.price;
    const newStock = item.stock - 1;

    // Optimistic UI updates
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, currentBalance: newBalance } : u);
    const updatedItems = items.map(i => i.id === itemId ? { ...i, stock: newStock } : i);

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

    // Persist to Supabase asynchronously
    executeTakeItemInDb(currentUser, item, newBalance, newStock, newTrx);

    return { success: true, message: `Berhasil mengambil 1 ${item.name}! Saldo berkurang Rp ${item.price.toLocaleString('id-ID')}.` };
  };

  const updateStock = (itemId: string, delta: number) => {
    const target = items.find(i => i.id === itemId);
    if (!target) return;
    const newStock = Math.max(0, target.stock + delta);

    setItems(prev => prev.map(item => item.id === itemId ? { ...item, stock: newStock } : item));
    updateItemInDb(itemId, { stock: newStock });
  };

  const addItem = (newItem: Omit<Item, 'id'>) => {
    const item: Item = {
      ...newItem,
      id: `item-${Date.now()}`
    };
    setItems(prev => [...prev, item]);
    insertItemToDb(item);
  };

  const updateItem = (itemId: string, updatedItem: Partial<Item>) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updatedItem } : item));
    updateItemInDb(itemId, updatedItem);
  };

  const deleteItem = (itemId: string) => {
    const target = items.find(i => i.id === itemId);
    if (!target) return { success: false, message: 'Barang tidak ditemukan!' };

    setItems(prev => prev.filter(i => i.id !== itemId));
    deleteItemFromDb(itemId);
    return { success: true, message: `Berhasil menghapus produk "${target.name}" dari katalog kulkas!` };
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const user: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      pin: newUser.pin || '123456'
    };
    setUsers(prev => [...prev, user]);
    insertUserToDb(user);
  };

  const updateUser = (userId: string, data: Partial<Omit<User, 'id' | 'role'>>) => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'User tidak ditemukan!' };

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    updateUserInDb(userId, data);
    return { success: true, message: `Data "${target.name}" berhasil diperbarui!` };
  };

  const deleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'User tidak ditemukan!' };
    if (target.role === 'superadmin') return { success: false, message: 'Tidak dapat menghapus akun Admin!' };

    setUsers(prev => prev.filter(u => u.id !== userId));
    deleteUserFromDb(userId);
    return { success: true, message: `Berhasil menghapus user "${target.name}"!` };
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
      addUser,
      updateUser,
      deleteUser,
      resetToDefault,
      refreshData: loadDatabaseData,
      isClient,
      isLoading,
      isSupabaseActive: isSupabaseConfigured
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
