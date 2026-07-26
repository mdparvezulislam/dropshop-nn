"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Client-side cart store for the public storefront.
 *
 * Prices here are display-only (BDT) — the checkout pipeline re-resolves
 * every price server-side through the pricing engine, so nothing stored in
 * the browser is ever trusted as a price authority.
 */
export interface LocalCartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** BDT display price at the time of adding. */
  unitPrice: number;
  quantity: number;
  variantSku?: string;
  /** Human label of the chosen variant, e.g. "Black / 128GB". */
  variantLabel?: string;
  /** Stock ceiling at add time; undefined = untracked. */
  maxQuantity?: number;
}

interface LocalCartContextValue {
  items: LocalCartItem[];
  /** Total unit count across lines. */
  count: number;
  /** BDT display subtotal. */
  subtotal: number;
  /** False until localStorage has been read — render cart UI only after this. */
  hydrated: boolean;
  addItem: (item: Omit<LocalCartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, variantSku: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantSku: string | undefined) => void;
  clear: () => void;
}

const STORAGE_KEY = "dropshopnn.cart.v1";

const LocalCartContext = createContext<LocalCartContextValue | null>(null);

function lineKey(productId: string, variantSku: string | undefined): string {
  return `${productId}::${variantSku ?? ""}`;
}

function clampQuantity(quantity: number, max: number | undefined): number {
  const upper = max !== undefined && max > 0 ? max : Number.MAX_SAFE_INTEGER;
  return Math.max(1, Math.min(Math.floor(quantity), upper));
}

function readStorage(): LocalCartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is LocalCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as LocalCartItem).productId === "string" &&
        typeof (item as LocalCartItem).name === "string" &&
        typeof (item as LocalCartItem).unitPrice === "number" &&
        typeof (item as LocalCartItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

export function LocalCartProvider({ children }: { children: ReactNode }): ReactNode {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Storage full/blocked — cart continues in memory.
      }
    }, 150);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<LocalCartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const key = lineKey(item.productId, item.variantSku);
      const existing = prev.find((line) => lineKey(line.productId, line.variantSku) === key);
      if (existing) {
        return prev.map((line) =>
          lineKey(line.productId, line.variantSku) === key
            ? {
                ...line,
                ...item,
                quantity: clampQuantity(line.quantity + quantity, item.maxQuantity),
              }
            : line,
        );
      }
      return [...prev, { ...item, quantity: clampQuantity(quantity, item.maxQuantity) }];
    });
  }, []);

  const setQuantity = useCallback(
    (productId: string, variantSku: string | undefined, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter(
              (line) => lineKey(line.productId, line.variantSku) !== lineKey(productId, variantSku),
            )
          : prev.map((line) =>
              lineKey(line.productId, line.variantSku) === lineKey(productId, variantSku)
                ? { ...line, quantity: clampQuantity(quantity, line.maxQuantity) }
                : line,
            ),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, variantSku: string | undefined) => {
    setItems((prev) =>
      prev.filter(
        (line) => lineKey(line.productId, line.variantSku) !== lineKey(productId, variantSku),
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<LocalCartContextValue>(() => {
    const count = items.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    return { items, count, subtotal, hydrated, addItem, setQuantity, removeItem, clear };
  }, [items, hydrated, addItem, setQuantity, removeItem, clear]);

  return <LocalCartContext.Provider value={value}>{children}</LocalCartContext.Provider>;
}

export function useLocalCart(): LocalCartContextValue {
  const ctx = useContext(LocalCartContext);
  if (!ctx) {
    throw new Error("useLocalCart must be used within a LocalCartProvider");
  }
  return ctx;
}
