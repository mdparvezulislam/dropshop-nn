import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/shared/config/env";
import { DatabaseConnectionManager } from "@/shared/lib/database/connection-manager";
import { AuthService } from "@/features/auth/services/auth-service";
import { AuthorizationService } from "@/features/auth/services/authorization-service";
import { logger } from "@/shared/utils/logger";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          await DatabaseConnectionManager.connect();

          const usernameOrEmail = credentials?.usernameOrEmail as string;
          const password = credentials?.password as string;

          if (!usernameOrEmail || !password) {
            return null;
          }

          const ip = (req as any)?.headers?.get("x-forwarded-for") || "127.0.0.1";
          const ua = (req as any)?.headers?.get("user-agent") || "unknown";

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
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).permissions = token.permissions as string[];
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/unauthorized",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export default NextAuth(authConfig);
