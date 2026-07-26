import { NextRequest, NextResponse } from "next/server";
import {
  disableScheduleAction,
  enableScheduleAction,
} from "@/features/automation/actions/automation-actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.json();

  if (body.action === "disable") {
    const result = await disableScheduleAction(id);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.data);
  }
  if (body.action === "enable") {
    const result = await enableScheduleAction(id);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.data);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
