import { z } from "zod";
import { emailSchema, phoneSchema } from "@/lib/utils/validation";

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, "Username or email is required").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registrationSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
    .trim(),
  email: emailSchema,
  phone: phoneSchema,
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // SECURITY: no `role` field. Public registration NEVER accepts a role from
  // the client — the server assigns the fixed customer role (see AuthService).
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  profileImage: z.string().url("Invalid profile image URL").optional().or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
