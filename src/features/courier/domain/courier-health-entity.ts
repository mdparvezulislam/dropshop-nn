export interface CourierHealthMetrics {
  provider: string;
  displayName: string;
  enabled: boolean;
  status: "healthy" | "degraded" | "down" | "disabled";
  latencyMs: number;
  apiAvailabilityPercent: number;
  bookingSuccessRatePercent: number;
  trackingSuccessRatePercent: number;
  errorRatePercent: number;
  lastSuccessfulSyncAt?: Date;
  webhookStatus: "active" | "failing" | "inactive";
  lastErrorMessage?: string;
}
