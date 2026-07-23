"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import { RoleRepository } from "@/features/auth/repositories/role-repository";
import { BusinessProfileService } from "../services/business-profile-service";
import { SessionService } from "../services/session-service";
import { SYSTEM_ROLES } from "@/lib/core/permissions";
import { FeatureFlags, Settings } from "@/lib/core/feature-flags";
import { AuditLogger } from "@/lib/audit-logger";
import { revalidatePath } from "next/cache";
import type { User } from "@/features/auth/domain/user-entity";

function sessionActor(session: unknown): { id: string; name?: string; role?: string } {
  const user = (session as { user?: { id?: string; name?: string | null; role?: string } } | null)
    ?.user;
  return {
    id: user?.id ?? "system",
    name: user?.name ?? undefined,
    role: user?.role,
  };
}

function stripUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

const listUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["active", "pending", "suspended"]),
});

export async function listUsersAdminAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: {
    items: Omit<User, "passwordHash">[];
    totalCount: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "User.View");
    const validated = listUsersSchema.parse(query ?? {});
    const repo = new UserRepository();

    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (validated.role) filter.role = validated.role;
    if (validated.status) filter.status = validated.status;
    if (validated.search) {
      const q = validated.search.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    const result = await repo.findPaginated(
      filter,
      { page: validated.page, limit: validated.limit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    return {
      success: true,
      data: {
        items: result.items.map(stripUser),
        totalCount: result.totalCount,
        page: result.page,
        totalPages: result.totalPages,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list users",
    };
  }
}

export async function updateUserStatusAdminAction(payload: unknown): Promise<{
  success: boolean;
  data?: Omit<User, "passwordHash">;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "User.Update");
    const validated = updateUserStatusSchema.parse(payload);
    const actor = sessionActor(session);
    const repo = new UserRepository();
    const updated = await repo.update(validated.userId, { status: validated.status } as any);

    await AuditLogger.record({
      action: "user.status_updated",
      entityType: "user",
      entityId: validated.userId,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      changes: [{ field: "status", oldValue: undefined, newValue: validated.status }],
    });

    revalidatePath("/dashboard/identity/users");
    return { success: true, data: stripUser(updated) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update user",
    };
  }
}

export async function listRolesAdminAction(): Promise<{
  success: boolean;
  data?: {
    systemRoles: { name: string; description: string; permissions: string[]; isSystem?: boolean }[];
    dbRoles: { id: string; name: string; description?: string; permissions: string[] }[];
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.View");
    const repo = new RoleRepository();
    let dbRoles: { id: string; name: string; description?: string; permissions: string[] }[] = [];
    try {
      const roles = await repo.find({ isDeleted: { $ne: true } });
      dbRoles = roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions ?? [],
      }));
    } catch {
      dbRoles = [];
    }

    return {
      success: true,
      data: {
        systemRoles: SYSTEM_ROLES.map((r) => ({
          name: r.name,
          description: r.description,
          permissions: r.permissions,
          isSystem: r.isSystem,
        })),
        dbRoles,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list roles",
    };
  }
}

