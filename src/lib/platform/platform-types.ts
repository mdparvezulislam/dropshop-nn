export type PlatformEngineId =
  | "CORE"
  | "IDENTITY"
  | "CATALOG"
  | "COST"
  | "PRICING"
  | "INVENTORY"
  | "SUPPLIER"
  | "CHECKOUT"
  | "ORDER"
  | "CUSTOMER"
  | "RETURN"
  | "FINANCE"
  | "COURIER"
  | "CMS"
  | "ANALYTICS"
  | "NOTIFICATION"
  | "AUTOMATION";

export interface PlatformEngine {
  id: PlatformEngineId;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  dependencies?: PlatformEngineId[];
}

export interface BootstrapPhase {
  name: string;
  order: number;
  engines: PlatformEngineId[];
}

export interface BootstrapContext {
  startedAt: Date;
  completedAt?: Date;
  engines: Map<PlatformEngineId, EngineStatus>;
  errors: BootstrapError[];
}

export interface EngineStatus {
  engineId: PlatformEngineId;
  preInit: "pending" | "running" | "done" | "failed";
  init: "pending" | "running" | "done" | "failed";
  postInit: "pending" | "running" | "done" | "failed";
  error?: string;
}

export interface BootstrapError {
  engineId: PlatformEngineId;
  phase: string;
  message: string;
  timestamp: Date;
}

export interface WorkspaceDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  roles: string[];
  href: string;
}

export interface SearchProvider {
  entityType: string;
  label: string;
  search(query: string, limit?: number): Promise<SearchResultItem[]>;
}

export interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  href: string;
  metadata?: Record<string, unknown>;
}

export interface BackgroundJobDefinition {
  name: string;
  engine: PlatformEngineId;
  cron?: string;
  description: string;
  enabled: boolean;
}
