import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness probe — confirms the process is alive and serving requests. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 },
  );
}
