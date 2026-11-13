"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "./data";

export type CartLine = {
  productId: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  items: { product: Product; qty: number }[];
  subtotal: number;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "sanaa.demo.cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, hydrated]);

  const add = (productId: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { productId, qty }];
    });
  };

  const remove = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  };

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) return remove(productId);
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, qty } : l))
    );
  };

  const clear = () => setLines([]);

  const items = useMemo(
    () =>
      lines
        .map((l) => {
          const product = products.find((p) => p.id === l.productId);
          return product ? { product, qty: l.qty } : null;
        })
        .filter((v): v is { product: Product; qty: number } => v !== null),
    [lines]
  );

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.product.price, 0);

  const value = useMemo(
    () => ({ lines, add, remove, setQty, clear, count, items, subtotal }),
    [lines, count, items, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
