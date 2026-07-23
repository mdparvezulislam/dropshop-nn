import { NextResponse } from "next/server";
import { retryEngine } from "@/features/automation/services/retry-engine";

export async function GET(): Promise<NextResponse> {
  const deadLetter = await retryEngine.getDeadLetterQueue(50);
  return NextResponse.json(deadLetter);
}
