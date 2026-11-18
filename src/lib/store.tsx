"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CartItem = {
  productId: number;
  size: number;
  quantity: number;
};

type StoreContextValue = {
  cart: CartItem[];
  cartOpen: boolean;
  ready: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: number, size?: number, quantity?: number) => void;
  updateCart: (productId: number, size: number, direction: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "rythm_cart";
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setCart(parsed);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, ready]);

  const addToCart = (productId: number, size = 42, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId && item.size === size);
      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item,
        );
      }
      return [...current, { productId, size, quantity }];
    });
    setCartOpen(true);
  };

  const updateCart = (productId: number, size: number, direction: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: Math.min(10, item.quantity + direction) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // Kosongkan keranjang saat logout (sinyal dikirim dari AccountMenu)
  useEffect(() => {
    const onSessionChange = () => {
      setCart([]);
      setCartOpen(false);
    };
    window.addEventListener("rythm:session-change", onSessionChange);
    return () => window.removeEventListener("rythm:session-change", onSessionChange);
  }, []);

  const clearCart = () => setCart([]);

  return (
    <StoreContext.Provider
      value={{ cart, cartOpen, ready, setCartOpen, addToCart, updateCart, clearCart }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
