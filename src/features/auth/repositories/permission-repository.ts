import { BaseRepository } from "@/lib/database/generic-repository";
import { PermissionModel, PermissionDocument } from "./permission-model";
import { Permission } from "../domain/permission-entity";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class PermissionRepository extends BaseRepository<PermissionDocument, Permission> {
  constructor() {
    super(PermissionModel, PermissionRepository.mapToDomain);
  }

  private static mapToDomain(doc: PermissionDocument): Permission {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findByName(name: string, options?: DatabaseQueryOptions): Promise<Permission | null> {
    try {
      return this.findOne({ name: name.trim() }, options);
    } catch (error) {
      logger.error("PermissionRepository findByName failed", error, { name });
      throw new DatabaseError("Database search error", error);
    }
  }
}
export default PermissionRepository;
