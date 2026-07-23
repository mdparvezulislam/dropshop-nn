import { env } from "./env";
import { FILE_LIMITS } from "@/constants";

export interface AppConfig {
  env: "development" | "production" | "test";
  appName: string;
  appUrl: string;
  logLevel: string;
  upload: {
    maxFileSize: number;
    maxImageSize: number;
    allowedFileTypes: readonly string[];
    allowedImageTypes: readonly string[];
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
    maxFileSize: FILE_LIMITS.MAX_FILE_SIZE,
    maxImageSize: FILE_LIMITS.MAX_IMAGE_SIZE,
    allowedFileTypes: FILE_LIMITS.ALLOWED_FILE_TYPES,
    allowedImageTypes: FILE_LIMITS.ALLOWED_IMAGE_TYPES,
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
