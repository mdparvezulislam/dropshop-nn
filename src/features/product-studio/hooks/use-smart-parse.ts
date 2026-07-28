"use client";

import * as React from "react";
import { toast } from "sonner";
import { SmartParserService, type ParsedProductData } from "../utils/smart-parser";
import type { StudioFormState } from "./use-product-studio";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────────── */

export interface ParseResult {
  data: ParsedProductData;
  summary: string[];
  updates: Partial<StudioFormState>;
}

export interface UseSmartParseOptions {
  /** Show toast on success/error */
  showToast?: boolean;
}

export interface UseSmartParseReturn {
  /** Run the parser on arbitrary text and apply to form */
  parse: (text: string) => void;
  /** Whether a parse is currently running */
  isParsing: boolean;
  /** The last parse result (null before first parse) */
  lastResult: ParsedProductData | null;
  /** Human-readable summary of what was extracted */
  summary: string[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Hook
   ───────────────────────────────────────────────────────────────────────────── */

export function useSmartParse(
  form: StudioFormState,
  bulkUpdate: (partial: Partial<StudioFormState>) => void,
  options: UseSmartParseOptions = {},
): UseSmartParseReturn {
  const { showToast = true } = options;
  const [isParsing, setIsParsing] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<ParsedProductData | null>(null);
  const [summary, setSummary] = React.useState<string[]>([]);

  const parse = React.useCallback(
    (text: string) => {
      if (!text.trim()) {
        if (showToast) {
          toast.error("Please enter or paste product text first! (বিবরণ লিখুন বা পেস্ট করুন)");
        }
        return;
      }

      setIsParsing(true);

      try {
        const parsed = SmartParserService.parse(text);
        setLastResult(parsed);
        const report: string[] = [];
        const updates: Partial<StudioFormState> = {};

        // ── 1. Title ──
        if (parsed.title && !form.name) {
          updates.name = parsed.title;
          report.push("Product Title");
        }

        // ── 2. Short description + SEO description ──
        if (parsed.seoDescription) {
          if (!form.shortDescription) {
            const cleanPitch =
              parsed.seoDescription.length > 500
                ? parsed.seoDescription.substring(0, 497).trim() + "..."
                : parsed.seoDescription;
            updates.shortDescription = cleanPitch;
            report.push("Short Summary");
          }
          if (!form.metaDescription) {
            const cleanSeo =
              parsed.seoDescription.length > 160
                ? parsed.seoDescription.substring(0, 157).trim() + "..."
                : parsed.seoDescription;
            updates.metaDescription = cleanSeo;
            report.push("SEO Description");
          }
        }

        // ── 3. Specifications (merge) ──
        if (parsed.specifications && parsed.specifications.length > 0) {
          const existingSpecs = form.specifications || [];
          const specMap = new Map<string, any>();

          // Preserve existing
          for (const s of existingSpecs) {
            if (s.key) specMap.set(s.key.toLowerCase(), s);
          }

          // Add/overwrite parsed
          for (const s of parsed.specifications) {
            specMap.set(s.key.toLowerCase(), {
              key: s.key.trim(),
              label: s.label || s.key.trim(),
              value: String(s.value).trim(),
              group: s.group || "General",
              type: "text" as const,
            });
          }

          updates.specifications = Array.from(specMap.values());
          report.push(`${parsed.specifications.length} Specifications`);
        }

        // ── 4. Tags & SEO Keywords (merge) ──
        if (parsed.keywords && parsed.keywords.length > 0) {
          const tagSet = new Set(form.tags || []);
          for (const kw of parsed.keywords) {
            const cleanKw = kw.trim().toLowerCase();
            if (cleanKw) tagSet.add(cleanKw);
          }
          const allKeywords = Array.from(tagSet);
          updates.tags = allKeywords;
          updates.metaKeywords = allKeywords;
          if (!form.metaTitle && parsed.title) {
            updates.metaTitle = `${parsed.title} - NN Enterprise`;
          }
          report.push(`${parsed.keywords.length} SEO Keywords`);
        }

        // ── 5. Features (replace) ──
        if (parsed.features && parsed.features.length > 0) {
          updates.bulletFeatures = [...new Set(parsed.features)];
          report.push(`${parsed.features.length} Features`);
        }

        // ── 6. Brand (fill if empty) ──
        if (parsed.brand && !form.brandId && !form.brandName) {
          updates.brandName = parsed.brand;
          report.push("Brand");
        }

        // ── 7. Category suggestion (fill if empty) ──
        if (parsed.category && !form.categoryId && !form.categoryName) {
          updates.categoryName = parsed.category;
          report.push("Category Suggestion");
        }

        // ── 8. Rich description with feature HTML ──
        if (parsed.features && parsed.features.length > 0) {
          const currentDesc = form.richDescription || "";
          if (
            !currentDesc.includes("<ul>") &&
            !currentDesc.toLowerCase().includes("key features")
          ) {
            const featureHtml = `\n<h3>Key Features</h3>\n<ul>\n${parsed.features
              .map((f) => `  <li>${f}</li>`)
              .join("\n")}\n</ul>`;
            const baseText = currentDesc || text;
            updates.richDescription = `${baseText}\n${featureHtml}`;
          }
        }

        // ── 9. Package contents (append to richDescription) ──
        if (parsed.packageContents && parsed.packageContents.length > 0) {
          const currentDesc = updates.richDescription || form.richDescription || "";
          if (!currentDesc.toLowerCase().includes("package includes")) {
            const pkgHtml = `\n<h3>Package Includes</h3>\n<ul>\n${parsed.packageContents
              .map((item) => `  <li>${item}</li>`)
              .join("\n")}\n</ul>`;
            updates.richDescription = `${currentDesc}\n${pkgHtml}`;
            report.push(`${parsed.packageContents.length} Package Items`);
          }
        }

        // ── 10. How to Use (append to richDescription) ──
        if (parsed.howToUse && parsed.howToUse.length > 0) {
          const currentDesc = updates.richDescription || form.richDescription || "";
          if (!currentDesc.toLowerCase().includes("how to use")) {
            const useHtml = `\n<h3>How to Use</h3>\n<ol>\n${parsed.howToUse
              .map((step) => `  <li>${step}</li>`)
              .join("\n")}\n</ol>`;
            updates.richDescription = `${currentDesc}\n${useHtml}`;
            report.push(`${parsed.howToUse.length} Usage Steps`);
          }
        }

        // ── 11. Notice & QA ──
        if (parsed.notice) {
          updates.notice = parsed.notice;
          report.push("Quality Assurance Notice");
        }

        // ── 12. Warranty ──
        if (parsed.warranty && !form.warranty) {
          updates.warranty = parsed.warranty;
          report.push("Warranty Info");
        }

        // ── Apply ──
        if (Object.keys(updates).length > 0) {
          bulkUpdate(updates);
          setSummary(report);
          if (showToast) {
            toast.success(`Product data generated! (${report.join(", ")})`);
          }
        } else {
          if (showToast) {
            toast.info(
              "Could not extract any new attributes. Try pasting more detailed product text.",
            );
          }
        }
      } catch (err) {
        if (showToast) {
          toast.error("Parser error — please try again with cleaner text.");
        }
      } finally {
        setIsParsing(false);
      }
    },
    [form, bulkUpdate, showToast],
  );

  return { parse, isParsing, lastResult, summary };
}
