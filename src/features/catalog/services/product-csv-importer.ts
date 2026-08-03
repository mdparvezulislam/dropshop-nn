import { DatabaseConnectionManager } from "@/lib/database/connection-manager";
import { ProductRepository } from "../repositories/product-repository";
import { CategoryRepository } from "../repositories/classification-repository";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { logger } from "@/lib/utils/logger";

export interface CSVProductRow {
  Name: string;
  Category: string;
  Brand?: string;
  RetailPrice: string | number;
  ResellerPrice?: string | number;
  WholesalePrice?: string | number;
  MOQ?: string | number;
  StockQuantity?: string | number;
  ImageFilenames?: string;
  ShortDescription?: string;
  FullDescription?: string;
}

export interface ImportResult {
  totalProcessed: number;
  importedCount: number;
  flaggedMissingImages: number;
  errors: string[];
}

export class ProductCSVImporter {
  private readonly productRepo = new ProductRepository();
  private readonly categoryRepo = new CategoryRepository();
  private readonly pricingService = new PricingService();

  /**
   * Bulk import products from parsed CSV rows.
   * Products missing valid images are automatically tagged with status: "draft"
   * and badge: "needs_image" so incomplete products are NOT published publicly.
   */
  async importProducts(rows: CSVProductRow[]): Promise<ImportResult> {
    await DatabaseConnectionManager.connect();

    const result: ImportResult = {
      totalProcessed: rows.length,
      importedCount: 0,
      flaggedMissingImages: 0,
      errors: [],
    };

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      try {
        if (!row.Name || !row.RetailPrice) {
          result.errors.push(`Row ${index + 1}: Name and RetailPrice are required.`);
          continue;
        }

        const name = row.Name.trim();
        const slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 6);

        // Process images
        const rawImages = (row.ImageFilenames || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const hasImages = rawImages.length > 0;
        if (!hasImages) {
          result.flaggedMissingImages++;
        }

        // Status & Badge Gating
        const status = hasImages ? "active" : "draft";
        const badges: string[] = hasImages ? ["new_arrival"] : ["needs_image"];

        const retailPriceMinor = Math.round(Number(row.RetailPrice) * 100);
        const resellerPriceMinor = row.ResellerPrice ? Math.round(Number(row.ResellerPrice) * 100) : undefined;
        const wholesalePriceMinor = row.WholesalePrice ? Math.round(Number(row.WholesalePrice) * 100) : undefined;

        // Create product entity
        const product = await this.productRepo.create({
          name,
          slug,
          sku: "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          status,
          visibility: "public",
          badges,
          tags: ["bulk-imported"],
          shortDescription: row.ShortDescription?.trim() || "",
          description: row.FullDescription?.trim() || "",
          specifications: [],
          media: rawImages.map((url, i) => ({
            url: url.startsWith("/") || url.startsWith("http") ? url : `/images/products/${url}`,
            isFeatured: i === 0,
            type: "image",
          })),
          hasVariants: false,
          variants: [],
          stockQuantity: Number(row.StockQuantity) || 50,
        });

        // Set pricing record via schema parse
        await this.pricingService.createPricing({
          productId: product.id,
          variantSku: "",
          baseCostPrice: Math.round(retailPriceMinor * 0.6),
          purchasePrice: Math.round(retailPriceMinor * 0.6),
          supplierPrice: Math.round(retailPriceMinor * 0.6),
          sellingPrice: retailPriceMinor,
          wholesalePrice: wholesalePriceMinor ?? Math.round(retailPriceMinor * 0.75),
          resellerPrice: resellerPriceMinor ?? Math.round(retailPriceMinor * 0.85),
          comparePrice: Math.round(retailPriceMinor * 1.2),
          discountAmount: 0,
          discountPercentage: 0,
          currency: "BDT",
          taxRate: 0,
          taxInclusive: false,
          commissionRate: 0,
          pricingRule: "fixed",
          status: "active",
        });

        result.importedCount++;
      } catch (err: any) {
        logger.error(`ProductCSVImporter: Failed on row ${index + 1}`, err);
        result.errors.push(`Row ${index + 1} (${row.Name}): ${err.message || "Unknown error"}`);
      }
    }

    return result;
  }
}
