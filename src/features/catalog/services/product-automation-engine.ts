/**
 * ProductAutomationEngine
 * Project: DropshopNN Enterprise Commerce Operating System
 *
 * Stateless enterprise catalog automation engine that auto-generates:
 *  1. Unique slugs (collision-proof)
 *  2. Unique SKUs (category-prefixed, collision-checked)
 *  3. SEO fallbacks (metaTitle, metaDescription, tags)
 *  4. Pricing tiers (delegates to PricingEngineService with fallback)
 *  5. Dynamic badges (new_arrival, limited)
 *
 * Integrates into ProductService.create() and ProductService.update().
 * All markups/thresholds live in CATALOG_AUTOMATION constants.
 */
import { generateSlug } from "@/lib/utils/slug-utils";
import { truncate } from "@/lib/utils/string-utils";
import { logger } from "@/lib/utils/logger";
import { ValidationError } from "@/lib/errors/app-error";
import { CATALOG_AUTOMATION } from "../constants/catalog-automation-constants";
import { ProductRepository } from "../repositories/product-repository";
import { CategoryRepository } from "../repositories/classification-repository";
import { PricingEngineService } from "@/features/pricing/services/pricing-engine-service";

/* ──────────────────────────────────── Types ──────────────────────────────────── */

export interface SEOOutput {
  metaTitle: string;
  metaDescription: string;
  tags: string[];
}

export interface PricingOutput {
  sellingPrice?: number;
  wholesalePrice?: number;
  resellerPrice?: number;
}

export interface AutomationContext {
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: string | null;
  sku?: string | null;
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string[] | null;
  costPrice?: number | null;
  price?: number | null;
  stock?: number | null;
  badges?: string[] | null;
  createdAt?: Date | string | null;
}

export interface EnrichedContext extends AutomationContext {
  finalSlug: string;
  finalSku: string;
  finalMetaTitle: string;
  finalMetaDescription: string;
  finalTags: string[];
  finalBadges: string[];
  finalPricing: PricingOutput;
}

/* ────────────────────────────── Stop Words (inline) ─────────────────────────── */

const TAG_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "had",
  "her",
  "was",
  "one",
  "our",
  "out",
  "has",
  "have",
  "been",
  "some",
  "same",
  "than",
  "that",
  "them",
  "then",
  "they",
  "this",
  "very",
  "just",
  "also",
  "with",
  "buy",
  "new",
  "best",
  "free",
  "shop",
  "online",
  "price",
  "bdt",
  "product",
  "quality",
  "delivery",
  "store",
  "bangladesh",
  "dropshop",
]);

/* ────────────────────────────── Engine ──────────────────────────────────────── */

export class ProductAutomationEngine {
  private readonly productRepo: ProductRepository;
  private readonly categoryRepo: CategoryRepository;
  private readonly pricingEngine: PricingEngineService;

  constructor(
    productRepo?: ProductRepository,
    categoryRepo?: CategoryRepository,
    pricingEngine?: PricingEngineService,
  ) {
    this.productRepo = productRepo ?? new ProductRepository();
    this.categoryRepo = categoryRepo ?? new CategoryRepository();
    this.pricingEngine = pricingEngine ?? new PricingEngineService();
  }

  /* ======================== 1. Unique Slug ============================== */

