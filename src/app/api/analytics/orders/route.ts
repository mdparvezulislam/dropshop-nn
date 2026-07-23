import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { OrderAnalyticsService } from "@/features/analytics/services/order-analytics-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");

    const { searchParams } = new URL(req.url);
    const preset = searchParams.get("preset") ?? "30d";

    const service = new OrderAnalyticsService();
    const data = await service.getOrderAnalytics({ preset });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load order analytics" },
      { status: 500 },
    );
  }
}
