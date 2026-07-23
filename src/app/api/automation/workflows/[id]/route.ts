import { NextRequest, NextResponse } from "next/server";
import {
  getWorkflowAction,
  updateWorkflowAction,
  deleteWorkflowAction,
  duplicateWorkflowAction,
  enableWorkflowAction,
  disableWorkflowAction,
} from "@/features/automation/actions/automation-actions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const result = await getWorkflowAction(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json(result.data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.json();

  if (body.action === "enable") {
    const result = await enableWorkflowAction(id);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.data);
  }
  if (body.action === "disable") {
    const result = await disableWorkflowAction(id);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.data);
  }
  if (body.action === "duplicate") {
    const result = await duplicateWorkflowAction(id);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.data);
  }

  const result = await updateWorkflowAction(id, body);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const result = await deleteWorkflowAction(id);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ deleted: true });
}
