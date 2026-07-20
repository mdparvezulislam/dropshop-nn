import { z } from "zod";

export const createCustomerSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(11, "Valid Bangladesh phone number is required"),
  alternativePhone: z.string().optional(),
  email: z.string().email("Invalid email address format").optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().optional()),
  source: z.string().default("manual"),
});

export const updateCustomerSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  name: z.string().min(1).optional(),
  phone: z.string().min(11).optional(),
  alternativePhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().optional()),
});

export const addAddressSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  type: z.enum(["home", "office", "warehouse", "custom", "store"]),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  area: z.string().min(1, "Area/Road detail is required"),
  postalCode: z.string().optional(),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const addNoteSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  note: z.string().min(1, "Note content cannot be empty"),
  isPrivate: z.boolean().default(false),
});

export const updateTagsSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  tags: z.array(z.string()),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddAddressInput = z.infer<typeof addAddressSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type UpdateTagsInput = z.infer<typeof updateTagsSchema>;
