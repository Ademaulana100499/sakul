export type Role = 'superadmin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initialBalance: number;
  currentBalance: number;
  avatar: string;
}

export type BeverageShape = 'bottle' | 'can' | 'box' | 'yakult';

export interface Style3D {
  shape: BeverageShape;
  bodyColor: string;
  labelColor: string;
  stripeColor: string;
  capColor?: string;
  metal: number;
  rough: number;
  trans: number;
  shortLabel?: string;
  hpBoost?: string;
  tagline?: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'Teh & Kopi' | 'Isotonik & Vitamin' | 'Susu' | 'Air & Lainnya';
  icon: string; // Emoji or visual identifier
  bgGradient: string;
  style3D?: Style3D;
  isAddSlot?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  total: number;
  timestamp: string;
}
