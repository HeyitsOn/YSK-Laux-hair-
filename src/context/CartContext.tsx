import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product, ProductVariant } from '../types';
import { cartSubtotal } from '../utils/whatsapp';
import { cartReducer } from './cartReducer';

const STORAGE_KEY = 'ysk-cart-v1';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  lastAdded: { name: string; id: number } | null;
  addItem: (product: Product, variant: ProductVariant) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartContextValue['lastAdded']>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode) — the cart still works for this visit.
    }
  }, [items]);

  const addItem = useCallback((product: Product, variant: ProductVariant) => {
    dispatch({ type: 'add', product, variant });
    setLastAdded({ name: `${product.name} (${variant.label})`, id: Date.now() });
  }, []);

  const dismissToast = useCallback(() => setLastAdded(null), []);
  const openCart = useCallback(() => {
    setLastAdded(null);
    setIsOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartSubtotal(items),
      isOpen,
      lastAdded,
      addItem,
      removeItem: (key) => dispatch({ type: 'remove', key }),
      setQuantity: (key, quantity) => dispatch({ type: 'setQuantity', key, quantity }),
      clearCart: () => dispatch({ type: 'clear' }),
      openCart,
      closeCart,
      dismissToast,
    }),
    [items, isOpen, lastAdded, addItem, openCart, closeCart, dismissToast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
