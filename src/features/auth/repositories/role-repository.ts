import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { RoleModel, RoleDocument } from "./role-model";
import { Role } from "../domain/role-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class RoleRepository extends BaseRepository<RoleDocument, Role> {
  constructor() {
    super(RoleModel, RoleRepository.mapToDomain);
  }

  private static mapToDomain(doc: RoleDocument): Role {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      permissions: doc.permissions || [],
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

  async findByName(name: string, options?: DatabaseQueryOptions): Promise<Role | null> {
    try {
      return this.findOne({ name: name.trim() }, options);
    } catch (error) {
      logger.error("RoleRepository findByName failed", error, { name });
      throw new DatabaseError("Database search error", error);
    }
  }
}
export default RoleRepository;
