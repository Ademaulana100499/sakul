import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Item, Transaction, Style3D } from '../types';
import { INITIAL_USERS, INITIAL_ITEMS, INITIAL_TRANSACTIONS } from '../data/dummy';

// ==============================================================================
// TYPE MAPPERS (Database snake_case <-> TypeScript camelCase)
// ==============================================================================

interface DbUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'user';
  initial_balance: number;
  current_balance: number;
  avatar: string;
  pin?: string;
}

interface DbItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'Teh & Kopi' | 'Isotonik & Vitamin' | 'Susu' | 'Air & Lainnya';
  icon: string;
  bg_gradient: string | null;
  style_3d: Style3D | null;
}

interface DbTransaction {
  id: string;
  user_id: string | null;
  user_name: string;
  item_id: string | null;
  item_name: string;
  price: number;
  quantity: number;
  total: number;
  timestamp: string;
}

export function mapDbUserToUser(u: DbUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    initialBalance: Number(u.initial_balance),
    currentBalance: Number(u.current_balance),
    avatar: u.avatar || '😊',
    pin: u.pin || '123456',
  };
}

export function mapDbItemToItem(i: DbItem): Item {
  return {
    id: i.id,
    name: i.name,
    price: Number(i.price),
    stock: Number(i.stock),
    category: i.category,
    icon: i.icon || '🥤',
    bgGradient: i.bg_gradient || 'from-cyan-500/20 via-sky-400/10 to-blue-600/20 border-cyan-400/30 text-cyan-400',
    style3D: i.style_3d || undefined,
  };
}

export function mapDbTransactionToTransaction(t: DbTransaction): Transaction {
  return {
    id: t.id,
    userId: t.user_id || 'unknown',
    userName: t.user_name,
    itemId: t.item_id || 'unknown',
    itemName: t.item_name,
    price: Number(t.price),
    quantity: Number(t.quantity),
    total: Number(t.total),
    timestamp: t.timestamp,
  };
}

// ==============================================================================
// USERS CRUD SERVICES
// ==============================================================================

export async function fetchUsersFromDb(): Promise<User[]> {
  if (!isSupabaseConfigured) return INITIAL_USERS;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('role', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetchUsers error, falling back:', error.message);
      return INITIAL_USERS;
    }
    if (!data || data.length === 0) return [];
    return data.map(mapDbUserToUser);
  } catch (err) {
    console.warn('Supabase fetchUsers exception:', err);
    return INITIAL_USERS;
  }
}

export async function insertUserToDb(user: User): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      initial_balance: user.initialBalance,
      current_balance: user.currentBalance,
      avatar: user.avatar,
      pin: user.pin || '123456',
    });
    if (error) {
      console.error('Supabase insertUser error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase insertUser exception:', err);
    return false;
  }
}

export async function updateUserInDb(userId: string, updates: Partial<Omit<User, 'id' | 'role'>>): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const dbPayload: Partial<DbUser> = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.email !== undefined) dbPayload.email = updates.email;
    if (updates.currentBalance !== undefined) dbPayload.current_balance = updates.currentBalance;
    if (updates.avatar !== undefined) dbPayload.avatar = updates.avatar;
    if (updates.pin !== undefined) dbPayload.pin = updates.pin;

    const { error } = await supabase.from('users').update(dbPayload).eq('id', userId);
    if (error) {
      console.error('Supabase updateUser error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase updateUser exception:', err);
    return false;
  }
}

export async function deleteUserFromDb(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Supabase deleteUser error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteUser exception:', err);
    return false;
  }
}

// ==============================================================================
// ITEMS CRUD SERVICES
// ==============================================================================

export async function fetchItemsFromDb(): Promise<Item[]> {
  if (!isSupabaseConfigured) return INITIAL_ITEMS;
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchItems error, falling back:', error.message);
      return INITIAL_ITEMS;
    }
    if (!data || data.length === 0) return [];
    return data.map(mapDbItemToItem);
  } catch (err) {
    console.warn('Supabase fetchItems exception:', err);
    return INITIAL_ITEMS;
  }
}

