import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const invoiceItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
});

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    customerSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    businessSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, default: null },
      address: { type: String, default: null },
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "BDT" },
    status: {
      type: String,
      enum: ["unpaid", "paid", "void", "refunded"],
      required: true,
      default: "unpaid",
    },
    pdfUrl: { type: String, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "invoices" },
);

export const InvoiceModel = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default InvoiceModel;
