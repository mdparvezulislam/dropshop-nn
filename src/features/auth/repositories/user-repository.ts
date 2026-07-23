import { BaseRepository } from "@/lib/database/generic-repository";
import { UserModel, UserDocument } from "./user-model";
import { User } from "../domain/user-entity";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class UserRepository extends BaseRepository<UserDocument, User> {
  constructor() {
    super(UserModel, UserRepository.mapToDomain);
  }

  private static mapToDomain(doc: UserDocument): User {
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      phone: doc.phone,
      fullName: doc.fullName,
      passwordHash: doc.passwordHash,
      role: doc.role,
      roles: Array.isArray(doc.roles) && doc.roles.length > 0 ? doc.roles : [doc.role],
      memberships: Array.isArray(doc.memberships) && doc.memberships.length > 0 ? doc.memberships : ["customer"],
      status: doc.status as any,
      profileImage: doc.profileImage,
      emailVerifiedAt: doc.emailVerifiedAt,
      phoneVerifiedAt: doc.phoneVerifiedAt,
      lastLoginAt: doc.lastLoginAt,
      loginHistory: doc.loginHistory
        ? doc.loginHistory.map((item) => ({
            ip: item.ip,
            userAgent: item.userAgent,
            loggedAt: item.loggedAt,
          }))
        : [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      failedLoginCount: doc.failedLoginCount ?? 0,
      mustChangePassword: doc.mustChangePassword ?? false,
      trustedDevices: (doc.trustedDevices as any) ?? [],
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findByEmail(email: string, options?: DatabaseQueryOptions): Promise<User | null> {
    try {
      return this.findOne({ email: email.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("UserRepository findByEmail failed", error, { email });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByPhone(phone: string, options?: DatabaseQueryOptions): Promise<User | null> {
    try {
      return this.findOne({ phone: phone.trim() }, options);
    } catch (error) {
      logger.error("UserRepository findByPhone failed", error, { phone });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByUsername(username: string, options?: DatabaseQueryOptions): Promise<User | null> {
    try {
      return this.findOne({ username: username.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("UserRepository findByUsername failed", error, { username });
      throw new DatabaseError("Database search error", error);
    }
  }

  async updateLoginHistory(
    userId: string,
    ip: string,
    userAgent: string,
    options?: DatabaseQueryOptions,
  ): Promise<void> {
    try {
      await this.model
        .findByIdAndUpdate(userId, {
          $set: { lastLoginAt: new Date() },
          $push: {
            loginHistory: {
              $each: [{ ip, userAgent, loggedAt: new Date() }],
              $slice: -20,
            },
          },
        })
        .session(options?.session || null)
        .exec();
    } catch (error) {
      logger.error("UserRepository updateLoginHistory failed", error, { userId });
      throw new DatabaseError("Database update error", error);
    }
  }
}
export default UserRepository;
