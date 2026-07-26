"use client";

import * as React from "react";
import { getCategoryTreeAction, listBrandsAction } from "../actions/classification-actions";
import type { Brand, CategoryTreeNode } from "../domain/classification-entity";

/**
 * Shared taxonomy reader for every consumer of categories and brands
 * (Product Studio selectors, filters, admin pages).
 *
 * A module-level cache is deliberate: Product Studio mounts the category and brand
 * selectors independently, and each was previously firing its own server action on every
 * mount. One in-flight promise is shared across all consumers, and the resolved value is
 * reused until something invalidates it.
 */
interface TaxonomyCache {
  categories: CategoryTreeNode[] | null;
  brands: Brand[] | null;
  categoriesPromise: Promise<CategoryTreeNode[]> | null;
  brandsPromise: Promise<Brand[]> | null;
}

const cache: TaxonomyCache = {
  categories: null,
  brands: null,
  categoriesPromise: null,
  brandsPromise: null,
};

const subscribers = new Set<() => void>();

function notify(): void {
  for (const listener of subscribers) listener();
}

/** Drops the cache so the next read re-fetches. Call after any taxonomy write. */
export function invalidateTaxonomy(): void {
  cache.categories = null;
  cache.brands = null;
  cache.categoriesPromise = null;
  cache.brandsPromise = null;
  notify();
}

async function loadCategories(): Promise<CategoryTreeNode[]> {
  if (cache.categories) return cache.categories;
  if (!cache.categoriesPromise) {
    cache.categoriesPromise = getCategoryTreeAction()
      .then((res) => {
        const data = res.success && res.data ? res.data : [];
        cache.categories = data;
        return data;
      })
      .finally(() => {
        cache.categoriesPromise = null;
      });
  }
  return cache.categoriesPromise;
}

async function loadBrands(): Promise<Brand[]> {
  if (cache.brands) return cache.brands;
  if (!cache.brandsPromise) {
    cache.brandsPromise = listBrandsAction()
      .then((res) => {
        const data = res.success && res.data ? res.data : [];
        cache.brands = data;
        return data;
      })
      .finally(() => {
        cache.brandsPromise = null;
      });
  }
  return cache.brandsPromise;
}

/** Flattens the tree so a selector can render an indented, hierarchy-ordered list. */
export function flattenCategories(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const out: CategoryTreeNode[] = [];
  const walk = (list: CategoryTreeNode[]): void => {
    for (const node of list) {
      out.push(node);
      if (node.children.length > 0) walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

export interface UseTaxonomyResult {
  categories: CategoryTreeNode[];
  flatCategories: CategoryTreeNode[];
  brands: Brand[];
  loading: boolean;
  refresh: () => void;
}

export function useTaxonomy(): UseTaxonomyResult {
  const [categories, setCategories] = React.useState<CategoryTreeNode[]>(cache.categories ?? []);
  const [brands, setBrands] = React.useState<Brand[]>(cache.brands ?? []);
  const [loading, setLoading] = React.useState(!cache.categories || !cache.brands);

  const read = React.useCallback(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([loadCategories(), loadBrands()])
      .then(([nextCategories, nextBrands]) => {
        if (cancelled) return;
        setCategories(nextCategories);
        setBrands(nextBrands);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const cleanup = read();
    // Re-read whenever any consumer invalidates the cache after a write.
    const listener = (): void => {
      read();
    };
    subscribers.add(listener);
    return () => {
      cleanup();
      subscribers.delete(listener);
    };
  }, [read]);

  const flatCategories = React.useMemo(() => flattenCategories(categories), [categories]);

  const refresh = React.useCallback(() => {
    invalidateTaxonomy();
  }, []);

  return { categories, flatCategories, brands, loading, refresh };
}
