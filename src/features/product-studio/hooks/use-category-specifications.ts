"use client";

import * as React from "react";
import type { SpecificationField } from "../types/studio-types";
import { getTemplatesByCategoryAction } from "@/features/catalog/actions/product-template-actions";

interface TemplateSpecField {
  key: string;
  label: string;
  labelBangla?: string;
  type: string;
  required?: boolean;
  options?: string[];
  defaultValue?: unknown;
}

export function useCategorySpecifications(categoryName?: string): {
  template: SpecificationField[];
  loadTemplateForCategory: (catName: string) => Promise<SpecificationField[]>;
  loading: boolean;
} {
  const [template, setTemplate] = React.useState<SpecificationField[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadTemplateForCategory = React.useCallback(
    async (catName: string): Promise<SpecificationField[]> => {
      if (!catName.trim()) return [];
      setLoading(true);
      try {
        const res = await getTemplatesByCategoryAction(catName);
        if (res.success && res.data && res.data.length > 0) {
          const fields: SpecificationField[] = res.data.flatMap((t) =>
            ((t.specs as TemplateSpecField[]) ?? []).map((s) => ({
              key: s.key,
              label: s.label,
              type: (s.type as "text" | "number" | "select" | "multiselect" | "boolean") ?? "text",
              value: String(s.defaultValue ?? ""),
              options: s.options,
            })),
          );
          const unique = Array.from(new Map(fields.map((f) => [f.key, f])).values());
          setTemplate(unique);
          setLoading(false);
          return unique;
        }
      } catch {
        // Fall back to empty
      }
      setLoading(false);
      return [];
    },
    [],
  );

  React.useEffect(() => {
    if (categoryName && categoryName.trim()) {
      loadTemplateForCategory(categoryName);
    }
  }, [categoryName, loadTemplateForCategory]);

  return { template, loadTemplateForCategory, loading };
}
