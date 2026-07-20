import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { BrandModel, BrandDocument, CategoryModel, CategoryDocument, CollectionModel, CollectionDocument, ProductTagModel, ProductTagDocument } from "./classification-model";
import { Brand, Category, Collection, ProductTag } from "../domain/classification-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class BrandRepository extends BaseRepository<BrandDocument, Brand> {
  constructor() {
    super(BrandModel, BrandRepository.mapToDomain);
  }

  private static mapToDomain(doc: BrandDocument): Brand {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      logo: doc.logo,
      description: doc.description,
      website: doc.website,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findBySlug(slug: string, options?: DatabaseQueryOptions): Promise<Brand | null> {
    try {
      return this.findOne({ slug: slug.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("BrandRepository findBySlug failed", error, { slug });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class CategoryRepository extends BaseRepository<CategoryDocument, Category> {
  constructor() {
    super(CategoryModel, CategoryRepository.mapToDomain);
  }

  private static mapToDomain(doc: CategoryDocument): Category {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      parentCategoryId: doc.parentCategoryId?.toString() || null,
      description: doc.description,
      image: doc.image,
      sortOrder: doc.sortOrder,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findBySlug(slug: string, options?: DatabaseQueryOptions): Promise<Category | null> {
    try {
      return this.findOne({ slug: slug.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("CategoryRepository findBySlug failed", error, { slug });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findChildren(
    parentId: string,
    options?: DatabaseQueryOptions,
  ): Promise<Category[]> {
    try {
      return this.find({ parentCategoryId: parentId }, options);
    } catch (error) {
      logger.error("CategoryRepository findChildren failed", error, { parentId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async getTree(options?: DatabaseQueryOptions): Promise<Category[]> {
    try {
      const docs = await this.model.find({ isDeleted: { $ne: true } })
        .sort({ sortOrder: 1 })
        .session(options?.session || null)
        .lean()
        .exec();
      return docs.map((doc: any) => CategoryRepository.mapToDomain(doc as CategoryDocument));
    } catch (error) {
      logger.error("CategoryRepository getTree failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class CollectionRepository extends BaseRepository<CollectionDocument, Collection> {
  constructor() {
    super(CollectionModel, CollectionRepository.mapToDomain);
  }

  private static mapToDomain(doc: CollectionDocument): Collection {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      image: doc.image,
      isActive: doc.isActive,
      sortOrder: doc.sortOrder,
      productIds: doc.productIds ? doc.productIds.map((id: any) => id.toString()) : [],
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findBySlug(slug: string, options?: DatabaseQueryOptions): Promise<Collection | null> {
    try {
      return this.findOne({ slug: slug.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("CollectionRepository findBySlug failed", error, { slug });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findActive(options?: DatabaseQueryOptions): Promise<Collection[]> {
    try {
      const docs = await this.model.find({ isActive: true, isDeleted: { $ne: true } })
        .sort({ sortOrder: 1 })
        .session(options?.session || null)
        .lean()
        .exec();
      return docs.map((doc: any) => CollectionRepository.mapToDomain(doc as CollectionDocument));
    } catch (error) {
      logger.error("CollectionRepository findActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class ProductTagRepository extends BaseRepository<ProductTagDocument, ProductTag> {
  constructor() {
    super(ProductTagModel, ProductTagRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductTagDocument): ProductTag {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }
}
