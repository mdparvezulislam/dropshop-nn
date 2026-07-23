import { NextResponse } from "next/server";
import { getAutomationDashboardAction } from "@/features/automation/actions/automation-actions";

export async function GET(): Promise<NextResponse> {
  const result = await getAutomationDashboardAction();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result.data);
}
