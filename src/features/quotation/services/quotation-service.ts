import { QuotationRepository } from "@/features/quotation/repositories/quotation-repository";
import type { QuotationItem, QuotationStatus } from "@/features/quotation/domain/types";

interface CreateQuotationInput {
  wholesalerId: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  notes?: string;
  validUntil?: string;
}

export class QuotationService {
  private repo = new QuotationRepository();

  async createQuotation(input: CreateQuotationInput) {
    return this.repo.create({
      wholesalerId: input.wholesalerId,
      status: "draft",
      items: input.items,
      subtotal: input.subtotal,
      tax: input.tax,
      grandTotal: input.grandTotal,
      notes: input.notes ?? "",
      validUntil: input.validUntil ?? "",
      convertedOrderId: undefined,
    });
  }

  async listQuotations(wholesalerId: string) {
    return this.repo.findByWholesaler(wholesalerId);
  }

  async getQuotation(quotationId: string, wholesalerId: string) {
    const quote = await this.repo.findById(quotationId);
    if (!quote || quote.wholesalerId !== wholesalerId) {
      throw new Error("Quotation not found");
    }
    return quote;
  }

  async updateStatus(
    quotationId: string,
    wholesalerId: string,
    status: QuotationStatus,
    notes?: string,
  ) {
    const quote = await this.repo.findById(quotationId);
    if (!quote || quote.wholesalerId !== wholesalerId) {
      throw new Error("Quotation not found");
    }
    return this.repo.updateStatus(quotationId, status);
  }
}
