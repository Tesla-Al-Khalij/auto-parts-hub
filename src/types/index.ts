// Part types
export interface Part {
  id: string;
  partNumber: string;
  name: string;
  nameAr: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  image?: string;
}

// Cart item
export interface CartItem {
  part: Part;
  quantity: number;
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  partId: string;
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  notes?: string;
  isDraft: boolean;
}

// Transaction types
export type TransactionType = 'sale' | 'return' | 'payment';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  reference: string;
  description: string;
  amount: number;
  balance: number;
}

// User profile
export interface UserProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  taxNumber?: string;
  balance: number;
  creditLimit: number;
}
