"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { ExportService } from "../services/export-service";

export async function exportOrdersCsvAction(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Read");
  try {
    const service = new ExportService();
    const csv = await service.exportOrdersCsv({});
    return { success: true, data: csv };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportCodCsvAction(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Read");
  try {
    const service = new ExportService();
    const csv = await service.exportCodCsv({});
    return { success: true, data: csv };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportCourierReportCsvAction(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Read");
  try {
    const service = new ExportService();
    const csv = await service.exportCourierReportCsv({});
    return { success: true, data: csv };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
