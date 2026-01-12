import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Part, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (part: Part, quantity: number, supplierId?: string, supplierPrice?: number) => void;
  updateQuantity: (partId: string, quantity: number, supplierId?: string) => void;
  removeItem: (partId: string, supplierId?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  vat: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Generate unique key for cart item (part + supplier combo)
  const getItemKey = (partId: string, supplierId?: string) => 
    supplierId ? `${partId}-${supplierId}` : partId;

  const addItem = useCallback((part: Part, quantity: number, supplierId?: string, supplierPrice?: number) => {
    setItems(prev => {
      // Find existing item with same part AND supplier
      const existing = prev.find(item => 
        item.part.id === part.id && item.supplierId === supplierId
      );
      
      if (existing) {
        return prev.map(item =>
          item.part.id === part.id && item.supplierId === supplierId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { 
        part, 
        quantity, 
        supplierId,
        supplierPrice: supplierPrice || part.price 
      }];
    });
  }, []);

  const updateQuantity = useCallback((partId: string, quantity: number, supplierId?: string) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => 
        !(item.part.id === partId && item.supplierId === supplierId)
      ));
    } else {
      setItems(prev =>
        prev.map(item =>
          item.part.id === partId && item.supplierId === supplierId 
            ? { ...item, quantity } 
            : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((partId: string, supplierId?: string) => {
    setItems(prev => prev.filter(item => 
      !(item.part.id === partId && item.supplierId === supplierId)
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.supplierPrice || item.part.price;
    return sum + price * item.quantity;
  }, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        vat,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
