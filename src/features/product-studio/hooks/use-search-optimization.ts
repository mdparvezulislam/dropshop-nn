import * as React from "react";
import type { SearchTokensData } from "../types/studio-types";

export function useSearchOptimization(
  name: string,
  categoryName?: string,
  brandName?: string,
  tags: string[] = [],
): SearchTokensData {
  return React.useMemo(() => {
    const rawWords = `${name} ${categoryName || ""} ${brandName || ""} ${tags.join(" ")}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const uniqueTokens = Array.from(new Set(rawWords));
    const keywords = uniqueTokens.slice(0, 10);
    const synonyms = [
      name.toLowerCase(),
      `${brandName || ""} ${name}`.toLowerCase(),
      `${name} bangladesh`.toLowerCase(),
      `${name} price in bd`.toLowerCase(),
    ];

    const autocomplete = uniqueTokens.map((t) => `${t} ${name.substring(0, 10)}`);

    let weight = 50;
    if (name.length > 10) weight += 20;
    if (categoryName) weight += 15;
    if (brandName) weight += 15;

    return {
      searchWeight: Math.min(weight, 100),
      tokens: uniqueTokens,
      keywords,
      synonyms,
      autocomplete,
    };
  }, [name, categoryName, brandName, tags]);
}
