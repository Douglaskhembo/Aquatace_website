import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./products";

export interface CartLine {
  product: Product;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "aquatacet.cart.v1";

export function CartProvider({ children, allProducts }: { children: ReactNode; allProducts: Product[] }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  // hydrate after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as { id: string; qty: number }[];
      const restored: CartLine[] = [];
      for (const s of stored) {
        const p = allProducts.find((x) => x.id === s.id);
        if (p) restored.push({ product: p, qty: s.qty });
      }
      setLines(restored);
    } catch { /* ignore */ }
  }, [allProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines.map((l) => ({ id: l.product.id, qty: l.qty }))));
    } catch { /* ignore */ }
  }, [lines]);

  const value = useMemo<CartCtx>(() => ({
    lines,
    add: (product, qty = 1) => setLines((prev) => {
      const idx = prev.findIndex((l) => l.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { product, qty }];
    }),
    remove: (id) => setLines((prev) => prev.filter((l) => l.product.id !== id)),
    setQty: (id, qty) => setLines((prev) => prev.map((l) => l.product.id === id ? { ...l, qty: Math.max(1, qty) } : l)),
    clear: () => setLines([]),
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
  }), [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
