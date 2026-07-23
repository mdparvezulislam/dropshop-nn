import { NextRequest, NextResponse } from "next/server";
import {
  getSchedulesAction,
  createScheduleAction,
} from "@/features/automation/actions/automation-actions";

export async function GET(): Promise<NextResponse> {
  const result = await getSchedulesAction();
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const result = await createScheduleAction(body);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.data, { status: 201 });
}
