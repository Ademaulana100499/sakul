import { User, Item, Transaction } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Super Admin Kulkas',
    email: 'admin@sakul.id',
    role: 'superadmin',
    initialBalance: 0,
    currentBalance: 0,
    avatar: '👨‍💼'
  },
  {
    id: 'user-1',
    name: 'Ade',
    email: 'ade@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 67500, // Sudah ambil 1 Yakult
    avatar: '🧑‍💻'
  },
  {
    id: 'user-2',
    name: 'Ahdi',
    email: 'ahdi@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 63500, // Sudah ambil 1 Hydro Coco
    avatar: '👨‍🔧'
  },
  {
    id: 'user-3',
    name: 'Arip',
    email: 'arip@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '👨‍🏫'
  },
  {
    id: 'user-4',
    name: 'Bagir',
    email: 'bagir@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '👨‍🔬'
  },
  {
    id: 'user-5',
    name: 'Faiz',
    email: 'faiz@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '👨‍🎨'
  },
  {
    id: 'user-6',
    name: 'Helmy',
    email: 'helmy@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 68500, // Sudah ambil 1 Ron 88
    avatar: '👨‍🚀'
  },
  {
    id: 'user-7',
    name: 'Ilham',
    email: 'ilham@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '👨‍💻'
  },
  {
    id: 'user-8',
    name: 'Malik',
    email: 'malik@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '🧑‍🎤'
  },
  {
    id: 'user-9',
    name: 'Nael',
    email: 'nael@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 67500, // Sudah ambil 1 Yakult
    avatar: '👨‍🍳'
  },
  {
    id: 'user-10',
    name: 'Putra',
    email: 'putra@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 57000, // Sudah ambil 2 Nescafe Kaleng
    avatar: '👨‍✈️'
  },
  {
    id: 'user-11',
    name: 'Rara',
    email: 'rara@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '👩‍💼'
  },
  {
    id: 'user-12',
    name: 'Riky',
    email: 'riky@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '🧑‍🔧'
  },
  {
    id: 'user-13',
    name: 'Ruli',
    email: 'ruli@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 70000,
    avatar: '👨‍⚖️'
  },
  {
    id: 'user-14',
    name: 'Yusril',
    email: 'yusril@sakul.id',
    role: 'user',
    initialBalance: 70000,
    currentBalance: 68500, // Sudah ambil 1 Ron 88
    avatar: '👨‍💻'
  },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-1',
    name: 'Pocari Sweat',
    price: 7000,
    stock: 12,
    category: 'Isotonik & Vitamin',
    icon: '🏃‍♂️',
    bgGradient: 'from-blue-500/20 via-blue-400/10 to-blue-600/20 border-blue-400/30 text-blue-400'
  },
  {
    id: 'item-2',
    name: 'STee',
    price: 2500,
    stock: 18,
    category: 'Teh & Kopi',
    icon: '🍵',
    bgGradient: 'from-amber-600/20 via-amber-500/10 to-amber-700/20 border-amber-500/30 text-amber-400'
  },
  {
    id: 'item-3',
    name: 'Pucuk Less Sugar',
    price: 3000,
    stock: 15,
    category: 'Teh & Kopi',
    icon: '🍃',
    bgGradient: 'from-emerald-500/20 via-emerald-400/10 to-emerald-600/20 border-emerald-400/30 text-emerald-400'
  },
  {
    id: 'item-4',
    name: 'Bird Nest Cap Panda Kaleng',
    price: 5500,
    stock: 8,
    category: 'Air & Lainnya',
    icon: '🐼',
    bgGradient: 'from-zinc-400/20 via-zinc-300/10 to-zinc-500/20 border-zinc-400/30 text-zinc-300'
  },
  {
    id: 'item-5',
    name: 'Golda Dolce Latte & Cappucino',
    price: 3000,
    stock: 20,
    category: 'Teh & Kopi',
    icon: '☕',
    bgGradient: 'from-orange-500/20 via-orange-400/10 to-orange-600/20 border-orange-400/30 text-orange-400'
  },
  {
    id: 'item-6',
    name: 'ABC Kopi Susu & Chocomalt',
    price: 3500,
    stock: 14,
    category: 'Teh & Kopi',
    icon: '🥤',
    bgGradient: 'from-amber-700/20 via-amber-600/10 to-amber-800/20 border-amber-600/30 text-amber-500'
  },
  {
    id: 'item-7',
    name: 'Yakult All Varian',
    price: 2500,
    stock: 30,
    category: 'Susu',
    icon: '🧃',
    bgGradient: 'from-red-500/20 via-rose-400/10 to-red-600/20 border-red-400/30 text-red-400'
  },
  {
    id: 'item-8',
    name: 'You C 1000 Kaca',
    price: 5500,
    stock: 10,
    category: 'Isotonik & Vitamin',
    icon: '🍊',
    bgGradient: 'from-amber-400/20 via-yellow-400/10 to-amber-500/20 border-yellow-400/30 text-yellow-400'
  },
  {
    id: 'item-9',
    name: 'Ultra Milk Low Fat',
    price: 4000,
    stock: 16,
    category: 'Susu',
    icon: '🥛',
    bgGradient: 'from-cyan-500/20 via-cyan-400/10 to-sky-600/20 border-cyan-400/30 text-cyan-400'
  },
  {
    id: 'item-10',
    name: 'Nescafe Kaleng All Varian',
    price: 6500,
    stock: 12,
    category: 'Teh & Kopi',
    icon: '🥫',
    bgGradient: 'from-red-600/20 via-red-500/10 to-rose-700/20 border-red-500/30 text-red-400'
  },
  {
    id: 'item-11',
    name: 'Hydro Coco',
    price: 6500,
    stock: 10,
    category: 'Isotonik & Vitamin',
    icon: '🥥',
    bgGradient: 'from-teal-500/20 via-emerald-400/10 to-green-600/20 border-teal-400/30 text-teal-400'
  },
  {
    id: 'item-12',
    name: 'You C 1000 500ml',
    price: 7000,
    stock: 9,
    category: 'Isotonik & Vitamin',
    icon: '🍋',
    bgGradient: 'from-yellow-400/20 via-amber-300/10 to-orange-500/20 border-yellow-400/30 text-amber-300'
  },
  {
    id: 'item-13',
    name: 'Ron 88 Air Mineral',
    price: 1500,
    stock: 24,
    category: 'Air & Lainnya',
    icon: '💧',
    bgGradient: 'from-blue-400/20 via-sky-300/10 to-blue-500/20 border-sky-400/30 text-sky-300'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    userId: 'user-1',
    userName: 'Ade',
    itemId: 'item-7',
    itemName: 'Yakult All Varian',
    price: 2500,
    quantity: 1,
    total: 2500,
    timestamp: '2026-08-03 10:15'
  },
  {
    id: 'trx-2',
    userId: 'user-2',
    userName: 'Ahdi',
    itemId: 'item-11',
    itemName: 'Hydro Coco',
    price: 6500,
    quantity: 1,
    total: 6500,
    timestamp: '2026-08-03 11:20'
  },
  {
    id: 'trx-3',
    userId: 'user-10',
    userName: 'Putra',
    itemId: 'item-10',
    itemName: 'Nescafe Kaleng All Varian',
    price: 6500,
    quantity: 2,
    total: 13000,
    timestamp: '2026-08-03 13:05'
  },
  {
    id: 'trx-4',
    userId: 'user-9',
    userName: 'Nael',
    itemId: 'item-7',
    itemName: 'Yakult All Varian',
    price: 2500,
    quantity: 1,
    total: 2500,
    timestamp: '2026-08-03 13:30'
  }
];
