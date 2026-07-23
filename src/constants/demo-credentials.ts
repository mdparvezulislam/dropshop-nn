/**
 * Development / demo login credentials.
 * Auto-seeded on first successful auth path when missing from the database.
 * Full control via Super Admin role (`*` permissions).
 */
export const DEMO_ADMIN = {
  email: "admin@dropshop.nn",
  username: "admin",
  password: "Admin@12345",
  fullName: "Demo Super Admin",
  phone: "+8801700000001",
  role: "Super Admin",
} as const;

export type DemoAdminCredentials = typeof DEMO_ADMIN;
