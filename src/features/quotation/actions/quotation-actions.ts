"use server";

import * as z from "zod";
import { auth } from "@/lib/auth";
import { QuotationService } from "@/features/quotation/services/quotation-service";

const createQuotationSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    sku: z.string().optional(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
  })),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  grandTotal: z.number().min(0),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
});

const updateQuotationStatusSchema = z.object({
  quotationId: z.string(),
  status: z.enum(["submitted", "under_review", "approved", "rejected", "cancelled"]),
  notes: z.string().optional(),
});

export async function createQuotationAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const parsed = createQuotationSchema.parse(formData);
    const service = new QuotationService();
    const data = await service.createQuotation({
      wholesalerId: session.user.id,
      items: parsed.items,
      subtotal: parsed.subtotal,
      tax: parsed.tax,
      grandTotal: parsed.grandTotal,
      notes: parsed.notes,
      validUntil: parsed.validUntil,
    });

    return { success: true, data };
  } catch (err: any) {
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0]?.message ?? "Validation error" };
    return { success: false, error: err.message ?? "Failed to create quotation" };
  }
}

export async function listQuotationsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const service = new QuotationService();
    const data = await service.listQuotations(session.user.id);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to list quotations" };
  }
}

export async function getQuotationAction(quotationId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const service = new QuotationService();
    const data = await service.getQuotation(quotationId, session.user.id);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to get quotation" };
  }
}

export async function updateQuotationStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const parsed = updateQuotationStatusSchema.parse(formData);
    const service = new QuotationService();
    const data = await service.updateStatus(parsed.quotationId, session.user.id, parsed.status, parsed.notes);
    return { success: true, data };
  } catch (err: any) {
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0]?.message ?? "Validation error" };
    return { success: false, error: err.message ?? "Failed to update quotation" };
  }
}
