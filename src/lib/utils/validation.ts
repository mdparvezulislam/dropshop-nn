import { z } from "zod";
import { ValidationError } from "@/lib/errors/app-error";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid database identifier format");

export const emailSchema = z.string().email("Invalid email address format").trim().toLowerCase();

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?\d{10,15}|01[3-9]\d{8})$/, "Invalid phone number format (e.g. 01712345678 or +8801712345678)");

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export function validateSchema<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join(".");
      if (!formattedErrors[fieldPath]) {
        formattedErrors[fieldPath] = [];
      }
      formattedErrors[fieldPath].push(issue.message);
    }
    throw new ValidationError("Input validation failed", formattedErrors);
  }
  return result.data;
}
