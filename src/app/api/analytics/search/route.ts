import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { AnalyticsSearchService } from "@/features/analytics/services/analytics-search-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const service = new AnalyticsSearchService();
    const results = await service.search(query, limit);

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 },
    );
  }
}
