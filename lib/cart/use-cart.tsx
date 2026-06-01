'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // productId
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
  weightGram: number;
  stock: number;
  slug: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => { success: boolean; error?: string };
  removeFromCart: (id: string, variantId: string | null) => void;
  updateQuantity: (id: string, variantId: string | null, quantity: number) => { success: boolean; error?: string };
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  totalWeight: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ 
  children, 
  subdomain 
}: { 
  children: React.ReactNode; 
  subdomain: string;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const localStorageKey = `daganta_cart_${subdomain.toLowerCase().trim()}`;

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, [localStorageKey]);

  // Persist cart to localStorage on changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems, localStorageKey, isHydrated]);

  // Add to cart logic
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantityToAdd: number) => {
    let success = true;
    let error = '';

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.id === item.id && i.variantId === item.variantId
      );

      if (existingIdx > -1) {
        const existing = prev[existingIdx];
        const newQty = existing.quantity + quantityToAdd;
        
        // Cek batasan stok
        if (newQty > item.stock) {
          success = false;
          error = `Kuantitas melebihi stok yang tersedia (${item.stock} unit).`;
          return prev;
        }

        const updated = [...prev];
        updated[existingIdx] = { ...existing, quantity: newQty };
        return updated;
      } else {
        // Cek batasan stok baru
        if (quantityToAdd > item.stock) {
          success = false;
          error = `Kuantitas melebihi stok yang tersedia (${item.stock} unit).`;
          return prev;
        }

        return [...prev, { ...item, quantity: quantityToAdd }];
      }
    });

    return { success, error: error || undefined };
  };

  // Remove from cart logic
  const removeFromCart = (id: string, variantId: string | null) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.variantId === variantId)));
  };

  // Update quantity logic
  const updateQuantity = (id: string, variantId: string | null, newQty: number) => {
    let success = true;
    let error = '';

    if (newQty <= 0) {
      removeFromCart(id, variantId);
      return { success };
    }

    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id && i.variantId === variantId);
      if (idx === -1) {
        success = false;
        error = 'Item tidak ditemukan di keranjang.';
        return prev;
      }

      const item = prev[idx];
      if (newQty > item.stock) {
        success = false;
        error = `Stok tidak mencukupi. Stok maksimal: ${item.stock} unit.`;
        return prev;
      }

      const updated = [...prev];
      updated[idx] = { ...item, quantity: newQty };
      return updated;
    });

    return { success, error: error || undefined };
  };

  // Clear cart logic
  const clearCart = () => {
    setCartItems([]);
  };

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalWeight = cartItems.reduce((acc, item) => acc + item.weightGram * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      totalItems,
      totalWeight,
      isHydrated
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
