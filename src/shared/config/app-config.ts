import { env } from "./env";

export interface AppConfig {
  env: "development" | "production" | "test";
  appName: string;
  appUrl: string;
  logLevel: string;
  upload: {
    maxFileSize: number; // in bytes
    maxImageSize: number; // in bytes
    allowedFileTypes: string[];
    allowedImageTypes: string[];
  };
  features: {
    enableMockAuth: boolean;
    enableCaching: boolean;
    enableBackgroundJobs: boolean;
    maintenanceMode: boolean;
  };
}

export const appConfig: AppConfig = {
  env: env.NODE_ENV,
  appName: "DropshopNN",
  appUrl: env.NEXT_PUBLIC_APP_URL,
  logLevel: env.LOG_LEVEL,
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxImageSize: 2 * 1024 * 1024, // 2MB
    allowedFileTypes: ["application/pdf", "image/jpeg", "image/png", "text/csv"],
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  features: {
    enableMockAuth: env.NODE_ENV !== "production",
    enableCaching: true,
    enableBackgroundJobs: true,
    maintenanceMode: false,
  },
};

export function isFeatureEnabled(flag: keyof AppConfig["features"]): boolean {
  return appConfig.features[flag] ?? false;
}

export default appConfig;
