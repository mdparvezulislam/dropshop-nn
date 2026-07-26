/**
 * Catalog Automation Constants
 * Project: DropshopNN Enterprise Commerce Operating System
 *
 * All configurable thresholds, markups, and limits for the Product Automation Engine.
 * Centralised here to avoid hardcoding magic numbers deep in business logic.
 */
export const CATALOG_AUTOMATION = {
  /* ── SKU Generation ── */
  SKU_PREFIX: "DS",
  SKU_RANDOM_DIGITS: 4,
  SKU_GENERATION_MAX_RETRIES: 10,
  CATEGORY_CODE_FALLBACK: "GEN",
  CATEGORY_CODE_LENGTH: 3,
  VARIANT_SEPARATOR: "-",

  /* ── Slug Generation ── */
  SLUG_MAX_LENGTH: 100,
  SLUG_COLLISION_MAX_RETRIES: 50,

  /* ── Pricing Default Markups (percent) ── */
  DEFAULT_MARKUP_RETAIL: 30,
  DEFAULT_MARKUP_WHOLESALE: 10,
  DEFAULT_MARKUP_RESELLER: 15,

  /* ── Badge Thresholds ── */
  NEW_ARRIVAL_DAYS: 7,
  LOW_STOCK_THRESHOLD: 10,

  /* ── SEO Limits ── */
  SEO_DESCRIPTION_MAX_LENGTH: 155,
  SEO_DESCRIPTION_SUFFIX: "...",
  TAG_EXTRACTION_MAX: 8,
  TAG_MIN_LENGTH: 3,
} as const;

export type CatalogAutomationConfig = typeof CATALOG_AUTOMATION;
export default CATALOG_AUTOMATION;
