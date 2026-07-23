import { UserRepository } from "@/features/auth/repositories/user-repository";
import { RoleRepository } from "@/features/auth/repositories/role-repository";
import { hashPassword } from "@/lib/utils/hash";
import { SYSTEM_ROLES, DEFAULT_PASSWORD_PLAIN, DEFAULT_AVATARS } from "../constants";
import { generateBDPhone, getRandomElement } from "../helpers/random";
import { SeedLogger } from "../helpers/logger";
import { User } from "@/features/auth/domain/user-entity";

export async function seedRoles(): Promise<void> {
  const roleRepo = new RoleRepository();
  for (const roleName of SYSTEM_ROLES) {
    const existing = await roleRepo.findByName(roleName);
    if (!existing) {
      const permissions = roleName === "Super Admin" ? ["*"] : [`${roleName.replace(/\s+/g, "")}.Access`];
      await roleRepo.create({
        name: roleName,
        description: `System role for ${roleName}`,
        permissions,
        status: "active",
      });
    }
  }
  SeedLogger.success("System roles seeded", SYSTEM_ROLES.length);
}

export async function seedUsers(): Promise<{
  superAdmin: User;
  admins: User[];
  resellers: User[];
  wholesalers: User[];
  suppliers: User[];
  customers: User[];
}> {
  await seedRoles();
  const userRepo = new UserRepository();
  const defaultPasswordHash = await hashPassword(DEFAULT_PASSWORD_PLAIN);

  // 1. Super Admin
  let superAdmin = await userRepo.findByEmail("admin@dropshop.com.bd");
  if (!superAdmin) {
    superAdmin = await userRepo.create({
      username: "superadmin",
      email: "admin@dropshop.com.bd",
      phone: "01700000000",
      fullName: "Super Admin",
      passwordHash: defaultPasswordHash,
      role: "Super Admin",
      status: "active",
      profileImage: DEFAULT_AVATARS[0],
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
    });
  }

  // 2. Admins & Managers
  const adminUsers: User[] = [superAdmin];
  const adminConfigs = [
    { username: "opsmanager", email: "ops@dropshop.com.bd", fullName: "Tariqul Islam (Ops Manager)", role: "Manager" },
    { username: "contentmgr", email: "content@dropshop.com.bd", fullName: "Nusrat Jahan (Content Lead)", role: "Content Manager" },
    { username: "supportlead", email: "support@dropshop.com.bd", fullName: "Tanvir Hossain (Support Lead)", role: "Support Staff" },
  ];

  for (let idx = 0; idx < adminConfigs.length; idx++) {
    const cfg = adminConfigs[idx];
    let u = await userRepo.findByEmail(cfg.email);
    if (!u) {
      u = await userRepo.create({
        username: cfg.username,
        email: cfg.email,
        phone: generateBDPhone(100 + idx),
        fullName: cfg.fullName,
        passwordHash: defaultPasswordHash,
        role: cfg.role,
        status: "active",
        profileImage: getRandomElement(DEFAULT_AVATARS),
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      });
    }
    adminUsers.push(u);
  }

  // 3. Resellers (25)
  const resellers: User[] = [];
  for (let i = 1; i <= 25; i++) {
    const email = `reseller${i}@dropshop.com.bd`;
    let u = await userRepo.findByEmail(email);
    if (!u) {
      u = await userRepo.create({
        username: `reseller_${i}`,
        email,
        phone: generateBDPhone(1000 + i),
        fullName: `Reseller Partner ${i}`,
        passwordHash: defaultPasswordHash,
        role: "Reseller",
        status: i === 25 ? "suspended" : i === 24 ? "pending" : "active",
        profileImage: getRandomElement(DEFAULT_AVATARS),
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      });
    }
    resellers.push(u);
  }

  // 4. Wholesale Buyers (20)
  const wholesalers: User[] = [];
  for (let i = 1; i <= 20; i++) {
    const email = `wholesale${i}@dropshop.com.bd`;
    let u = await userRepo.findByEmail(email);
    if (!u) {
      u = await userRepo.create({
        username: `wholesale_${i}`,
        email,
        phone: generateBDPhone(2000 + i),
        fullName: `Wholesale Trade Account ${i}`,
        passwordHash: defaultPasswordHash,
        role: "Wholesale Buyer",
        status: "active",
        profileImage: getRandomElement(DEFAULT_AVATARS),
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      });
    }
    wholesalers.push(u);
  }

  // 5. Suppliers (20)
  const suppliers: User[] = [];
  for (let i = 1; i <= 20; i++) {
    const email = `supplier${i}@dropshop.com.bd`;
    let u = await userRepo.findByEmail(email);
    if (!u) {
      u = await userRepo.create({
        username: `supplier_${i}`,
        email,
        phone: generateBDPhone(3000 + i),
        fullName: `Official Supplier ${i}`,
        passwordHash: defaultPasswordHash,
        role: "Supplier",
        status: "active",
        profileImage: getRandomElement(DEFAULT_AVATARS),
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      });
    }
    suppliers.push(u);
  }

  // 6. Customers (300)
  const customers: User[] = [];
  for (let i = 1; i <= 300; i++) {
    const email = `customer${i}@gmail.com`;
    let u = await userRepo.findByEmail(email);
    if (!u) {
      u = await userRepo.create({
        username: `customer_${i}`,
        email,
        phone: generateBDPhone(10000 + i),
        fullName: `Customer User ${i}`,
        passwordHash: defaultPasswordHash,
        role: "Customer",
        status: i > 295 ? "suspended" : "active",
        profileImage: getRandomElement(DEFAULT_AVATARS),
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      });
    }
    customers.push(u);
  }

  SeedLogger.success("Users seeded across all roles", 1 + adminConfigs.length + 25 + 20 + 20 + 300);

  return {
    superAdmin,
    admins: adminUsers,
    resellers,
    wholesalers,
    suppliers,
    customers,
  };
}
