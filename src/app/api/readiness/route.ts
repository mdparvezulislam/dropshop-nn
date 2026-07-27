import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/** Readiness probe — confirms the service can handle traffic (DB connected). */
export async function GET(): Promise<NextResponse> {
  const dbState = mongoose.connection.readyState;

  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (dbState !== 1) {
    return NextResponse.json(
      {
        status: "not_ready",
        reason: dbState === 2 ? "connecting" : "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      status: "ready",
      db: "connected",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
