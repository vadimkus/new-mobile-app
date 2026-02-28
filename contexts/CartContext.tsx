import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../utils/logger';

const log = createLogger('Cart');
const CART_KEY = '@genosys_cart';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  currency: string;
  imageUrl?: string;
  quantity: number;
  variant?: string;
  size?: string;
}

export interface LastAddedInfo {
  name: string;
  imageUrl?: string;
  addedAt: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  lastAdded: LastAddedInfo | null;
}

const CartContext = createContext<CartState>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
  lastAdded: null,
});

export const useCart = () => useContext(CartContext);

const cartKey = (item: { id: string; variant?: string }) => `${item.id}_${item.variant || 'default'}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState<LastAddedInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch (e: any) {
        log.warn('Failed to restore cart', e?.message);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const key = cartKey(product);
      const existing = prev.find((i) => cartKey(i) === key);
      if (existing) {
        return prev.map((i) => cartKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
    setLastAdded({ name: product.name, imageUrl: product.imageUrl, addedAt: Date.now() });
  }, []);

  const removeItem = useCallback((id: string, variant?: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== cartKey({ id, variant })));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      removeItem(id, variant);
      return;
    }
    setItems((prev) =>
      prev.map((i) => cartKey(i) === cartKey({ id, variant }) ? { ...i, quantity } : i),
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, lastAdded }}>
      {children}
    </CartContext.Provider>
  );
}
