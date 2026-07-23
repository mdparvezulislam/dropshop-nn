import { ProductModel } from "./product-model";
import { logger } from "@/lib/utils/logger";

export interface MigrationResult {
  totalProcessed: number;
  migratedCount: number;
  errorsCount: number;
  details: string[];
}

/**
 * Migration policy implementation for PRODUCT-DOMAIN-002A
 * Safe, idempotent, zero-data-loss migration script.
 */
export async function migrateLegacyProductsToEnterpriseModel(): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalProcessed: 0,
    migratedCount: 0,
    errorsCount: 0,
    details: [],
  };

  try {
    const products = await ProductModel.find({ isDeleted: { $ne: true } }).exec();
    result.totalProcessed = products.length;

    for (const doc of products) {
      try {
        let isModified = false;

        // 1. Migrate boolean flags (featured, trending, flashSale, newArrival) to badges array
        const currentBadges: string[] = Array.isArray(doc.badges) ? [...doc.badges] : [];
        if (doc.featured && !currentBadges.includes("featured")) {
          currentBadges.push("featured");
          isModified = true;
        }
        if (doc.trending && !currentBadges.includes("trending")) {
          currentBadges.push("trending");
          isModified = true;
        }
        if (doc.flashSale && !currentBadges.includes("flash_sale")) {
          currentBadges.push("flash_sale");
          isModified = true;
        }
        if (doc.newArrival && !currentBadges.includes("new_arrival")) {
          currentBadges.push("new_arrival");
          isModified = true;
        }

        if (isModified || !doc.badges) {
          doc.badges = currentBadges;
        }

        // 2. Migrate SEO fields (metaTitle, metaDescription)
        if (!doc.metaTitle && doc.seo?.metaTitle) {
          doc.metaTitle = doc.seo.metaTitle;
          isModified = true;
        } else if (!doc.metaTitle) {
          doc.metaTitle = doc.name;
          isModified = true;
        }

        if (!doc.metaDescription && doc.seo?.metaDescription) {
          doc.metaDescription = doc.seo.metaDescription;
          isModified = true;
        } else if (!doc.metaDescription && doc.shortDescription) {
          doc.metaDescription = doc.shortDescription;
          isModified = true;
        }

        // 3. Migrate Content description & specifications
        if (!doc.description && doc.content?.description) {
          doc.description = doc.content.description;
          isModified = true;
        } else if (!doc.description && typeof doc.content?.richDescription === "string") {
          doc.description = doc.content.richDescription;
          isModified = true;
        }

        if ((!doc.specifications || doc.specifications.length === 0) && doc.content?.specifications) {
          doc.specifications = doc.content.specifications;
          isModified = true;
        }

        // 4. Save if updated
        if (isModified) {
          await doc.save();
          result.migratedCount++;
        }
      } catch (err: unknown) {
        result.errorsCount++;
        const msg = err instanceof Error ? err.message : "Unknown error";
        result.details.push(`Failed product ${doc._id}: ${msg}`);
        logger.error("Product Migration Error for doc", err, { docId: doc._id });
      }
    }

    logger.info("Product Migration completed successfully", result);
  } catch (error: unknown) {
    logger.error("Product Migration failed", error);
    throw error;
  }

  return result;
}
