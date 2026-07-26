import type { DuplicateWarning } from "./types";
import { ProductService } from "@/features/catalog/services/product-service";

export interface DuplicateDetectionInput {
  name?: string;
  sku?: string;
  barcode?: string;
  gtin?: string;
  slug?: string;
}

export async function detectDuplicates(
  input: DuplicateDetectionInput,
  excludeProductId?: string,
): Promise<DuplicateWarning[]> {
  const warnings: DuplicateWarning[] = [];
  const productService = new ProductService();

  if (input.sku) {
    try {
      const existing = await productService.findBySku(input.sku);
      if (existing && existing.id !== excludeProductId) {
        warnings.push({
          type: "sku",
          value: input.sku,
          existingProductId: existing.id,
          existingProductName: existing.name,
        });
      }
    } catch {
      // SKU not found
    }
  }

  if (input.slug) {
    try {
      const existing = await productService.findBySlug(input.slug);
      if (existing && existing.id !== excludeProductId) {
        warnings.push({
          type: "slug",
          value: input.slug,
          existingProductId: existing.id,
          existingProductName: existing.name,
        });
      }
    } catch {
      // Slug not found
    }
  }

  if (input.name) {
    try {
      const results = await productService.list(
        {
          query: input.name,
          status: undefined,
          visibility: undefined,
        },
        { limit: 5 },
      );
      for (const item of results.items) {
        if (item.id === excludeProductId) continue;
        const similarity = cosineSimilarity(input.name.toLowerCase(), item.name.toLowerCase());
        if (similarity > 0.7) {
          warnings.push({
            type: "name",
            value: input.name,
            existingProductId: item.id,
            existingProductName: item.name,
          });
          break;
        }
      }
    } catch {
      // Search failed
    }
  }

  return warnings;
}

function cosineSimilarity(a: string, b: string): number {
  const tokenize = (s: string): Map<string, number> => {
    const tokens = s.split(/\s+/).filter(Boolean);
    const freq = new Map<string, number>();
    for (const t of tokens) {
      freq.set(t, (freq.get(t) || 0) + 1);
    }
    return freq;
  };

  const vecA = tokenize(a);
  const vecB = tokenize(b);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const [token, count] of vecA) {
    magA += count * count;
    if (vecB.has(token)) {
      dotProduct += count * (vecB.get(token) || 0);
    }
  }

  for (const count of vecB.values()) {
    magB += count * count;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dotProduct / denom;
}
