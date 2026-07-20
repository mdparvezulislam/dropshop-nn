import { ProductRepository, CursorPaginationParams, PaginatedCatalogResult } from "../repositories/product-repository";
import { CategoryRepository, BrandRepository, CollectionRepository } from "../repositories/classification-repository";
import { Product } from "../domain/product-entity";
import { logger } from "@/shared/utils/logger";

export interface AutocompleteResult {
  suggestions: string[];
}

export class CatalogSearchService {
  private readonly productRepository: ProductRepository;
  private readonly categoryRepository: CategoryRepository;
  private readonly brandRepository: BrandRepository;
  private readonly collectionRepository: CollectionRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.brandRepository = new BrandRepository();
    this.collectionRepository = new CollectionRepository();
  }

  async search(
    query: string,
    pagination: CursorPaginationParams = { limit: 20 },
    filters: Record<string, unknown> = {},
  ): Promise<PaginatedCatalogResult<Product>> {
    logger.info("CatalogSearchService: searching products", { query });

    const searchFilter: Record<string, unknown> = {
      ...filters,
      status: { $in: ["active"] },
    };
    if (filters.status === undefined) {
      searchFilter.status = { $in: ["active"] };
    }

    return this.productRepository.search(query, pagination, searchFilter);
  }

  async filterByCategory(
    categoryId: string,
    pagination: CursorPaginationParams = { limit: 20 },
  ): Promise<PaginatedCatalogResult<Product>> {
    logger.info("CatalogSearchService: filtering by category", { categoryId });
    return this.productRepository.findByCategory(categoryId, pagination);
  }

  async filterByBrand(
    brandId: string,
    pagination: CursorPaginationParams = { limit: 20 },
  ): Promise<PaginatedCatalogResult<Product>> {
    logger.info("CatalogSearchService: filtering by brand", { brandId });
    return this.productRepository.findByBrand(brandId, pagination);
  }

  async filterByCollection(
    collectionId: string,
    pagination: CursorPaginationParams = { limit: 20 },
  ): Promise<PaginatedCatalogResult<Product>> {
    logger.info("CatalogSearchService: filtering by collection", { collectionId });

    const collection = await this.collectionRepository.findById(collectionId);
    if (!collection) {
      return { items: [], totalCount: 0, cursor: null, hasMore: false, limit: pagination.limit };
    }

    return this.productRepository.findByCollection(collection.productIds, pagination);
  }

  async autocomplete(
    query: string,
    limit: number = 10,
  ): Promise<AutocompleteResult> {
    logger.info("CatalogSearchService: autocomplete", { query });

    const results = await this.productRepository.search(query, { limit }, { status: "active" });

    const nameSuggestions = results.items.map((p) => p.name);
    const skuSuggestions = results.items.map((p) => p.sku);

    const suggestions = [...new Set([...nameSuggestions, ...skuSuggestions])].slice(0, limit);

    return { suggestions };
  }
}

export default CatalogSearchService;
