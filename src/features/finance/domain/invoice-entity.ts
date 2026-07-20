import { BaseDBEntity } from "@/shared/lib/database/types";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  totalPrice: number; // in cents
}

export interface Invoice extends BaseDBEntity {
  invoiceNumber: string; // unique serial
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
  status: "unpaid" | "paid" | "void" | "refunded";
  pdfUrl?: string;
}
