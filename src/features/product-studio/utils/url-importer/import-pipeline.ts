import type { ImportResult } from "./types";
import { fetchPageHtml, UrlFetchError } from "./url-fetcher";
import { extractPageContent } from "./html-extractor";
import { detectDuplicates } from "./duplicate-detector";
import { SmartParserService } from "../smart-parser";

export interface PipelineOptions {
  timeout?: number;
  maxSize?: number;
  maxRedirects?: number;
  excludeProductId?: string;
}

export class ImportPipelineError extends Error {
  constructor(
    message: string,
    public readonly stage: "fetch" | "extract" | "parse" | "duplicate" | "validate",
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "ImportPipelineError";
  }
}

export async function runImportPipeline(
  rawUrl: string,
  options: PipelineOptions = {},
): Promise<ImportResult> {
  const summary: string[] = [];

  const { html, finalUrl } = await fetchPageHtml(rawUrl, {
    timeout: options.timeout,
    maxSize: options.maxSize,
    maxRedirects: options.maxRedirects,
  }).catch((err) => {
    if (err instanceof UrlFetchError) {
      throw new ImportPipelineError(err.message, "fetch", err);
    }
    throw new ImportPipelineError("Failed to fetch URL", "fetch", err);
  });

  const extracted = extractPageContent(html);

  if (extracted.pageTitle) summary.push("Page Title");
  if (extracted.description) summary.push("Description");
  if (extracted.brandHint) summary.push("Brand Detected");
  if (extracted.categoryHint) summary.push("Category Suggested");
  if (extracted.priceHint) summary.push("Price Found");
  if (extracted.specifications.length > 0) {
    summary.push(`${extracted.specifications.length} Specifications`);
  }
  if (extracted.features.length > 0) {
    summary.push(`${extracted.features.length} Features`);
  }
  if (extracted.images.length > 0) {
    summary.push(`${extracted.images.length} Images`);
  }
  if (extracted.structuredData) {
    summary.push("Structured Data");
  }
  if (extracted.breadcrumbs.length > 0) {
    summary.push("Breadcrumbs");
  }

  const parsed = SmartParserService.parse(extracted.cleanText);

  if (parsed.title) {
    const key = "Smart Parsed";
    if (!summary.includes(key)) summary.push(key);
  }

  const duplicates = await detectDuplicates(
    {
      name: extracted.pageTitle || parsed.title || extracted.metadata.title,
      sku: extracted.structuredData?.sku || parsed.title,
      slug: extracted.pageTitle
        ? extracted.pageTitle
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : undefined,
    },
    options.excludeProductId,
  ).catch(() => []);

  if (duplicates.length > 0) {
    summary.push(`${duplicates.length} Duplicate Warning(s)`);
  }

  return {
    extracted,
    parsed,
    summary,
    duplicates,
    rawText: extracted.cleanText,
  };
}
