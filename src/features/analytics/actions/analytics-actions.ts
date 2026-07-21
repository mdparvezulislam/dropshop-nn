"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { AnalyticsPublisher } from "../services/analytics-publisher";
import { AnalyticsQueryService } from "../services/analytics-query-service";
import {
  trackEventSchema,
  overviewQuerySchema,
  exportQuerySchema,
} from "../types/validation";

function sessionActor(session: unknown): {
  actorId?: string;
  actorRole?: string;
} {
  const user = (session as { user?: { id?: string; role?: string } } | null)?.user;
  return {
    actorId: user?.id,
    actorRole: user?.role ?? "guest",
  };
}

export async function trackAnalyticsEventAction(payload: unknown): Promise<{
  success: boolean;
  data?: { eventId: string };
  error?: string;
}> {
  try {
    const session = await auth();
    const validated = trackEventSchema.parse(payload);
    const actor = sessionActor(session);
    const publisher = new AnalyticsPublisher();
    const result = await publisher.track({
      ...validated,
      actorId: validated.actorId ?? actor.actorId,
      actorRole: validated.actorRole ?? actor.actorRole,
      source: validated.source ?? "client",
      module: validated.module ?? "website",
      metadata: validated.metadata ?? {},
    });
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to track event",
    };
  }
}

export async function getAnalyticsOverviewAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getOverview(validated);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load overview",
    };
  }
}

export async function getSalesAnalyticsAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getSalesReport(validated);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load sales analytics",
    };
  }
}

export async function getOrdersFunnelAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getOrdersFunnel(validated);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load funnel",
    };
  }
}

export async function getCatalogAnalyticsAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getCatalogInsights(validated);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load catalog analytics",
    };
  }
}

export async function getContentAnalyticsAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getContentInsights(validated);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load content analytics",
    };
  }
}

export async function exportAnalyticsAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: { content: string; filename: string; mimeType: string };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = exportQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const content = await service.exportEventsCsv(validated);
    return {
      success: true,
      data: {
        content,
        filename: `analytics-events-${validated.preset}-${Date.now()}.csv`,
        mimeType: "text/csv",
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to export",
    };
  }
}
