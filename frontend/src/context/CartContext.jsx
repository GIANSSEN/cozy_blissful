import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'cozy_blissful_cart_v1';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);
  const { toast } = useToast();

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = useCallback((service) => {
    if (!service || !service.id) return;

    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === service.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: (updated[existingIdx].quantity || 1) + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: service.id,
          name: service.name,
          price: service.price || 0,
          priceLabel: service.priceLabel || (service.price ? `₱${service.price.toLocaleString()}` : 'Inquire'),
          duration: service.duration || '1 hr',
          photo: service.photo || '',
          description: service.description || '',
          quantity: 1,
        },
      ];
    });

    setLastAddedId(service.id);
    setTimeout(() => setLastAddedId(null), 1200);

    if (toast?.success) {
      toast.success(`${service.name} added to cart`, {
        title: 'Added to Cart',
        duration: 2500,
      });
    }
  }, [toast]);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = (item.quantity || 1) + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      totalCount,
      totalPrice,
      lastAddedId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      setIsOpen,
    }),
    [
      items,
      isOpen,
      totalCount,
      totalPrice,
      lastAddedId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a <CartProvider>');
  }
  return context;
};
