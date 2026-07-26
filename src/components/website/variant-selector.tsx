"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { ProductVariantEntity } from "@/features/catalog/domain/product-dto";

interface VariantSelectorProps {
  variants?: ProductVariantEntity[];
  onVariantChange?: (selectedVariant: ProductVariantEntity | null) => void;
}

export function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  // Extract all distinct attribute keys across variants (e.g. Color, Size, Storage)
  const attributeKeys = React.useMemo(() => {
    const keys = new Set<string>();
    for (const v of variants) {
      if (v.attributes) {
        for (const k of Object.keys(v.attributes)) {
          keys.add(k);
        }
      }
    }
    return Array.from(keys);
  }, [variants]);

  const [selectedAttrs, setSelectedAttrs] = React.useState<Record<string, string>>(() => {
    if (variants.length > 0 && variants[0].attributes) {
      return { ...variants[0].attributes };
    }
    return {};
  });

  // Find matching variant based on currently selected attributes
  const matchedVariant = React.useMemo(() => {
    if (attributeKeys.length === 0) return variants[0] || null;
    return (
      variants.find((v) => {
        const attrs = v.attributes;
        if (!attrs) return false;
        return attributeKeys.every((k) => attrs[k] === selectedAttrs[k]);
      }) || null
    );
  }, [variants, attributeKeys, selectedAttrs]);

  React.useEffect(() => {
    if (onVariantChange) {
      onVariantChange(matchedVariant);
    }
  }, [matchedVariant, onVariantChange]);

  const handleSelectAttribute = (key: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-4 py-2">
      {attributeKeys.map((key) => {
        // Collect unique values for this attribute key
        const uniqueValues = Array.from(
          new Set(
            variants.map((v) => v.attributes?.[key]).filter((val): val is string => Boolean(val)),
          ),
        );

        return (
          <div key={key} className="space-y-2">
            <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
              <span>
                {key}:{" "}
                <span className="text-red-600 font-black">
                  {selectedAttrs[key] || "পছন্দ করুন"}
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              {uniqueValues.map((val) => {
                const isSelected = selectedAttrs[key] === val;

                // Check if any active variant with this attribute value has stock
                const isAvailable = variants.some((v) => {
                  if (v.attributes?.[key] !== val) return false;
                  return v.isActive !== false && (v.stock ?? 0) > 0;
                });

                return (
                  <button
                    key={val}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectAttribute(key, val)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5",
                      !isAvailable &&
                        "opacity-30 cursor-not-allowed line-through bg-slate-100 border-slate-200 text-slate-400",
                      isSelected
                        ? "border-red-600 bg-red-50 text-red-700 shadow-xs font-black ring-1 ring-red-600/30"
                        : "border-slate-300 text-slate-800 hover:border-red-400 hover:bg-slate-50",
                    )}
                  >
                    <span>{val}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
