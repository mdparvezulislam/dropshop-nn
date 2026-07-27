"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  getMyWishlistIdsAction,
  removeWishlistProductAction,
  toggleWishlistAction,
} from "@/features/catalog/actions/wishlist-actions";

/**
 * Shared wishlist membership state for the storefront.
 *
 * The saved product ids are fetched EXACTLY ONCE per signed-in session and
 * then read from context — so ten hearts on a grid plus the header counter
 * cost one request, not eleven. Guests never hit the server at all: there is
 * no anonymous wishlist to load, and inventing a local one would silently
 * lose the visitor's saves at login.
 */

export type WishlistToggleResult =
  | { status: "added" }
  | { status: "removed" }
  | { status: "unauthenticated"; error: string }
  | { status: "error"; error: string };

export interface WishlistRemoveResult {
  ok: boolean;
  error?: string;
}

interface WishlistContextValue {
  /** Product ids currently saved by the signed-in user. */
  ids: ReadonlySet<string>;
  count: number;
  /** False until membership is known; guests hydrate immediately. */
  hydrated: boolean;
  isAuthenticated: boolean;
  has: (productId: string) => boolean;
  /** Optimistic add/remove with rollback; reconciles against the server truth. */
  toggle: (productId: string) => Promise<WishlistToggleResult>;
  remove: (productId: string) => Promise<WishlistRemoveResult>;
  /** Seed the shared set from a page that already loaded the full entries. */
  sync: (productIds: readonly string[]) => void;
}

const GUEST_PROMPT = "উইশলিস্টে যোগ করতে লগইন করুন";

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { status } = useSession();
  const [ids, setIds] = React.useState<ReadonlySet<string>>(() => new Set<string>());
  const [hydrated, setHydrated] = React.useState(false);

  // Mirror of `ids` for event handlers — avoids stale closures without
  // rebuilding every callback whenever the set changes.
  const idsRef = React.useRef<Set<string>>(new Set<string>());
  // "guest" | "user" — guards against re-fetching on every session re-render.
  const loadedFor = React.useRef<"guest" | "user" | null>(null);

  const commit = React.useCallback((next: Set<string>): void => {
    idsRef.current = next;
    setIds(next);
  }, []);

  const setMembership = React.useCallback(
    (productId: string, member: boolean): void => {
      const next = new Set(idsRef.current);
      if (member) next.add(productId);
      else next.delete(productId);
      commit(next);
    },
    [commit],
  );

  const isAuthenticated = status === "authenticated";

  React.useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      loadedFor.current = "guest";
      commit(new Set<string>());
      setHydrated(true);
      return;
    }

    if (loadedFor.current === "user") return;
    loadedFor.current = "user";

    let cancelled = false;
    void (async (): Promise<void> => {
      const result = await getMyWishlistIdsAction();
      if (cancelled) return;
      commit(new Set(result.success ? result.data : []));
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [status, commit]);

  const toggle = React.useCallback(
    async (productId: string): Promise<WishlistToggleResult> => {
      if (status !== "authenticated") {
        return { status: "unauthenticated", error: GUEST_PROMPT };
      }

      const wasSaved = idsRef.current.has(productId);
      setMembership(productId, !wasSaved);

      const result = await toggleWishlistAction(productId);
      if (!result.success) {
        setMembership(productId, wasSaved);
        return { status: "error", error: result.error };
      }

      setMembership(productId, result.data.inWishlist);
      return { status: result.data.inWishlist ? "added" : "removed" };
    },
    [status, setMembership],
  );

  const remove = React.useCallback(
    async (productId: string): Promise<WishlistRemoveResult> => {
      if (status !== "authenticated") {
        return { ok: false, error: GUEST_PROMPT };
      }

      const wasSaved = idsRef.current.has(productId);
      setMembership(productId, false);

      const result = await removeWishlistProductAction(productId);
      if (!result.success) {
        setMembership(productId, wasSaved);
        return { ok: false, error: result.error };
      }
      return { ok: true };
    },
    [status, setMembership],
  );

  const sync = React.useCallback(
    (productIds: readonly string[]): void => {
      commit(new Set(productIds));
      setHydrated(true);
    },
    [commit],
  );

  const value = React.useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.size,
      hydrated,
      isAuthenticated,
      has: (productId: string) => ids.has(productId),
      toggle,
      remove,
      sync,
    }),
    [ids, hydrated, isAuthenticated, toggle, remove, sync],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
