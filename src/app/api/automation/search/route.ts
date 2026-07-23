import { NextRequest, NextResponse } from "next/server";
import { searchAutomationAction } from "@/features/automation/actions/automation-actions";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const result = await searchAutomationAction(body);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.data);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const result = await searchAutomationAction({ query, limit: 20 });
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.data);
}
