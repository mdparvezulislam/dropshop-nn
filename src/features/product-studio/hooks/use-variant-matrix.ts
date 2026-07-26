"use client";

import * as React from "react";
import type { ExtendedVariantRow, VariantMatrixOptions } from "../types/studio-types";

function cartesianProduct<T extends Record<string, string[]>>(axes: T): Record<keyof T, string>[] {
  const keys = Object.keys(axes) as (keyof T)[];
  if (keys.length === 0) return [{} as Record<keyof T, string>];

  const result: Record<keyof T, string>[] = [];

  function recurse(idx: number, current: Record<keyof T, string>) {
    if (idx === keys.length) {
      result.push({ ...current });
      return;
    }
    const key = keys[idx];
    const values = axes[key];
    if (values.length === 0) {
      recurse(idx + 1, current);
    } else {
      for (const val of values) {
        recurse(idx + 1, { ...current, [key]: val });
      }
    }
  }

  recurse(0, {} as Record<keyof T, string>);
  return result;
}

function buildSkuCode(parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((p) => p.substring(0, 3).toUpperCase())
    .join("-");
}

export function useVariantMatrix(): {
  generateMatrix: (options: VariantMatrixOptions) => ExtendedVariantRow[];
} {
  const generateMatrix = React.useCallback(
    (options: VariantMatrixOptions): ExtendedVariantRow[] => {
      const {
        colors = [],
        sizes = [],
        storages = [],
        rams = [],
        materials = [],
        dynamicAxes = [],
        baseSku = "DS-PROD",
        basePrice = 1200,
        baseCost = 800,
        baseStock = 10,
      } = options;

      const colorList = colors.length > 0 ? colors : [""];
      const sizeList = sizes.length > 0 ? sizes : [""];
      const storageList = storages.length > 0 ? storages : [""];
      const ramList = rams.length > 0 ? rams : [""];
      const materialList = materials.length > 0 ? materials : [""];

      // Build static axes
      const staticAxes: Record<string, string[]> = {
        color: colorList,
        size: sizeList,
        storage: storageList,
        ram: ramList,
        material: materialList,
      };

      // Build dynamic axes
      const dynamicAxesMap: Record<string, string[]> = {};
      for (const axis of dynamicAxes) {
        const vals = axis.values.filter((v) => v.trim());
        if (vals.length > 0) {
          dynamicAxesMap[axis.name] = vals;
        }
      }

      // Generate static combinations
      const staticCombinations = cartesianProduct(staticAxes);

      // If there are dynamic axes, multiply static combos by dynamic combos
      let allCombinations: { static: Record<string, string>; dynamic: Record<string, string> }[];
      if (Object.keys(dynamicAxesMap).length > 0) {
        const dynamicCombinations = cartesianProduct(dynamicAxesMap);
        allCombinations = [];
        for (const sc of staticCombinations) {
          for (const dc of dynamicCombinations) {
            allCombinations.push({ static: sc, dynamic: dc });
          }
        }
      } else {
        allCombinations = staticCombinations.map((sc) => ({ static: sc, dynamic: {} }));
      }

      const results: ExtendedVariantRow[] = [];
      let counter = 1;

      for (const combo of allCombinations) {
        const { static: s, dynamic: d } = combo;

        const codeParts: string[] = [];
        if (s.color) codeParts.push(s.color);
        if (s.size) codeParts.push(s.size);
        if (s.storage) codeParts.push(s.storage);
        if (s.ram) codeParts.push(s.ram);
        if (s.material) codeParts.push(s.material);
        for (const val of Object.values(d)) {
          if (val) codeParts.push(val);
        }

        const suffix = codeParts.length > 0 ? buildSkuCode(codeParts) : `VAR-${counter}`;
        const sku = `${baseSku}-${suffix}`;

        const retailPrice = basePrice > 0 ? basePrice : baseCost * 1.4;
        const wholesalePrice = baseCost * 1.3;
        const resellerPrice = baseCost * 1.22;

        const variant: ExtendedVariantRow = {
          id: `v-gen-${Date.now()}-${counter}`,
          sku,
          barcode: `${Date.now()}${counter}`,
          color: s.color || undefined,
          size: s.size || undefined,
          storage: s.storage || undefined,
          ram: s.ram || undefined,
          material: s.material || undefined,
          price: parseFloat(retailPrice.toFixed(2)),
          wholesalePrice: parseFloat(wholesalePrice.toFixed(2)),
          resellerPrice: parseFloat(resellerPrice.toFixed(2)),
          costPrice: baseCost,
          stock: baseStock,
          reservedStock: 0,
          incomingStock: 0,
          status: "active",
          visibility: "public",
        };

        if (Object.keys(d).length > 0) {
          variant.dynamicAttrs = d;
        }

        results.push(variant);
        counter++;
      }

      return results;
    },
    [],
  );

  return { generateMatrix };
}
