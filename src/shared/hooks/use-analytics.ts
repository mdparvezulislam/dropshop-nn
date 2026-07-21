"use client";

import { useCallback, useEffect, useRef } from "react";
import { trackAnalyticsEventAction } from "@/features/analytics/actions/analytics-actions";
import type { AnalyticsEventName, AnalyticsModule } from "@/features/analytics/domain/analytics-entity";

const SESSION_KEY = "dropshopnn_analytics_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `sid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `sid_${Date.now()}`;
  }
}

export interface TrackOptions {
  module?: AnalyticsModule;
  entityType?: string;
  entityId?: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Single client analytics hook — all UI tracking goes through here.
 */
export function useAnalytics() {
  const sessionId = useRef("");

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  const track = useCallback((eventName: AnalyticsEventName, options: TrackOptions = {}) => {
    const sid = sessionId.current || getSessionId();
    void trackAnalyticsEventAction({
      eventName,
      module: options.module ?? "website",
      source: "web-client",
      sessionId: sid,
      entityType: options.entityType,
      entityId: options.entityId,
      value: options.value,
      currency: options.currency,
      metadata: options.metadata ?? {},
    });
  }, []);

  return { track, sessionId: sessionId.current || (typeof window !== "undefined" ? getSessionId() : "") };
}
