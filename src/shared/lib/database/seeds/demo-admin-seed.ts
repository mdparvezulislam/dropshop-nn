import { UserRepository } from "@/features/auth/repositories/user-repository";
import { RoleRepository } from "@/features/auth/repositories/role-repository";
import { hashPassword } from "@/shared/utils/hash";
import { DEMO_ADMIN } from "@/shared/constants/demo-credentials";
import { logger } from "@/shared/utils/logger";
import { AuthorizationService } from "@/features/auth/services/authorization-service";

let seedPromise: Promise<void> | null = null;

/**
 * Ensures default roles + demo super admin exist.
 * Idempotent and non-destructive for existing user accounts.
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

  const defaultRoles = [
    { name: "Super Admin", permissions: ["*"] },
    { name: "Admin", permissions: ["Admin.Access"] },
    { name: "Reseller", permissions: ["Reseller.Access"] },
    { name: "Wholesale Buyer", permissions: ["Wholesale.Access"] },
    { name: "Supplier", permissions: ["Supplier.Access"] },
    { name: "Customer", permissions: ["Customer.Access"] },
  ];

  for (const r of defaultRoles) {
    const existingRole = await roleRepository.findByName(r.name);
    if (!existingRole) {
      await roleRepository.create({
        name: r.name,
        description: `Default system role: ${r.name}`,
        permissions: r.permissions,
        status: "active",
      });
    }
  }

  const existing = await userRepository.findByEmail(DEMO_ADMIN.email);
  if (existing) {
    if (existing.role !== DEMO_ADMIN.role || existing.status !== "active") {
      await userRepository.update(existing.id, {
        role: DEMO_ADMIN.role,
        status: "active",
      });
      logger.info("Demo seed: verified Super Admin status", { userId: existing.id });
    }
    return;
  }

  const byUsername = await userRepository.findByUsername(DEMO_ADMIN.username);
  if (byUsername) {
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
