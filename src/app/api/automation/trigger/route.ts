import { NextRequest, NextResponse } from "next/server";
import { scheduleCenter } from "@/features/automation/services/schedule-center";

export async function POST(): Promise<NextResponse> {
  await scheduleCenter.triggerDue();
  return NextResponse.json({ triggered: true });
}
