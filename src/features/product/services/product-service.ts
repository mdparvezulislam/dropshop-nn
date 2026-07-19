import { ProductRepository } from "../repositories/product-repository";
import { Product } from "../domain/product-entity";
import { ValidationError, NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { generateSlug } from "@/shared/utils/slug-utils";

export class ProductService {
  private readonly productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.productRepository.findOne({ slug: uniqueSlug });
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  async createProduct(data: any): Promise<Product> {
    logger.info("ProductService: creating product", { name: data.name });

    const existingSku = await this.productRepository.findOne({
      sku: data.sku.toUpperCase().trim(),
    });
    if (existingSku) {
      throw new ValidationError("Base SKU is already in use", {
        sku: ["Base SKU is already registered"],
      });
    }

    const slug = await this.generateUniqueSlug(data.name);

    const result = await this.productRepository.create({
      ...data,
      slug,
      status: "draft",
    });

    logger.info("ProductService: product created successfully", { slug, id: result.id });
    return result;
  }

  async updateProduct(id: string, data: any): Promise<Product> {
    logger.info("ProductService: updating product details", { id });

    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    let slug = existing.slug;
    if (data.name && data.name.trim().toLowerCase() !== existing.name.trim().toLowerCase()) {
      slug = await this.generateUniqueSlug(data.name);
    }

    if (data.sku && data.sku.toUpperCase().trim() !== existing.sku.toUpperCase().trim()) {
      const existingSku = await this.productRepository.findOne({
        sku: data.sku.toUpperCase().trim(),
      });
      if (existingSku) {
        throw new ValidationError("SKU already exists", {
          sku: ["Product SKU is already registered"],
        });
      }
    }

    return this.productRepository.update(id, {
      ...data,
      slug,
    });
  }

  async duplicateProduct(id: string): Promise<Product> {
    logger.info("ProductService: duplicating product record", { id });

    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Source product not found");
    }

    const name = `${existing.name} (Copy)`;
    const slug = await this.generateUniqueSlug(name);
    const sku = `${existing.sku}-DUP-${Date.now().toString().slice(-4)}`;

    const duplicated = await this.productRepository.create({
      name,
      slug,
      sku,
      shortDescription: existing.shortDescription,
      fullDescription: existing.fullDescription,
      productModel: existing.productModel,
      barcode: existing.barcode ? `${existing.barcode}-DUP` : undefined,
      gtin: existing.gtin ? `${existing.gtin}-DUP` : undefined,
      brandId: existing.brandId,
      categoryId: existing.categoryId,
      supplierId: existing.supplierId,
      status: "draft",
      visibility: existing.visibility,
      variants: existing.variants.map((v) => ({
        ...v,
        sku: `${v.sku}-DUP-${Date.now().toString().slice(-4)}`,
      })),
      media: existing.media,
      attributes: existing.attributes,
      seo: existing.seo,
      tags: existing.tags,
      isFeatured: false,
      isTrending: false,
      isNewArrival: false,
      isBestSeller: false,
    });

    logger.info("ProductService: product duplicated successfully", {
      sourceId: id,
      newId: duplicated.id,
    });
    return duplicated;
  }

  async updateStatus(
    id: string,
    status: "draft" | "pending_review" | "active" | "inactive" | "archived",
  ): Promise<Product> {
    logger.info("ProductService: updating product status", { id, status });
    return this.productRepository.update(id, { status });
  }

  async softDeleteProduct(id: string): Promise<boolean> {
    logger.info("ProductService: soft deleting product", { id });
    return this.productRepository.delete(id);
  }
}
export default ProductService;
