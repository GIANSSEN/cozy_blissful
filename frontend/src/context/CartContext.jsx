import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
};

export const peso = (n) => `\u20B1${Number(n || 0).toLocaleString()}`;

const STORAGE_KEY = 'cb_cart_v1';
export const MAX_QTY = 20;

const loadInitialCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.id === 'string' && Number(i.qty) > 0);
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadInitialCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart stays in-memory */
    }
  }, [items]);

  const addItem = useCallback((service, categoryMeta) => {
    if (!service || !service.id) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === service.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(Number(next[idx].qty) + 1, MAX_QTY) };
        return next;
      }
      return [
        ...prev,
        {
          id: service.id,
          name: service.name || 'Service',
          price: Math.max(0, Math.round(Number(service.price) || 0)),
          dur: service.dur || '',
          img: service.img || '',
          desc: service.desc || '',
          category: categoryMeta?.key || '',
          categoryLabel: categoryMeta?.label || '',
          categoryIcon: categoryMeta?.icon || '',
          qty: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    const q = Math.round(Number(qty));
    setItems((prev) => {
      if (q <= 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: Math.min(q, MAX_QTY) } : i));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const count = useMemo(() => items.reduce((a, i) => a + Number(i.qty || 0), 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((a, i) => a + Number(i.price || 0) * Number(i.qty || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [items, isOpen, count, subtotal, addItem, removeItem, updateQty, clearCart, openCart, closeCart, toggleCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
