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

  AUTH_SECRET: z.string().min(8, "AUTH_SECRET must be at least 8 characters"),
  AUTH_URL: z.string().url().optional(),

  /** Dev-only: allow demo Super Admin login without MongoDB. Forced off in production. */
  ENABLE_FAKE_LOGIN: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === undefined || v === "true" || v === "1"),

  IMAGEKIT_PUBLIC_KEY: z.string().min(1, "IMAGEKIT_PUBLIC_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),
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
    console.error(
      "❌ Invalid environment variables:",
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    );
    throw new Error("Invalid environment variables setup");
  }

  return parsed.data;
};

export const env = parseEnv();
