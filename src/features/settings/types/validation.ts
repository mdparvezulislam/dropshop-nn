import { z } from "zod";

export const updateSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required"),
  value: z.any(),
  reason: z.string().optional(),
});

export const updateCategorySettingsSchema = z.object({
  category: z.string().min(1, "Category is required"),
  settings: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

export const updateFeatureFlagSchema = z.object({
  key: z.string().min(1, "Feature flag key is required"),
  state: z.enum(["on", "off", "beta", "internal", "experimental"]),
  allowedRoles: z.array(z.string()).optional(),
});

export const updateMaintenanceSchema = z.object({
  enabled: z.boolean(),
  message: z.string().optional().default("System is under scheduled maintenance. Please check back shortly."),
  allowedRoles: z.array(z.string()).optional().default(["admin"]),
  whitelistedIPs: z.array(z.string()).optional().default([]),
});

export const importSettingsSchema = z.object({
  payload: z.object({
    settings: z.array(z.object({ key: z.string(), value: z.any() })).optional(),
    flags: z.array(z.object({ key: z.string(), state: z.string() })).optional(),
  }),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
export type UpdateCategorySettingsInput = z.infer<typeof updateCategorySettingsSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type ImportSettingsInput = z.infer<typeof importSettingsSchema>;
