import { NextRequest, NextResponse } from "next/server";
import { exportWorkflowAction } from "@/features/automation/actions/automation-actions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const result = await exportWorkflowAction(id);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result.data);
}
