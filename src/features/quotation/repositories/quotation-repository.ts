import type { QuotationEntity, QuotationStatus } from "@/features/quotation/domain/types";

// In-memory store — swap for MongoDB model once available
const store = new Map<string, QuotationEntity>();

let counter = 0;

export class QuotationRepository {
  async create(data: Omit<QuotationEntity, "id" | "quoteNumber" | "createdAt" | "updatedAt">): Promise<QuotationEntity> {
    counter++;
    const id = `quote_${Date.now()}_${counter}`;
    const entity: QuotationEntity = {
      ...data,
      id,
      quoteNumber: `QT-${String(counter).padStart(5, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.set(id, entity);
    return entity;
  }

  async findById(id: string): Promise<QuotationEntity | null> {
    return store.get(id) ?? null;
  }

  async findByWholesaler(wholesalerId: string): Promise<QuotationEntity[]> {
    return Array.from(store.values())
      .filter((q) => q.wholesalerId === wholesalerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateStatus(id: string, status: QuotationStatus, convertedOrderId?: string): Promise<QuotationEntity | null> {
    const entity = store.get(id);
    if (!entity) return null;
    entity.status = status;
    entity.updatedAt = new Date().toISOString();
    if (convertedOrderId) entity.convertedOrderId = convertedOrderId;
    store.set(id, entity);
    return entity;
  }
}
