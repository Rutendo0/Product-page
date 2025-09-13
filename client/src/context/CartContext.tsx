import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { Product } from "@shared/schema";

export type CartItem = { product: Product; quantity: number };

type CartContextType = {
  items: CartItem[];
  count: number; // total quantity
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("cart:v1");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart:v1", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.productId === product.productId);
      if (existing) {
        return prev.map(i =>
          i.product.productId === product.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const count = useMemo(() => items.reduce((t, i) => t + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((t, i) => t + i.product.price * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, addToCart, removeFromCart, clearCart }),
    [items, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};