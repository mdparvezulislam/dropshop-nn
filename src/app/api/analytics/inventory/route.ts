import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { InventoryAnalyticsService } from "@/features/analytics/services/inventory-analytics-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");

    const { searchParams } = new URL(req.url);
    const preset = searchParams.get("preset") ?? "30d";

    const service = new InventoryAnalyticsService();
    const data = await service.getInventoryAnalytics({ preset });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load inventory analytics" },
      { status: 500 },
    );
  }
}
