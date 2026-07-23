import * as React from "react";
import { generateSlug } from "@/lib/utils/slug-utils";

export interface GeneratedData {
  slug: string;
  sku: string;
  barcode: string;
  metaTitle: string;
  metaDescription: string;
  searchKeywords: string[];
  searchTokens: string[];
}

export function useAutoGeneration(): {
  generate: (name: string, existingSku?: string) => GeneratedData;
} {
  const generate = React.useCallback((name: string, existingSku?: string): GeneratedData => {
    if (!name.trim()) {
      return { slug: "", sku: "", barcode: "", metaTitle: "", metaDescription: "", searchKeywords: [], searchTokens: [] };
    }

    const slug = generateSlug(name);

    const prefix = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const sku = existingSku || `DS-${prefix}-${random4}`;

    const now = Date.now().toString();
    const barcode = now.slice(-12).padStart(13, "0");

    const metaTitle = `${name} | DropShop Bangladesh`;
    const metaDescription = `Buy ${name} at best price in Bangladesh. Fast delivery, official warranty, and competitive pricing.`;

    const words = name
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const searchKeywords = [...new Set(words)].slice(0, 8);
    const searchTokens = words.map((w) => w.toLowerCase());

    return { slug, sku, barcode, metaTitle, metaDescription, searchKeywords, searchTokens };
  }, []);

  return { generate };
}

export default useAutoGeneration;
