import { DEMO_ADMIN } from "@/constants/demo-credentials";

/**
 * TEMPORARY DEV-ONLY FAKE LOGIN
 * ------------------------------
 * Allows dashboard access without MongoDB using demo Super Admin credentials.
 *
 * REMOVE before production:
 * 1. Set ENABLE_FAKE_LOGIN=false (or unset)
 * 2. Delete this file
 * 3. Remove fake branch from auth.ts
 * 4. Remove demo card / prefill from login page if undesired
 * 5. Keep real DB seed (demo-admin-seed) only if you still want a seeded admin
 */

export interface FakeAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

/** True only in non-production when ENABLE_FAKE_LOGIN is not explicitly "false". */
export function isFakeLoginEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  const flag = process.env.ENABLE_FAKE_LOGIN;
  if (flag === "false" || flag === "0") {
    return false;
  }
  // Default ON in development so UI can be tested without DB
  return true;
}

export function matchFakeAdminCredentials(usernameOrEmail: string, password: string): boolean {
  const id = usernameOrEmail.trim().toLowerCase();
  const pass = password;
  const emailMatch = id === DEMO_ADMIN.email.toLowerCase();
  const userMatch = id === DEMO_ADMIN.username.toLowerCase();
  return (emailMatch || userMatch) && pass === DEMO_ADMIN.password;
}

export function getFakeAdminUser(): FakeAuthUser {
  return {
    id: "fake-demo-super-admin",
    name: DEMO_ADMIN.fullName,
    email: DEMO_ADMIN.email,
    role: DEMO_ADMIN.role,
    permissions: ["*"],
  };
}

export function tryFakeLogin(usernameOrEmail: string, password: string): FakeAuthUser | null {
  if (!isFakeLoginEnabled()) {
    return null;
  }
  if (!matchFakeAdminCredentials(usernameOrEmail, password)) {
    return null;
  }
  return getFakeAdminUser();
}
