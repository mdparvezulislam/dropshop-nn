"use client";

import * as React from "react";
import { toast } from "sonner";
import type { StudioFormState } from "./use-product-studio";
const DRAFT_STORAGE_KEY_PREFIX = "dropshop_product_studio_draft_";

export function useProductDraft(productId?: string) {
  const storageKey = React.useMemo(() => {
    return `${DRAFT_STORAGE_KEY_PREFIX}${productId || "new"}`;
  }, [productId]);

  const [hasUnsavedDraft, setHasUnsavedDraft] = React.useState(false);

  // Check if saved draft exists on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHasUnsavedDraft(true);
      }
    } catch {
      // Storage unavailable
    }
  }, [storageKey]);

  const saveDraftToLocalStorage = React.useCallback(
    (form: StudioFormState) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            form,
            updatedAt: new Date().toISOString(),
          }),
        );
        setHasUnsavedDraft(true);
      } catch {
        // Storage fail silent
      }
    },
    [storageKey],
  );

  const loadDraftFromLocalStorage = React.useCallback((): StudioFormState | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        toast.success("Restore draft successfully!");
        return parsed.form;
      }
    } catch {
      toast.error("Failed to restore draft");
    }
    return null;
  }, [storageKey]);

  const clearDraft = React.useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasUnsavedDraft(false);
    } catch {
      // Storage fail silent
    }
  }, [storageKey]);

  return {
    hasUnsavedDraft,
    saveDraftToLocalStorage,
    loadDraftFromLocalStorage,
    clearDraft,
  };
}
