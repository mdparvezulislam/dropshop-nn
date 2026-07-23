import { BaseRepository } from "@/lib/database/generic-repository";
import { InvoiceModel } from "./invoice-model";
import type { Invoice, InvoiceItem } from "../domain/invoice-entity";
import type { BaseDocument } from "@/lib/database/types";

interface InvoiceDocument extends BaseDocument {
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerSnapshot: {
    name: string;
    phone: string;
    address: string;
  };
  businessSnapshot?: {
    name: string;
    phone?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  status: string;
  pdfUrl?: string;
}

function mapToDomain(doc: any): Invoice {
  return {
    id: doc.id ?? doc._id.toString(),
    invoiceNumber: doc.invoiceNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    customerSnapshot: doc.customerSnapshot,
    businessSnapshot: doc.businessSnapshot,
    items: doc.items,
    subtotal: doc.subtotal,
    discountTotal: doc.discountTotal,
    taxTotal: doc.taxTotal,
    grandTotal: doc.grandTotal,
    currency: doc.currency,
    status: doc.status as "unpaid" | "paid" | "void" | "refunded",
    pdfUrl: doc.pdfUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
  };
}

export class InvoiceRepository extends BaseRepository<InvoiceDocument, Invoice> {
  constructor() {
    super(InvoiceModel as any, mapToDomain);
  }

  async findByOrderNumber(orderNumber: string): Promise<Invoice | null> {
    return this.findOne({ orderNumber });
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    return this.findOne({ orderId });
  }
}

export default InvoiceRepository;