export async function listAllActiveSessionsAdminAction(): Promise<{
  success: boolean;
  data?: {
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
    createdAt: Date;
    lastActivity: Date;
  }[];
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.Sessions");

    const { UserSessionModel } = await import(
      "@/features/auth/repositories/user-session-model"
    );
    const docs = await UserSessionModel.find({
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();

    return {
      success: true,
      data: docs.map((doc: any) => ({
        id: doc._id.toString(),
        userId: doc.userId?.toString?.() ?? String(doc.userId),
        ipAddress: doc.ipAddress ?? "unknown",
        userAgent: doc.userAgent ?? "unknown",
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt,
        lastActivity: doc.updatedAt || doc.createdAt,
      })),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list sessions",
    };
  }
}

export async function getIdentityOpsOverviewAction(): Promise<{
  success: boolean;
  data?: {
    pendingApprovals: number;
    activeUsers: number;
    suspendedUsers: number;
    pendingUsers: number;
    activeSessions: number;
    recentApprovals: {
      id: string;
      businessName: string;
      role: string;
      status: string;
      ownerName: string;
      email: string;
      createdAt: Date;
    }[];
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.View");

    const userRepo = new UserRepository();
    const profileService = new BusinessProfileService();

    const [pending, activeUsers, suspendedUsers, pendingUsers, pendingList] =
      await Promise.all([
        profileService.findPendingApprovals().catch(() => []),
        userRepo.count({ status: "active", isDeleted: { $ne: true } }).catch(() => 0),
        userRepo.count({ status: "suspended", isDeleted: { $ne: true } }).catch(() => 0),
        userRepo.count({ status: "pending", isDeleted: { $ne: true } }).catch(() => 0),
        profileService.findPendingApprovals().catch(() => []),
      ]);

    let activeSessions = 0;
    try {
      const { UserSessionModel } = await import(
        "@/features/auth/repositories/user-session-model"
      );
      activeSessions = await UserSessionModel.countDocuments({
        expiresAt: { $gt: new Date() },
      });
    } catch {
      activeSessions = 0;
    }

    const list = Array.isArray(pendingList) ? pendingList : [];

    return {
      success: true,
      data: {
        pendingApprovals: Array.isArray(pending) ? pending.length : 0,
        activeUsers,
        suspendedUsers,
        pendingUsers,
        activeSessions,
        recentApprovals: list.slice(0, 8).map((p: any) => ({
          id: p.id,
          businessName: p.businessName,
          role: p.role,
          status: p.status,
          ownerName: p.ownerName,
          email: p.email,
          createdAt: p.createdAt,
        })),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load identity overview",
    };
  }
}

export async function getPlatformSettingsAction(): Promise<{
  success: boolean;
  data?: {
    flags: { key: string; name: string; description: string; state: string }[];
    settings: {
      key: string;
      name: string;
      description: string;
      scope: string;
      value: unknown;
    }[];
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Settings.View");

    const flags = FeatureFlags.getAll().map((f) => ({
      key: f.key,
      name: f.name,
      description: f.description,
      state: f.defaultState,
    }));

    const settings = Settings.getAll().map((s) => ({
      key: s.key,
      name: s.name,
      description: s.description,
      scope: s.scope,
      value: s.defaultValue,
    }));

    return { success: true, data: { flags, settings } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load settings",
    };
  }
}

export async function updateFeatureFlagAction(payload: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Settings.Update");
    const schema = z.object({
      key: z.string().min(1),
      state: z.enum(["on", "off", "partial"]),
    });
    const validated = schema.parse(payload);
    const actor = sessionActor(session);

    FeatureFlags.setState(validated.key, validated.state);

    await AuditLogger.record({
      action: "settings.feature_flag_updated",
      entityType: "feature_flag",
      entityId: validated.key,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      changes: [{ field: "state", oldValue: undefined, newValue: validated.state }],
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update flag",
    };
  }
}

export async function getAdminAuditFeedAction(limit = 50): Promise<{
  success: boolean;
  data?: {
    id: string;
    eventName: string;
    timestamp: Date;
    actorId?: string;
    actorRole?: string;
    entityType?: string;
    entityId?: string;
    module: string;
    metadata: Record<string, string | number | boolean | null | undefined>;
  }[];
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.View");

    const { EventFactRepository } = await import(
      "@/features/analytics/repositories/event-fact-repository"
    );
    const repo = new EventFactRepository();
    const recent = await repo.listRecent(Math.min(limit, 100));

    // Prefer admin/security/identity related events; fall back to recent stream
    const adminish = recent.filter(
      (e) =>
        e.module === "identity" ||
        e.module === "system" ||
        e.eventName.includes("notification") ||
        e.eventName.includes("user") ||
        e.eventName.includes("login") ||
        e.eventName.startsWith("order.") ||
        e.eventName.startsWith("cms."),
    );

    const feed = (adminish.length > 0 ? adminish : recent).slice(0, limit).map((e) => ({
      id: e.id,
      eventName: e.eventName,
      timestamp: e.timestamp,
      actorId: e.actorId,
      actorRole: e.actorRole,
      entityType: e.entityType,
      entityId: e.entityId,
      module: e.module,
      metadata: e.metadata,
    }));

    return { success: true, data: feed };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load audit feed",
    };
  }
}
