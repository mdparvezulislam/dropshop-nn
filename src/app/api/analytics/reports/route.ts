import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { ReportService } from "@/features/analytics/services/report-service";
import { ExportService } from "@/features/analytics/services/export-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    checkPermission(session, "Report.View");

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? undefined;

    const service = new ReportService();
    const reports = await service.listReports(type as any);

    return NextResponse.json({ success: true, data: reports });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load reports" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    checkPermission(session, "Report.Generate");

    const body = await req.json();
    const service = new ReportService();
    const report = await service.generateReport(body);

    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to generate report" },
      { status: 500 },
    );
  }
}
