import { NextRequest, NextResponse } from "next/server";
import { getExecutionLogsAction } from "@/features/automation/actions/automation-actions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
): Promise<NextResponse> {
  const { executionId } = await params;
  const result = await getExecutionLogsAction(executionId);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result.data);
}
