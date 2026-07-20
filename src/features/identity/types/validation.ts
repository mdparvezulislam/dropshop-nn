import { z } from "zod";
import { emailSchema, phoneSchema } from "@/shared/utils/validation";

export const businessAddressSchema = z.object({
  division: z.string().min(2, "Division is required").trim(),
  district: z.string().min(2, "District is required").trim(),
  upazila: z.string().min(2, "Upazila is required").trim(),
  area: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  fullAddress: z.string().min(5, "Full address is required").trim(),
});

export const businessDocumentsSchema = z.object({
  nidNumber: z.string().optional().or(z.literal("")),
  tradeLicenseNumber: z.string().optional().or(z.literal("")),
  tinNumber: z.string().optional().or(z.literal("")),
  bankAccountName: z.string().optional().or(z.literal("")),
  bankAccountNumber: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  bankBranch: z.string().optional().or(z.literal("")),
  bkashNumber: z.string().optional().or(z.literal("")),
  nagadNumber: z.string().optional().or(z.literal("")),
});

export const socialLinksSchema = z.object({
  website: z.string().url().optional().or(z.literal("")),
  facebookPage: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  telegram: z.string().optional().or(z.literal("")),
});

export const createBusinessProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required").trim(),
  ownerName: z.string().min(2, "Owner name is required").trim(),
  primaryPhone: phoneSchema,
  secondaryPhone: phoneSchema.optional().or(z.literal("")),
  email: emailSchema,
  businessType: z.enum(["sole_proprietorship", "partnership", "limited_company", "individual"]),
  role: z.enum(["reseller", "wholesaler", "supplier"]),
  description: z.string().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  banner: z.string().url().optional().or(z.literal("")),
  address: businessAddressSchema,
  socialLinks: socialLinksSchema.optional(),
  documents: businessDocumentsSchema.optional(),
});

export type CreateBusinessProfileInput = z.infer<typeof createBusinessProfileSchema>;

export const updateBusinessProfileSchema = createBusinessProfileSchema.partial();

export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>;

export const approvalActionSchema = z.object({
  businessProfileId: z.string().min(1, "Business profile ID is required"),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;

export const storeProfileSchema = z.object({
  storeName: z.string().min(2, "Store name is required").trim(),
  storeLogo: z.string().url().optional().or(z.literal("")),
  storeBanner: z.string().url().optional().or(z.literal("")),
  theme: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  contactPhone: phoneSchema.optional().or(z.literal("")),
  contactEmail: emailSchema.optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  telegram: z.string().optional().or(z.literal("")),
});

export type CreateStoreProfileInput = z.infer<typeof storeProfileSchema>;

export const updateStoreProfileSchema = storeProfileSchema.partial();

export type UpdateStoreProfileInput = z.infer<typeof updateStoreProfileSchema>;

export const customerRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required").trim(),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CustomerRegistrationInput = z.infer<typeof customerRegistrationSchema>;

export const businessRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required").trim(),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name is required").trim(),
  ownerName: z.string().min(2, "Owner name is required").trim(),
  primaryPhone: phoneSchema,
  businessType: z.enum(["sole_proprietorship", "partnership", "limited_company", "individual"]),
  address: businessAddressSchema,
  role: z.enum(["reseller", "wholesaler"]),
});

export type BusinessRegistrationInput = z.infer<typeof businessRegistrationSchema>;

export const sessionRevokeSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export type SessionRevokeInput = z.infer<typeof sessionRevokeSchema>;

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name is required").optional(),
  phone: phoneSchema.optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(["supplier", "support", "manager", "admin"]),
  businessName: z.string().optional().or(z.literal("")),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
