import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { ExecutiveAnalyticsService } from "@/features/analytics/services/executive-analytics-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");

    const service = new ExecutiveAnalyticsService();
    const data = await service.getExecutiveDashboard({ preset: "today" });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load live dashboard" },
      { status: 500 },
    );
  }
}
