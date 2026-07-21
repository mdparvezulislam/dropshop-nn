import { ProductRepository } from "@/features/catalog/repositories/product-repository";
import { PricingRepository } from "@/features/pricing/repositories/pricing-repository";
import { InventoryRepository } from "@/features/inventory/repositories/inventory-repository";
import { PRODUCTS_DATA } from "../datasets/products-data";
import { SeedLogger } from "../helpers/logger";
import { Product } from "@/features/catalog/domain/product-entity";
import { Brand, Category } from "@/features/catalog/domain/classification-entity";
import { Supplier } from "@/features/supplier/domain/supplier-entity";
import { slugify } from "../helpers/random";

export async function seedProducts(
  categories: Category[],
  brands: Brand[],
  suppliers: Supplier[],
): Promise<Product[]> {
  const productRepo = new ProductRepository();
  const pricingRepo = new PricingRepository();
  const inventoryRepo = new InventoryRepository();

  const products: Product[] = [];

  for (let i = 0; i < PRODUCTS_DATA.length; i++) {
    const data = PRODUCTS_DATA[i];
    const category = categories.find((c) => c.name === data.category) || categories[0];
    const brand = brands.find((b) => b.name === data.brand) || brands[0];
    const supplier = suppliers[i % suppliers.length];

    let product = await productRepo.findBySku(data.sku);
    if (!product) {
      product = await productRepo.create({
        name: data.name,
        slug: slugify(data.name),
        sku: data.sku,
        shortDescription: data.shortDescription,
        content: {
          highlights: [data.fullDescription],
          features: [data.shortDescription],
        },
        brandId: brand.id,
        categoryId: category.id,
        supplierId: supplier.id,
        status: "active",
        visibility: "public",
        featured: i < 5,
        trending: i >= 2 && i < 7,
        flashSale: i === 0 || i === 3,
        newArrival: true,
        variants: [],
        suppliers: [],
        tags: ["gadgets", "audio", "accessories"],
        media: data.images.map((url, idx) => ({
          url,
          type: "image",
          altText: `${data.name} Image ${idx + 1}`,
          isFeatured: idx === 0,
          sortOrder: idx,
        })),
        seo: {
          metaTitle: `${data.name} - Best Price in BD`,
          metaDescription: data.shortDescription,
        },
      });
    }

    // Seed Pricing & Inventory
    const existingPricing = await pricingRepo.findByProductAndVariant(product.id, product.sku);
    if (!existingPricing) {
      const sell = data.retailPrice;
      const cost = data.baseCostPrice;
      const profitAmt = Math.max(0, sell - cost);
      const profitPct = sell > 0 ? Number(((profitAmt / sell) * 100).toFixed(2)) : 0;

      await pricingRepo.create({
        productId: product.id,
        variantSku: product.sku,
        baseCostPrice: cost,
        purchasePrice: Math.round(cost * 1.02),
        supplierPrice: Math.round(cost * 1.05),
        sellingPrice: sell,
        wholesalePrice: data.wholesalePrice,
        resellerPrice: data.resellerPrice,
        comparePrice: Math.round(sell * 1.15),
        discountAmount: Math.round(sell * 0.15),
        discountPercentage: 15,
        profitMargin: profitPct,
        profitAmount: profitAmt,
        currency: "BDT",
        pricingRule: "fixed",
        status: "active",
      });
    }

    const existingInventory = await inventoryRepo.findByProductAndVariant(product.id, product.sku);
    if (!existingInventory) {
      await inventoryRepo.create({
        productId: product.id,
        variantSku: product.sku,
        availableStock: data.stock,
        reservedStock: Math.floor(data.stock * 0.1),
        incomingStock: 50,
        damagedStock: 0,
        returnedStock: 2,
        soldStock: 150,
        safetyStock: 10,
        reorderLevel: 20,
        lowStockThreshold: 15,
        availability: "in_stock",
      });
    }

    products.push(product);
  }

  SeedLogger.success("Products, Pricing & Inventory seeded", products.length);
  return products;
}
