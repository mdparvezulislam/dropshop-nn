import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z
    .string()
    .transform((val) => val || undefined)
    .optional(),

  BULLMQ_REDIS_HOST: z.string().default("127.0.0.1"),
  BULLMQ_REDIS_PORT: z.coerce.number().default(6379),
  BULLMQ_REDIS_PASSWORD: z
    .string()
    .transform((val) => val || undefined)
    .optional(),

  AUTH_SECRET: z
    .string()
    .min(8, "AUTH_SECRET must be at least 8 characters")
    .refine(
      (value) => process.env.NODE_ENV !== "production" || value.length >= 32,
      "AUTH_SECRET must be at least 32 characters in production",
    ),
  AUTH_URL: z.string().url().optional(),
  ENCRYPTION_MASTER_KEY: z
    .string()
    .optional()
    .default("4f8a9b2c7e1d5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b"),

  ENABLE_FAKE_LOGIN: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1"),

  IMAGEKIT_PUBLIC_KEY: z.string().min(1, "IMAGEKIT_PUBLIC_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),

  // ==========================================================================
  // Security Configuration
  // ==========================================================================

  // Account Lockout Settings
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOCKOUT_DURATION_MINUTES: z.coerce.number().default(30),

  // Password Policy Settings
  PASSWORD_MIN_LENGTH: z.coerce.number().default(8),
  PASSWORD_REQUIRE_UPPERCASE: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(true),
  PASSWORD_REQUIRE_NUMBER: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(true),
  PASSWORD_REQUIRE_SPECIAL: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(true),
  PASSWORD_EXPIRATION_DAYS: z.coerce.number().optional(),

  // Session Settings
  SESSION_TIMEOUT_MINUTES: z.coerce.number().default(24 * 60), // 24 hours
  REMEMBER_ME_SESSION_DAYS: z.coerce.number().default(30),
  MAX_CONCURRENT_SESSIONS: z.coerce.number().optional(),

  // Device Settings
  AUTO_TRUST_DEVICES: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(false),

  // Rate Limiting
  RATE_LIMIT_LOGIN_ATTEMPTS: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(5),

  // Retention Settings
  SECURITY_EVENT_RETENTION_DAYS: z.coerce.number().default(90),
  FAILED_LOGIN_RETENTION_DAYS: z.coerce.number().default(30),

  // 2FA Settings
  ENABLE_2FA: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(false),

  // Recovery Token Settings
  RECOVERY_TOKEN_EXPIRATION_HOURS: z.coerce.number().default(24),
  PASSWORD_RESET_TOKEN_EXPIRATION_HOURS: z.coerce.number().default(1),

  // ==========================================================================
  // Courier Provider Credentials
  // ==========================================================================
  STEADFAST_API_KEY: z.string().optional().default(""),
  STEADFAST_SECRET_KEY: z.string().optional().default(""),
  STEADFAST_BASE_URL: z.string().url().optional().default("https://portal.packzy.com/api/v1"),

  REDX_API_TOKEN: z.string().optional().default(""),
  REDX_BASE_URL: z.string().url().optional().default("https://openapi.redx.com.bd/v1.0.0"),

  PAPERFLY_USERNAME: z.string().optional().default(""),
  PAPERFLY_PASSWORD: z.string().optional().default(""),
  PAPERFLY_KEY: z.string().optional().default(""),
  PAPERFLY_BASE_URL: z.string().url().optional().default("https://api.paperfly.com.bd"),

  ECOURIER_API_KEY: z.string().optional().default(""),
  ECOURIER_API_SECRET: z.string().optional().default(""),
  ECOURIER_USER_ID: z.string().optional().default(""),
  ECOURIER_BASE_URL: z.string().url().optional().default("https://backoffice.ecourier.com.bd/api"),

  SUNDARBAN_API_KEY: z.string().optional().default(""),
  SUNDARBAN_SECRET_KEY: z.string().optional().default(""),
  SUNDARBAN_BASE_URL: z.string().url().optional().default("https://api.sundarban.com.bd/v1"),

  // ==========================================================================
  // Payment Gateway Credentials
  // ==========================================================================
  BKASH_APP_KEY: z.string().optional().default(""),
  BKASH_APP_SECRET: z.string().optional().default(""),
  BKASH_USERNAME: z.string().optional().default(""),
  BKASH_PASSWORD: z.string().optional().default(""),
  BKASH_BASE_URL: z.string().url().optional().default("https://checkout.sandbox.bka.sh/v1.2.0-beta"),

  NAGAD_MERCHANT_ID: z.string().optional().default(""),
  NAGAD_PUBLIC_KEY: z.string().optional().default(""),
  NAGAD_PRIVATE_KEY: z.string().optional().default(""),
  NAGAD_BASE_URL: z.string().url().optional().default("https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs"),

  ROCKET_MERCHANT_ID: z.string().optional().default(""),
  ROCKET_PASSWORD: z.string().optional().default(""),
  ROCKET_BASE_URL: z.string().url().optional().default("https://rocket.dutchbanglabank.com/api"),

  SSLCOMMERZ_STORE_ID: z.string().optional().default(""),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional().default(""),
  SSLCOMMERZ_BASE_URL: z.string().url().optional().default("https://sandbox.sslcommerz.com"),
  SSLCOMMERZ_IS_SANDBOX: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(true),
});

const parseEnv = () => {
  if (typeof window !== "undefined") {
    return {
      NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    } as unknown as z.infer<typeof envSchema>;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return envSchema.parse({
        MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/dropshop-nn-build",
        AUTH_SECRET: process.env.AUTH_SECRET || "build_phase_placeholder_secret_32_chars_long",
        IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || "build_pk_placeholder",
        IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "build_sk_placeholder",
        IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/buildplaceholder",
        ...process.env,
      });
    }

    console.error(
      "❌ Invalid environment variables:",
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    );
    throw new Error("Invalid environment variables setup");
  }

  return parsed.data;
};

export const env = parseEnv();
