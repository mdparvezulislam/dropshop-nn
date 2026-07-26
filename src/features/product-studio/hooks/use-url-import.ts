"use client";

import * as React from "react";
import { toast } from "sonner";
import { importFromUrlAction } from "../actions/studio-actions";
import type { ImportProgress, ImportResult } from "../utils/url-importer/types";
import type { StudioFormState } from "./use-product-studio";

export interface UseUrlImportReturn {
  progress: ImportProgress;
  importFromUrl: (url: string) => Promise<void>;
  applyImport: () => void;
  dismissImport: () => void;
}

function buildFormUpdates(result: ImportResult): Partial<StudioFormState> {
  const updates: Partial<StudioFormState> = {};

  if (result.extracted.pageTitle) {
    updates.name = result.extracted.pageTitle;
  }

  if (result.extracted.description) {
    updates.shortDescription = result.extracted.description;
  }

  if (result.parsed.seoDescription) {
    updates.metaDescription = result.parsed.seoDescription;
  }

  if (result.parsed.specifications && result.parsed.specifications.length > 0) {
    updates.specifications = result.parsed.specifications.map((s) => ({
      key: s.key.trim(),
      label: s.label || s.key.trim(),
      value: String(s.value).trim(),
      group: s.group || "General",
      type: "text" as const,
    }));
  }

  if (result.parsed.keywords && result.parsed.keywords.length > 0) {
    updates.metaKeywords = result.parsed.keywords;
    updates.tags = result.parsed.keywords;
  }

  if (result.parsed.features && result.parsed.features.length > 0) {
    updates.bulletFeatures = [...new Set(result.parsed.features)];
  }

  if (result.extracted.brandHint) {
    updates.brandName = result.extracted.brandHint;
  }

  if (result.extracted.categoryHint) {
    updates.categoryName = result.extracted.categoryHint;
  }

  if (result.extracted.images.length > 0) {
    updates.media = result.extracted.images.map((img, i) => ({
      id: `import-${i}`,
      url: img.url,
      type: "image" as const,
      isFeatured: img.isFeatured || i === 0,
      altText: img.alt,
    }));
  }

  if (result.parsed.warranty) {
    updates.warranty = result.parsed.warranty;
  }

  if (result.parsed.title && !result.extracted.pageTitle) {
    updates.name = result.parsed.title;
  }

  return updates;
}

export function useUrlImport(
  bulkUpdate: (partial: Partial<StudioFormState>) => void,
): UseUrlImportReturn {
  const [progress, setProgress] = React.useState<ImportProgress>({ stage: "idle" });
  const [lastResult, setLastResult] = React.useState<ImportResult | null>(null);

  const importFromUrl = React.useCallback(async (url: string) => {
    if (!url.trim()) {
      toast.error("Please paste a product URL first");
      return;
    }

    setProgress({ stage: "validating" });

    try {
      setProgress({ stage: "fetching", url });

      const response = await importFromUrlAction(url);

      if (!response.success) {
        setProgress({ stage: "error", error: response.error || "Import failed" });
        toast.error(response.error || "Failed to import from URL");
        return;
      }

      if (!response.data) {
        setProgress({ stage: "error", error: "No data returned from import" });
        toast.error("No data could be extracted from this URL");
        return;
      }

      const result = response.data;
      setLastResult(result);
      setProgress({ stage: "complete", result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      setProgress({ stage: "error", error: message });
      toast.error(message);
    }
  }, []);

  const applyImport = React.useCallback(() => {
    if (!lastResult) return;

    const updates = buildFormUpdates(lastResult);
    bulkUpdate(updates);

    const summary = lastResult.summary;
    toast.success(`URL import applied! (${summary.join(", ")})`);

    setLastResult(null);
    setProgress({ stage: "idle" });
  }, [lastResult, bulkUpdate]);

  const dismissImport = React.useCallback(() => {
    setLastResult(null);
    setProgress({ stage: "idle" });
  }, []);

  return {
    progress,
    importFromUrl,
    applyImport,
    dismissImport,
  };
}
