import { NextResponse } from "next/server";
import { retryEngine } from "@/features/automation/services/retry-engine";

export async function GET(): Promise<NextResponse> {
  const failed = await retryEngine.getFailedExecutions(50);
  return NextResponse.json(failed);
}

export async function POST(): Promise<NextResponse> {
  const count = await retryEngine.automaticRetry();
  return NextResponse.json({ retried: count });
}
