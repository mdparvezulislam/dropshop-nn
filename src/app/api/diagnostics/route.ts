import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/** Environment diagnostics — safe for production (no secrets exposed). */
export async function GET(): Promise<NextResponse> {
  const dbState = mongoose.connection.readyState;
  const stateLabel: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return NextResponse.json(
    {
      nodeEnv: process.env.NODE_ENV || "not set",
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      db: {
        state: stateLabel[dbState] ?? "unknown",
        host: mongoose.connection.host || "unknown",
        name: mongoose.connection.name || "unknown",
      },
      server: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100 + " MB",
          heapUsed: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100 + " MB",
        },
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
      features: {
        enableFakeLogin: process.env.ENABLE_FAKE_LOGIN || "false",
        imageKitConfigured: Boolean(
          process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY,
        ),
        redisConfigured: Boolean(process.env.REDIS_HOST),
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
