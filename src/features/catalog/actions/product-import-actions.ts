"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { ProductService } from "../services/product-service";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";
import { ProductRepository } from "../repositories/product-repository";

function parseCsvRow(headers: string[], line: string): Record<string, string> {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  const row: Record<string, string> = {};
  for (let i = 0; i < headers.length && i < values.length; i++) {
    row[headers[i]] = values[i];
  }
  return row;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

const SUPPORTED_HEADERS: Record<string, string> = {
  name: "name",
  sku: "sku",
  shortdescription: "shortDescription",
  productmodel: "productModel",
  barcode: "barcode",
  brandid: "brandId",
  categoryid: "categoryId",
  supplierid: "supplierId",
  status: "status",
  visibility: "visibility",
  sellingprice: "sellingPrice",
  stock: "stock",
  tags: "tags",
};

export async function importProductsCsvAction(csvData: string): Promise<{
  success: boolean;
  data?: {
    imported: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
    duplicates: Array<{ row: number; sku: string; existingId: string }>;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Create");

    const lines = csvData.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, error: "CSV must contain a header row and at least one data row" };
    }

    const rawHeaders = lines[0].split(",").map((h) => h.trim());
    const headerMap: Record<string, number> = {};
    for (let i = 0; i < rawHeaders.length; i++) {
      const normalized = normalizeHeader(rawHeaders[i]);
      const mapped = SUPPORTED_HEADERS[normalized];
      if (mapped) {
        headerMap[mapped] = i;
      }
    }

    if (headerMap.name === undefined && headerMap.sku === undefined) {
      return { success: false, error: "CSV must contain at least 'name' or 'sku' column" };
    }

    const service = new ProductService();
    const pricingService = new PricingService();
    const productRepo = new ProductRepository();
    const userObj = session?.user as any;
    const actor = { id: userObj?.id || "admin", name: userObj?.name || "Admin", role: userObj?.role || "ADMIN" };

    let imported = 0;
    let skipped = 0;
    const errors: Array<{ row: number; message: string }> = [];
    const duplicates: Array<{ row: number; sku: string; existingId: string }> = [];

    for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
      const row = parseCsvRow(rawHeaders, lines[rowIndex]);
      const rowNumber = rowIndex + 1;

      try {
        const name = row.name?.trim();
        const sku = row.sku?.trim();

        if (name || sku) {
          const actualSku = sku || `IMP-${Date.now()}-${rowIndex}`;
          const actualName = name || `Imported Product ${rowIndex}`;

          const existingBySku = await productRepo.findBySku(actualSku);
          if (existingBySku) {
            duplicates.push({ row: rowNumber, sku: actualSku, existingId: existingBySku.id });
            skipped++;
            continue;
          }

          const tags = row.tags
            ? row.tags.split(";").map((t: string) => t.trim()).filter(Boolean)
            : [];

          const productData: any = {
            name: actualName,
            sku: actualSku,
            shortDescription: row.shortDescription || undefined,
            productModel: row.productModel || undefined,
            barcode: row.barcode || undefined,
            brandId: row.brandId || undefined,
            categoryId: row.categoryId || undefined,
            supplierId: row.supplierId || undefined,
            status: row.status || "draft",
            visibility: (row.visibility as any) || "public",
            tags,
          };

          if (row.stock) {
            const stockVal = parseInt(row.stock, 10);
            if (!isNaN(stockVal)) {
              productData.stockQuantity = stockVal;
            }
          }

          const created = await service.create(productData as any, actor);

          if (row.sellingPrice) {
            const priceInBdt = parseFloat(row.sellingPrice);
            if (!isNaN(priceInBdt) && priceInBdt > 0) {
              const priceInCents = Math.round(priceInBdt * 100);
              await pricingService.createPricing(
                {
                  productId: created.id,
                  sellingPrice: priceInCents,
                  baseCostPrice: 0,
                  purchasePrice: 0,
                  supplierPrice: 0,
                  wholesalePrice: 0,
                  resellerPrice: 0,
                  comparePrice: 0,
                  discountAmount: 0,
                  discountPercentage: 0,
                  taxRate: 0,
                  taxInclusive: false,
                  commissionRate: 0,
                  currency: "BDT",
                  pricingRule: "fixed",
                  status: "active",
                },
                userObj?.id,
              );
            }
          }

          imported++;
        } else {
          skipped++;
          errors.push({ row: rowNumber, message: "Missing required field: name or sku" });
        }
      } catch (err: unknown) {
        skipped++;
        errors.push({
          row: rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    revalidatePath("/dashboard/products");
    return {
      success: true,
      data: { imported, skipped, errors, duplicates },
    };
  } catch (err: unknown) {
    logger.error("Failed to import products CSV", err);
    return { success: false, error: err instanceof Error ? err.message : "CSV import failed" };
  }
}
