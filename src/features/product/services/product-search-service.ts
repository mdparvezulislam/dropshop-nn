import { ProductRepository } from "../repositories/product-repository";
import { Product } from "../domain/product-entity";
import { logger } from "@/shared/utils/logger";

export interface SearchProductFilter {
  query?: string;
  sku?: string;
  barcode?: string;
  brandId?: string;
  categoryId?: string;
  status?: string;
  tag?: string;
  isFeatured?: boolean;
}

export class ProductSearchService {
  private readonly productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async searchProducts(filter: SearchProductFilter): Promise<Product[]> {
    logger.info("ProductSearchService: searching products using query index", filter);

    const mongoFilter: any = {};

    if (filter.query) {
      mongoFilter.$or = [
        { name: { $regex: filter.query, $options: "i" } },
        { sku: { $regex: filter.query, $options: "i" } },
        { model: { $regex: filter.query, $options: "i" } },
      ];
    }

    if (filter.sku) {
      mongoFilter.sku = filter.sku.toUpperCase().trim();
    }

    if (filter.barcode) {
      mongoFilter.barcode = filter.barcode.trim();
    }

    if (filter.brandId) {
      mongoFilter.brandId = filter.brandId;
    }

    if (filter.categoryId) {
      mongoFilter.categoryId = filter.categoryId;
    }

    if (filter.status) {
      mongoFilter.status = filter.status;
    }

    if (filter.tag) {
      mongoFilter.tags = filter.tag;
    }

    if (filter.isFeatured !== undefined) {
      mongoFilter.isFeatured = filter.isFeatured;
    }

    return this.productRepository.find(mongoFilter);
  }
}
export default ProductSearchService;
