import { NextRequest, NextResponse } from "next/server";
import { importWorkflowAction } from "@/features/automation/actions/automation-actions";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const result = await importWorkflowAction(body);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ imported: true }, { status: 201 });
}
