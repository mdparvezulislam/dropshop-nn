import { z } from "zod";
import { emailSchema, phoneSchema } from "@/shared/utils/validation";

export const addressSchema = z.object({
  country: z.string().min(2, "Country is required").trim(),
  division: z.string().min(2, "Division is required").trim(),
  district: z.string().min(2, "District is required").trim(),
  upazila: z.string().min(2, "Upazila is required").trim(),
  area: z.string().min(2, "Area is required").trim(),
  postalCode: z.string().min(4, "Postal code is required").trim(),
  fullAddress: z.string().min(5, "Full address is required").trim(),
  pickupAddress: z.string().min(5, "Pickup address is required").trim(),
  returnAddress: z.string().min(5, "Return address is required").trim(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  role: z.string().min(2, "Contact role is required").trim(),
  email: emailSchema,
  phone: phoneSchema,
  isPrimary: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
});

export const bankAccountSchema = z.object({
  bankName: z.string().optional().or(z.literal("")),
  branch: z.string().optional().or(z.literal("")),
  accountName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  routingNumber: z.string().optional().or(z.literal("")),
  mobileBankingType: z.string().optional().or(z.literal("")),
  binanceWalletAddress: z.string().optional().or(z.literal("")),
});

export const documentSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  url: z.string().url("Invalid document URL"),
});

export const settingsSchema = z.object({
  autoAcceptOrders: z.boolean().default(false),
  autoRejectOutOfStock: z.boolean().default(true),
  allowBackorders: z.boolean().default(false),
  processingTimeDays: z.coerce.number().int().min(1).default(3),
  returnPolicy: z.string().min(2, "Return policy description is required").trim(),
  warrantyPeriodDays: z.coerce.number().int().nonnegative().default(0),
  shippingTimeDays: z.coerce.number().int().min(1).default(5),
});

export const createSupplierSchema = z.object({
  businessName: z.string().min(2, "Business name is required").trim(),
  ownerName: z.string().min(2, "Owner name is required").trim(),
  contactPerson: z.string().min(2, "Contact person name is required").trim(),
  email: emailSchema,
  phone: phoneSchema,
  alternativePhone: phoneSchema.optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logo: z.string().url("Invalid logo image URL").optional().or(z.literal("")),
  coverImage: z.string().url("Invalid cover image URL").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  businessType: z.string().min(2, "Business type is required").trim(),
  tradeLicenseNumber: z.string().min(2, "Trade license number is required").trim(),
  binNumber: z.string().optional().or(z.literal("")),
  tinNumber: z.string().optional().or(z.literal("")),
  address: addressSchema,
  contacts: z.array(contactSchema).min(1, "At least one contact person is required"),
  banking: bankAccountSchema.optional(),
  settings: settingsSchema.optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema.partial();

export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
