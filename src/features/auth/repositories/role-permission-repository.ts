import { BaseRepository } from "@/lib/database/generic-repository";
import { RolePermissionModel, RolePermissionDocument } from "./role-permission-model";
import { BaseDBEntity } from "@/lib/database/types";

export interface RolePermissionEntity extends BaseDBEntity {
  roleName: string;
  permissionName: string;
  grantedBy?: string;
  grantedAt?: Date;
}

export class RolePermissionRepository extends BaseRepository<RolePermissionDocument, RolePermissionEntity> {
  constructor() {
    super(RolePermissionModel, RolePermissionRepository.mapToDomain);
  }

  private static mapToDomain(doc: RolePermissionDocument): RolePermissionEntity {
    return {
      id: doc._id.toString(),
      roleName: doc.roleName,
      permissionName: doc.permissionName,
      grantedBy: doc.grantedBy,
      grantedAt: doc.grantedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted ?? false,
      status: "active",
    };
  }

  async findByRole(roleName: string): Promise<RolePermissionEntity[]> {
    return this.find({ roleName });
  }

  async deleteByRoleAndPermission(roleName: string, permissionName: string): Promise<void> {
    await this.model.deleteMany({ roleName, permissionName });
  }
}

export default RolePermissionRepository;