  /**
   * Generates a URL-friendly slug from the product name and guarantees
   * uniqueness by appending a numeric suffix when a collision is detected.
   */
  async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name || "product").slice(0, CATALOG_AUTOMATION.SLUG_MAX_LENGTH);
    let slug = baseSlug;
    let counter = 1;

    while (counter < CATALOG_AUTOMATION.SLUG_COLLISION_MAX_RETRIES) {
      // eslint-disable-next-line no-await-in-loop
      const existing = await this.productRepo.findBySlug(slug);
      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Final fallback — timestamp salt guarantees uniqueness
    return `${baseSlug}-${Date.now()}`;
  }

  /* ======================== 2. Unique SKU =============================== */

  /**
   * Extracts a short category code from a category name.
   * e.g. "Electronics & Gadgets" → "ELE", "Mobile Accessories" → "MOB"
   */
  private extractCategoryCode(categoryName: string): string {
    const cleaned = categoryName
      .replace(/&/g, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .trim();

    const words = cleaned.split(/\s+/).filter(Boolean);

    if (words.length === 0) return CATALOG_AUTOMATION.CATEGORY_CODE_FALLBACK;

    // Take first word, uppercase, grab the first 3 letters
    const code = words[0].substring(0, CATALOG_AUTOMATION.CATEGORY_CODE_LENGTH).toUpperCase();
    return code.length >= 2 ? code : CATALOG_AUTOMATION.CATEGORY_CODE_FALLBACK;
  }

  /**
   * Generates a guaranteed-unique product SKU.
   * Format: DS-[CAT-CODE]-[RANDOM-4-DIGITS]  e.g.  DS-ELE-4829
   */
  async generateProductSKU(categoryId?: string): Promise<string> {
    let categoryCode: string = CATALOG_AUTOMATION.CATEGORY_CODE_FALLBACK;

    if (categoryId) {
      try {
        const category = await this.categoryRepo.findById(categoryId);
        if (category?.name) {
          categoryCode = this.extractCategoryCode(category.name);
        }
      } catch {
        logger.warn("SKU engine: category lookup failed, using fallback code", {
          categoryId,
        });
      }
    }

    const { SKU_PREFIX, SKU_RANDOM_DIGITS, SKU_GENERATION_MAX_RETRIES } = CATALOG_AUTOMATION;

    for (let attempt = 0; attempt < SKU_GENERATION_MAX_RETRIES; attempt++) {
      const rand = Math.floor(
        Math.pow(10, SKU_RANDOM_DIGITS - 1) +
          Math.random() * 9 * Math.pow(10, SKU_RANDOM_DIGITS - 1),
      );
      const sku = `${SKU_PREFIX}-${categoryCode}-${rand}`;

      // eslint-disable-next-line no-await-in-loop
      const existing = await this.productRepo.findBySku(sku);
      if (!existing) return sku;
    }

    // Absolute fallback: add a timestamp salt
    return `${SKU_PREFIX}-${categoryCode}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Generates a variant-level SKU from a parent SKU and a variant identifier.
   * Format: [PARENT-SKU]-[VARIANT-CODE]  e.g.  DS-ELE-4829-RED
   */
  generateVariantSKU(parentSku: string, variantCode: string): string {
    const normalizedCode = variantCode
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    if (!normalizedCode) return `${parentSku}-V${Date.now().toString().slice(-3)}`;

    return `${parentSku}${CATALOG_AUTOMATION.VARIANT_SEPARATOR}${normalizedCode}`;
  }

  /* ======================== 3. Minimal SEO ============================= */

  /**
   * Generates fallback SEO metadata only when fields are empty.
   * Never overwrites values the user explicitly provided.
   */
  generateMinimalSEO(ctx: AutomationContext): SEOOutput {
    const metaTitle = (ctx.metaTitle || ctx.name).trim();

    let metaDescription = (ctx.metaDescription || ctx.shortDescription || "").trim();
    if (!metaDescription && ctx.description) {
      metaDescription = truncate(
        ctx.description,
        CATALOG_AUTOMATION.SEO_DESCRIPTION_MAX_LENGTH,
        CATALOG_AUTOMATION.SEO_DESCRIPTION_SUFFIX,
      );
    }

    const tags = ctx.tags && ctx.tags.length > 0 ? ctx.tags : this.extractTagsFromText(ctx.name);

    return {
      metaTitle,
      metaDescription,
      tags,
    };
  }

  /**
   * Extracts keywords from product name by filtering common stop words.
   * Relies on position priority — first meaningful words = most important.
   */
  private extractTagsFromText(text: string): string[] {
    if (!text) return [];

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const seen = new Set<string>();
    const result: string[] = [];

    for (const word of words) {
      if (seen.has(word)) continue;
      if (word.length < CATALOG_AUTOMATION.TAG_MIN_LENGTH) continue;
      if (/^\d+$/.test(word)) continue;
      if (TAG_STOP_WORDS.has(word)) continue;

      seen.add(word);
      result.push(word);

      if (result.length >= CATALOG_AUTOMATION.TAG_EXTRACTION_MAX) break;
    }

    return result;
  }

  /* ======================== 4. Auto-Pricing ============================ */

  /**
   * Calculates tiered pricing from cost price using the PricingEngine.
   * Falls back to simple percentage markups when no pricing rules exist.
   */
  async applyPricingRules(
    costPrice?: number | null,
    context?: {
      categoryId?: string | null;
      brandId?: string | null;
      supplierId?: string | null;
    },
  ): Promise<PricingOutput> {
    if (!costPrice || costPrice <= 0) return {};

    try {
      const result = await this.pricingEngine.simulatePrice({
        costPrice: Math.round(costPrice * 100),
        categoryId: context?.categoryId ?? undefined,
        brandId: context?.brandId ?? undefined,
        supplierId: context?.supplierId ?? undefined,
        quantity: 1,
        role: "customer",
      });

      if (result.retailPrice > 0) {
        return {
          sellingPrice: result.retailPrice,
          wholesalePrice: result.wholesalePrice,
          resellerPrice: result.resellerPrice,
        };
      }
    } catch (err) {
      logger.warn("PricingEngine simulation failed, using fallback markups", {
        costPrice,
        error: err instanceof Error ? err.message : "unknown",
      });
    }

    // Fallback: simple percentage markups
    const { DEFAULT_MARKUP_RETAIL, DEFAULT_MARKUP_WHOLESALE, DEFAULT_MARKUP_RESELLER } =
      CATALOG_AUTOMATION;
    return {
      sellingPrice: Math.round(costPrice * (1 + DEFAULT_MARKUP_RETAIL / 100)),
      wholesalePrice: Math.round(costPrice * (1 + DEFAULT_MARKUP_WHOLESALE / 100)),
      resellerPrice: Math.round(costPrice * (1 + DEFAULT_MARKUP_RESELLER / 100)),
    };
  }

  /* ======================== 5. Dynamic Badges ========================== */

  /**
   * Evaluates dynamic badge conditions and returns a deduplicated badge list.
   *
   * - "new_arrival": injected if createdAt is within the last N days.
   * - "limited": injected if stock > 0 && stock < LOW_STOCK_THRESHOLD.
   *
   * Preserves any badges the user manually assigned.
   */
  assignDynamicBadges(
    now: Date,
    createdAt: Date | string | null | undefined,
    stock?: number | null,
    existingBadges: string[] = [],
  ): string[] {
    const badges = new Set(existingBadges);

    // new_arrival — based on the product's creation date
    if (createdAt) {
      const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= CATALOG_AUTOMATION.NEW_ARRIVAL_DAYS) {
        badges.add("new_arrival");
      }
    }

    // limited — low stock indicator
    if (typeof stock === "number" && stock > 0 && stock < CATALOG_AUTOMATION.LOW_STOCK_THRESHOLD) {
      badges.add("limited");
    }

    return Array.from(badges);
  }

  /* ======================== Orchestrator =============================== */

  /**
   * Runs all five automation modules against the incoming context and returns
   * a fully enriched payload ready for persistence.
   *
   * This is the primary integration point for ProductService.create().
   */
  async generate(ctx: AutomationContext): Promise<EnrichedContext> {
    // Slug (only generate if none supplied)
    const finalSlug = ctx.slug?.trim()
      ? ctx.slug.toLowerCase().trim()
      : await this.generateUniqueSlug(ctx.name);

    // SKU (only generate if none supplied)
    const finalSku = ctx.sku?.trim()
      ? ctx.sku.toUpperCase().trim()
      : await this.generateProductSKU(ctx.categoryId ?? undefined);

    // SEO
    const seo = this.generateMinimalSEO(ctx);

    // Pricing
    const finalPricing = await this.applyPricingRules(ctx.costPrice ?? ctx.price, {
      categoryId: ctx.categoryId,
    });

    // Badges
    const finalBadges = this.assignDynamicBadges(
      new Date(),
      ctx.createdAt ?? new Date().toISOString(),
      ctx.stock,
      ctx.badges ?? [],
    );

    return {
      ...ctx,
      finalSlug,
      finalSku,
      finalMetaTitle: seo.metaTitle,
      finalMetaDescription: seo.metaDescription,
      finalTags: seo.tags,
      finalBadges,
      finalPricing,
    };
  }
}

export default ProductAutomationEngine;
