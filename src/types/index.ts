// Supplier types
export interface Supplier {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
}

// Supplier pricing for a part
export interface SupplierPrice {
  supplierId: string;
  price: number;
  stock: number;
}

// Part types
export interface Part {
  id: string;
  partNumber: string;
  name: string;
  nameAr: string;
  brand: string;
  category: string;
  price: number; // Default/first supplier price
  stock: number; // Default/first supplier stock
  unit: string;
  image?: string;
  supplierPrices?: SupplierPrice[]; // Multiple supplier options
}

// Cart item with supplier selection
export interface CartItem {
  part: Part;
  quantity: number;
  supplierId?: string; // Selected supplier
  supplierPrice?: number; // Price from selected supplier
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
  supplierId?: string;
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
  supplierId?: string; // Order is per supplier
  supplierName?: string;
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
  creditTermDays: 60 | 90; // Payment terms in days
  usedCredit: number; // Current used credit amount
}
