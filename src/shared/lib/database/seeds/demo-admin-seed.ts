import { UserRepository } from "@/features/auth/repositories/user-repository";
import { RoleRepository } from "@/features/auth/repositories/role-repository";
import { hashPassword } from "@/shared/utils/hash";
import { DEMO_ADMIN } from "@/shared/constants/demo-credentials";
import { logger } from "@/shared/utils/logger";
import { AuthorizationService } from "@/features/auth/services/authorization-service";

let seedPromise: Promise<void> | null = null;

/**
 * Ensures Super Admin role + demo admin user exist.
 * Idempotent and safe to call on every login attempt (single-flight).
 */
export async function ensureDemoAdminSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const roleRepository = new RoleRepository();
  const userRepository = new UserRepository();

  let superAdminRole = await roleRepository.findByName(DEMO_ADMIN.role);
  if (!superAdminRole) {
    superAdminRole = await roleRepository.create({
      name: DEMO_ADMIN.role,
      description: "Full system access for development and operations",
      permissions: ["*"],
      status: "active",
    });
    AuthorizationService.clearCache();
    logger.info("Demo seed: Super Admin role created", { roleId: superAdminRole.id });
  } else if (!superAdminRole.permissions.includes("*")) {
    await roleRepository.update(superAdminRole.id, {
      permissions: ["*"],
    });
    AuthorizationService.clearCache();
    logger.info("Demo seed: Super Admin role permissions upgraded to *");
  }

  const existing = await userRepository.findByEmail(DEMO_ADMIN.email);
  if (existing) {
    if (existing.role !== DEMO_ADMIN.role || existing.status !== "active") {
      await userRepository.update(existing.id, {
        role: DEMO_ADMIN.role,
        status: "active",
      });
      logger.info("Demo seed: existing admin upgraded to Super Admin", { userId: existing.id });
    }
    return;
  }

  const byUsername = await userRepository.findByUsername(DEMO_ADMIN.username);
  if (byUsername) {
    await userRepository.update(byUsername.id, {
      email: DEMO_ADMIN.email,
      role: DEMO_ADMIN.role,
      status: "active",
      passwordHash: await hashPassword(DEMO_ADMIN.password),
    });
    logger.info("Demo seed: username admin upgraded", { userId: byUsername.id });
    return;
  }

  const passwordHash = await hashPassword(DEMO_ADMIN.password);
  const user = await userRepository.create({
    username: DEMO_ADMIN.username,
    email: DEMO_ADMIN.email,
    phone: DEMO_ADMIN.phone,
    fullName: DEMO_ADMIN.fullName,
    passwordHash,
    role: DEMO_ADMIN.role,
    status: "active",
    emailVerifiedAt: new Date(),
    phoneVerifiedAt: new Date(),
    loginHistory: [],
  });

  logger.info("Demo seed: Super Admin user created", {
    userId: user.id,
    email: DEMO_ADMIN.email,
  });
}

export default ensureDemoAdminSeeded;
