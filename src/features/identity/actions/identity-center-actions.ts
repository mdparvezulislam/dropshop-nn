"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import { RoleRepository } from "@/features/auth/repositories/role-repository";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getIdentityCenterStatsAction(): Promise<{
  success: boolean;
  data?: {
    totalUsers: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    pendingApprovals: number;
    activeSessions: number;
    recentUsers: Array<{ id: string; fullName: string; email: string; role: string; status: string; createdAt: Date }>;
    roleDistribution: Array<{ role: string; count: number }>;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.View");

    const userRepo = new UserRepository();

    const [allUsers, activeCount, pendingCount, suspendedCount] = await Promise.all([
      userRepo.findPaginated({ isDeleted: { $ne: true } }, { page: 1, limit: 500 }, { sortBy: "createdAt", sortOrder: "desc" }),
      userRepo.count({ status: "active", isDeleted: { $ne: true } }).catch(() => 0),
      userRepo.count({ status: "pending", isDeleted: { $ne: true } }).catch(() => 0),
      userRepo.count({ status: "suspended", isDeleted: { $ne: true } }).catch(() => 0),
    ]);

    const byRole: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const u of allUsers.items) {
      const role = (u as any).role ?? "unknown";
      const status = (u as any).status ?? "unknown";
      byRole[role] = (byRole[role] ?? 0) + 1;
      byStatus[status] = (byStatus[status] ?? 0) + 1;
    }

    let activeSessions = 0;
    try {
      const { UserSessionModel } = await import("@/features/auth/repositories/user-session-model");
      activeSessions = await UserSessionModel.countDocuments({ expiresAt: { $gt: new Date() } });
    } catch { activeSessions = 0; }

    let pendingApprovals = 0;
    try {
      const { BusinessProfileService } = await import("../services/business-profile-service");
      const profileService = new BusinessProfileService();
      const pending = await profileService.findPendingApprovals();
      pendingApprovals = Array.isArray(pending) ? pending.length : 0;
    } catch { pendingApprovals = 0; }

    const roleDistribution = Object.entries(byRole).map(([role, count]) => ({ role, count }));

    return {
      success: true,
      data: {
        totalUsers: allUsers.totalCount,
        byRole,
        byStatus,
        pendingApprovals,
        activeSessions,
        recentUsers: allUsers.items.slice(0, 10).map((u: any) => ({
          id: u.id,
          fullName: u.fullName ?? u.name ?? "Unknown",
          email: u.email ?? "",
          role: u.role ?? "unknown",
          status: u.status ?? "unknown",
          createdAt: u.createdAt,
        })),
        roleDistribution,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load stats" };
  }
}

export async function exportUsersCsvAction(role?: string): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "User.View");

    const userRepo = new UserRepository();
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (role) filter.role = role;

    const users = await userRepo.find(filter, { sort: { createdAt: -1 } } as any);

    const header = "Name,Email,Phone,Role,Status,Created At";
    const rows = users.map((u: any) =>
      [
        `"${u.fullName ?? u.name ?? ""}"`,
        u.email ?? "",
        u.phone ?? "",
        u.role ?? "",
        u.status ?? "",
        new Date(u.createdAt).toISOString(),
      ].join(","),
    );

    return { success: true, data: [header, ...rows].join("\n") };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Export failed" };
  }
}

const importUsersSchema = z.object({
  csvData: z.string().min(1),
});

export async function importUsersCsvAction(csvData: string): Promise<{
  success: boolean;
  data?: {
    imported: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
    duplicates: Array<{ row: number; email: string }>;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "User.Create");

    const lines = csvData.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return { success: false, error: "CSV must have a header and at least one row" };

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const phoneIdx = headers.indexOf("phone");
    const roleIdx = headers.indexOf("role");

    if (nameIdx === -1 || emailIdx === -1 || phoneIdx === -1) {
      return { success: false, error: "CSV must have Name, Email, and Phone columns" };
    }

    const userRepo = new UserRepository();
    let imported = 0;
    let skipped = 0;
    const errors: Array<{ row: number; message: string }> = [];
    const duplicates: Array<{ row: number; email: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const name = cols[nameIdx];
      const email = cols[emailIdx];
      const phone = cols[phoneIdx];
      const role = roleIdx >= 0 ? cols[roleIdx] : "customer";

      if (!name || !email || !phone) {
        errors.push({ row: i + 1, message: "Missing required fields" });
        skipped++;
        continue;
      }

      try {
        const existing = await userRepo.findByEmail(email);
        if (existing) {
          duplicates.push({ row: i + 1, email });
          skipped++;
          continue;
        }

        await userRepo.create({
          username: email.split("@")[0],
          fullName: name,
          email,
          phone,
          role,
          status: "pending",
          passwordHash: "",
        } as any);
        imported++;
      } catch (err) {
        errors.push({ row: i + 1, message: err instanceof Error ? err.message : "Create failed" });
        skipped++;
      }
    }

    revalidatePath("/dashboard/identity/users");
    return { success: true, data: { imported, skipped, errors, duplicates } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Import failed" };
  }
}

export async function createRoleAction(data: { name: string; description?: string; permissions: string[] }): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.Manage");

    const repo = new RoleRepository();
    await repo.create({
      name: data.name,
      description: data.description ?? "",
      permissions: data.permissions,
    } as any);

    revalidatePath("/dashboard/identity/roles");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Create failed" };
  }
}

export async function updateRoleAction(id: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.Manage");

    const repo = new RoleRepository();
    await repo.update(id, data as any);

    revalidatePath("/dashboard/identity/roles");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function deleteRoleAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Identity.Manage");

    const repo = new RoleRepository();
    await repo.delete(id);

    revalidatePath("/dashboard/identity/roles");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

export async function bulkUpdateUserStatusAction(userIds: string[], status: "active" | "pending" | "suspended"): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "User.Update");

    const repo = new UserRepository();
    let processed = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await repo.update(userId, { status } as any);
        processed++;
      } catch { failed++; }
    }

    revalidatePath("/dashboard/identity/users");
    return { success: true, data: { processed, failed } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Bulk update failed" };
  }
}
