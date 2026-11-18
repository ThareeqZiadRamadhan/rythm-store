"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartProduct } from "@/lib/catalog-types";

export type CartItem = CartProduct & {
  size: number;
  quantity: number;
};

type StoreContextValue = {
  cart: CartItem[];
  cartOpen: boolean;
  ready: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: CartProduct, size: number, quantity?: number) => void;
  updateCart: (slug: string, size: number, direction: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "rythm_cart_v2";
const StoreContext = createContext<StoreContextValue | null>(null);

function isCartItem(x: unknown): x is CartItem {
  const i = x as CartItem;
  return (
    !!i &&
    typeof i.slug === "string" &&
    typeof i.name === "string" &&
    typeof i.price === "number" &&
    typeof i.size === "number" &&
    typeof i.quantity === "number"
  );
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("rythm_cart"); // format lama
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setCart(parsed.filter(isCartItem));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, ready]);

  // Kosongkan keranjang saat logout (sinyal dikirim dari AccountMenu)
  useEffect(() => {
    const onSessionChange = () => {
      setCart([]);
      setCartOpen(false);
    };
    window.addEventListener("rythm:session-change", onSessionChange);
    return () => window.removeEventListener("rythm:session-change", onSessionChange);
  }, []);

  const addToCart = (product: CartProduct, size: number, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((i) => i.slug === product.slug && i.size === size);
      if (existing) {
        return current.map((i) =>
          i === existing
            ? { ...i, ...product, quantity: Math.min(10, i.quantity + quantity) }
            : i,
        );
      }
      return [...current, { ...product, size, quantity }];
    });
    setCartOpen(true);
  };

  const updateCart = (slug: string, size: number, direction: number) => {
    setCart((current) =>
      current
        .map((i) =>
          i.slug === slug && i.size === size
            ? { ...i, quantity: Math.min(10, i.quantity + direction) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

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
