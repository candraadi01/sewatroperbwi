"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  duration?: string;
  capacity?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sewa_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("sewa_cart", JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  };

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const existingIndex = items.findIndex((i) => i.id === item.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [...items, { ...item, quantity: 1 }];
    }
    saveCart(updated);
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    saveCart(updated);
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    const updated = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      totalPrice: 0,
      isCartOpen: false,
      setIsCartOpen: () => {},
    };
  }
  return context;
}
