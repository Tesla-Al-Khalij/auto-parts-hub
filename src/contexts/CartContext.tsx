import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Part, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (part: Part, quantity: number) => void;
  updateQuantity: (partId: string, quantity: number) => void;
  removeItem: (partId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  vat: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((part: Part, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.part.id === part.id);
      if (existing) {
        return prev.map(item =>
          item.part.id === part.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { part, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((partId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.part.id !== partId));
    } else {
      setItems(prev =>
        prev.map(item =>
          item.part.id === partId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((partId: string) => {
    setItems(prev => prev.filter(item => item.part.id !== partId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.part.price * item.quantity, 0);
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