export async function insertItemToDb(item: Item): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('items').insert({
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      category: item.category,
      icon: item.icon,
      bg_gradient: item.bgGradient,
      style_3d: item.style3D || null,
    });
    if (error) {
      console.error('Supabase insertItem error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase insertItem exception:', err);
    return false;
  }
}

export async function updateItemInDb(itemId: string, updates: Partial<Item>): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const dbPayload: Partial<DbItem> = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.price !== undefined) dbPayload.price = updates.price;
    if (updates.stock !== undefined) dbPayload.stock = updates.stock;
    if (updates.category !== undefined) dbPayload.category = updates.category;
    if (updates.icon !== undefined) dbPayload.icon = updates.icon;
    if (updates.bgGradient !== undefined) dbPayload.bg_gradient = updates.bgGradient;
    if (updates.style3D !== undefined) dbPayload.style_3d = updates.style3D;

    const { error } = await supabase.from('items').update(dbPayload).eq('id', itemId);
    if (error) {
      console.error('Supabase updateItem error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase updateItem exception:', err);
    return false;
  }
}

export async function deleteItemFromDb(itemId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) {
      console.error('Supabase deleteItem error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteItem exception:', err);
    return false;
  }
}

// ==============================================================================
// TRANSACTIONS CRUD SERVICES
// ==============================================================================

export async function fetchTransactionsFromDb(): Promise<Transaction[]> {
  if (!isSupabaseConfigured) return INITIAL_TRANSACTIONS;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchTransactions error, falling back:', error.message);
      return INITIAL_TRANSACTIONS;
    }
    if (!data || data.length === 0) return [];
    return data.map(mapDbTransactionToTransaction);
  } catch (err) {
    console.warn('Supabase fetchTransactions exception:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export async function insertTransactionToDb(trx: Transaction): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('transactions').insert({
      id: trx.id,
      user_id: trx.userId,
      user_name: trx.userName,
      item_id: trx.itemId,
      item_name: trx.itemName,
      price: trx.price,
      quantity: trx.quantity,
      total: trx.total,
      timestamp: trx.timestamp,
    });
    if (error) {
      console.error('Supabase insertTransaction error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase insertTransaction exception:', err);
    return false;
  }
}

// ==============================================================================
// ATOMIC TAKE ITEM OPERATION (Update User Balance + Item Stock + Insert Transaction)
// ==============================================================================

export async function executeTakeItemInDb(
  user: User,
  item: Item,
  newBalance: number,
  newStock: number,
  trx: Transaction
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    // 1. Update user balance
    const p1 = supabase.from('users').update({ current_balance: newBalance }).eq('id', user.id);
    // 2. Update item stock
    const p2 = supabase.from('items').update({ stock: newStock }).eq('id', item.id);
    // 3. Insert transaction
    const p3 = supabase.from('transactions').insert({
      id: trx.id,
      user_id: trx.userId,
      user_name: trx.userName,
      item_id: trx.itemId,
      item_name: trx.itemName,
      price: trx.price,
      quantity: trx.quantity,
      total: trx.total,
      timestamp: trx.timestamp,
    });

    const results = await Promise.all([p1, p2, p3]);
    const hasError = results.some(r => r.error);
    if (hasError) {
      console.error('Supabase executeTakeItem partial error:', results.map(r => r.error));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase executeTakeItem exception:', err);
    return false;
  }
}

// ==============================================================================
// ENSURE ADMIN USER EXISTS IN DATABASE (NO DUMMY PRODUCTS OR USERS)
// ==============================================================================

export async function ensureAdminExistsInDb(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const adminUser = INITIAL_USERS[0];
    if (!adminUser) return;

    await supabase.from('users').upsert({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      initial_balance: adminUser.initialBalance,
      current_balance: adminUser.currentBalance,
      avatar: adminUser.avatar,
      pin: adminUser.pin || '123456',
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('ensureAdminExists exception:', err);
  }
}
