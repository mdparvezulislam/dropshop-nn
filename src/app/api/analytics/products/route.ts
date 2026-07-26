import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { ProductAnalyticsService } from "@/features/analytics/services/product-analytics-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");

    const { searchParams } = new URL(req.url);
    const preset = searchParams.get("preset") ?? "30d";

    const service = new ProductAnalyticsService();
    const data = await service.getProductAnalytics({ preset });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load product analytics",
      },
      { status: 500 },
    );
  }
}
