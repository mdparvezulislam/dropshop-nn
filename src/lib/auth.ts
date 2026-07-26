import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { env } from "@/config/env";
import { logger } from "@/lib/utils/logger";

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

          const { DatabaseConnectionManager } = await import("@/lib/database/connection-manager");
          await DatabaseConnectionManager.connect();

          try {
            const { ensureDemoAdminSeeded } = await import("@/lib/database/seeds/demo-admin-seed");
            await ensureDemoAdminSeeded();
          } catch (seedError) {
            logger.warn("Admin seed skipped", {
              error: seedError instanceof Error ? seedError.message : String(seedError),
            });
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
            id: String(user.id),
            name: String(user.fullName || ""),
            email: String(user.email || ""),
            role: String(user.role || ""),
            permissions: Array.from(permissions || []).map(String),
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
