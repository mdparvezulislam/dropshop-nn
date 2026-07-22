import * as React from "react";
import type { ExtendedVariantRow, VariantMatrixOptions } from "../types/studio-types";

export function useVariantMatrix(): {
  generateMatrix: (options: VariantMatrixOptions) => ExtendedVariantRow[];
} {
  const generateMatrix = React.useCallback((options: VariantMatrixOptions): ExtendedVariantRow[] => {
    const {
      colors = [],
      sizes = [],
      storages = [],
      rams = [],
      materials = [],
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

    const results: ExtendedVariantRow[] = [];
    let counter = 1;

    for (const color of colorList) {
      for (const size of sizeList) {
        for (const storage of storageList) {
          for (const ram of ramList) {
            for (const material of materialList) {
              const codeParts: string[] = [];
              if (color) codeParts.push(color.substring(0, 3).toUpperCase());
              if (size) codeParts.push(size.substring(0, 3).toUpperCase());
              if (storage) codeParts.push(storage.replace(/\s+/g, "").toUpperCase());
              if (ram) codeParts.push(ram.replace(/\s+/g, "").toUpperCase());
              if (material) codeParts.push(material.substring(0, 3).toUpperCase());

              const suffix = codeParts.length > 0 ? codeParts.join("-") : `VAR-${counter}`;
              const sku = `${baseSku}-${suffix}`;

              const retailPrice = basePrice > 0 ? basePrice : baseCost * 1.40;
              const wholesalePrice = baseCost * 1.30;
              const resellerPrice = baseCost * 1.22;

              results.push({
                id: `v-gen-${Date.now()}-${counter}`,
                sku,
                barcode: `${Date.now()}${counter}`,
                color: color || undefined,
                size: size || undefined,
                storage: storage || undefined,
                ram: ram || undefined,
                material: material || undefined,
                price: parseFloat(retailPrice.toFixed(2)),
                wholesalePrice: parseFloat(wholesalePrice.toFixed(2)),
                resellerPrice: parseFloat(resellerPrice.toFixed(2)),
                costPrice: baseCost,
                stock: baseStock,
                reservedStock: 0,
                incomingStock: 0,
                status: "active",
                visibility: "public",
              });

              counter++;
            }
          }
        }
      }
    }

    return results;
  }, []);

  return { generateMatrix };
}
