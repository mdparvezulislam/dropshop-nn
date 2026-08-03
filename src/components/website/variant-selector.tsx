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
    <div className="space-y-4 py-2 border-t border-b border-slate-200 dark:border-slate-800">
      {attributeKeys.map((key) => {
        const uniqueValues = Array.from(
          new Set(
            variants.map((v) => v.attributes?.[key]).filter((val): val is string => Boolean(val)),
          ),
        );

        const isColorKey = key.toLowerCase().includes("color") || key.includes("রং");

        return (
          <div key={key} className="space-y-2">
            <label className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>
                {key}:{" "}
                <span className="text-amber-600 dark:text-amber-400 font-black">
                  {selectedAttrs[key] || "পছন্দ করুন"}
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              {uniqueValues.map((val) => {
                const isSelected = selectedAttrs[key] === val;

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
                      "px-4 py-2 rounded-xl border text-xs font-black transition-all flex items-center gap-2 touch-manipulation active:scale-95",
                      !isAvailable &&
                        "opacity-30 cursor-not-allowed line-through bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500",
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-black ring-2 ring-amber-500/40 shadow-xs"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                    )}
                  >
                    {isColorKey && (
                      <span
                        className="h-3 w-3 rounded-full border border-slate-400/40 shrink-0"
                        style={{
                          backgroundColor:
                            val.toLowerCase() === "black" || val.toLowerCase() === "কালো"
                              ? "#000000"
                              : val.toLowerCase() === "white" || val.toLowerCase() === "সাদা"
                                ? "#ffffff"
                                : val.toLowerCase() === "red" || val.toLowerCase() === "লাল"
                                  ? "#ef4444"
                                  : val.toLowerCase() === "blue" || val.toLowerCase() === "নীল"
                                    ? "#3b82f6"
                                    : val.toLowerCase() === "green" || val.toLowerCase() === "সবুজ"
                                      ? "#22c55e"
                                      : "#d97706",
                        }}
                      />
                    )}
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
