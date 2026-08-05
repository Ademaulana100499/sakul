import { User, Item, Transaction } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Super Admin Kulkas',
    email: 'admin@sakul.id',
    role: 'superadmin',
    initialBalance: 0,
    currentBalance: 0,
    avatar: '👨‍💼',
    pin: '123456'
  }
];

export const INITIAL_ITEMS: Item[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
