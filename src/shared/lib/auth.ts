import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { env } from "@/shared/config/env";
import { tryFakeLogin, isFakeLoginEnabled } from "@/shared/lib/fake-auth";
import { logger } from "@/shared/utils/logger";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        try {
          const usernameOrEmail = credentials?.usernameOrEmail as string;
          const password = credentials?.password as string;

          if (!usernameOrEmail || !password) {
            return null;
          }

          // --- TEMP: fake login (no DB) — remove for production ---
          const fakeUser = tryFakeLogin(usernameOrEmail, password);
          if (fakeUser) {
            logger.warn("FAKE LOGIN used — disable ENABLE_FAKE_LOGIN for production", {
              email: fakeUser.email,
              role: fakeUser.role,
            });
            return fakeUser;
          }
          // --- end fake login ---

          const { DatabaseConnectionManager } =
            await import("@/shared/lib/database/connection-manager");
          await DatabaseConnectionManager.connect();

          if (isFakeLoginEnabled()) {
            // Still try seed when DB is available in dev
            try {
              const { ensureDemoAdminSeeded } =
                await import("@/shared/lib/database/seeds/demo-admin-seed");
              await ensureDemoAdminSeeded();
            } catch (seedError) {
              logger.warn("Demo admin seed skipped (DB unavailable)", {
                error: seedError instanceof Error ? seedError.message : String(seedError),
              });
            }
          } else {
            const { ensureDemoAdminSeeded } =
              await import("@/shared/lib/database/seeds/demo-admin-seed");
            await ensureDemoAdminSeeded();
          }

          const headers =
            request && typeof request === "object" && "headers" in request
              ? (request as { headers: Headers }).headers
              : undefined;
          const ip = headers?.get("x-forwarded-for") || "127.0.0.1";
          const ua = headers?.get("user-agent") || "unknown";

          const { AuthService } = await import("@/features/auth/services/auth-service");
          const { AuthorizationService } =
            await import("@/features/auth/services/authorization-service");

          const authService = new AuthService();
          const user = await authService.verifyCredentials(usernameOrEmail, password, ip, ua);

          const authorizationService = new AuthorizationService();
          const permissions = await authorizationService.getPermissionsForRole(user.role);

          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            permissions,
          };
        } catch (error) {
          logger.error("NextAuth authorize callback failed", error);
          return null;
        }
      },
    }),
  ],
});

export default { handlers, auth, signIn, signOut };
