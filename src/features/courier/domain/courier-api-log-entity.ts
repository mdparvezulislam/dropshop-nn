import { BaseDBEntity } from "@/shared/lib/database/types";

export type CourierLogType = "auth" | "booking" | "tracking" | "webhook" | "error";

export interface CourierApiLog extends BaseDBEntity {
  provider: string;
  logType: CourierLogType;
  endpoint: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
  statusCode?: number;
  responseTimeMs?: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}
