import { InvoiceRepository } from "../repositories/invoice-repository";
import type { Invoice } from "../domain/invoice-entity";
import type { Order } from "@/features/order/domain/order-entity";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

export class InvoiceService {
  private readonly invoiceRepository: InvoiceRepository;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
  }

  async generateInvoice(order: Order): Promise<Invoice> {
    return runInTransaction(async (session) => {
      const existing = await this.invoiceRepository.findOne({ orderId: order.id }, { session });
      if (existing) {
        return existing;
      }

      const invoiceNumber = `INV-${order.orderNumber}`;
      
      const customerSnapshot = {
        name: order.shipping.receiverName || order.customer.name,
        phone: order.shipping.phone || order.customer.phone,
        address: `${order.shipping.address}, ${order.shipping.area}, ${order.shipping.upazila}, ${order.shipping.district}, ${order.shipping.division}`,
      };

      const businessSnapshot = order.resellerId
        ? { name: "Reseller Network Merchant", address: "DropshopNN Reseller Portal" }
        : { name: "DropshopNN Platform", address: "Dhaka, Bangladesh" };

      const itemsMapped = order.pricing.items.map((it) => ({
        description: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitSellingPrice,
        totalPrice: it.totalSellingPrice,
      }));

      const invoice = await this.invoiceRepository.create({
        invoiceNumber,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerSnapshot,
        businessSnapshot,
        items: itemsMapped,
        subtotal: order.pricing.subtotal,
        discountTotal: order.pricing.discountTotal,
        taxTotal: order.pricing.taxTotal,
        grandTotal: order.pricing.grandTotal,
        currency: order.pricing.currency || "BDT",
        status: ["completed", "delivered", "confirmed", "shipped"].includes(order.status)
          ? "paid"
          : "unpaid",
      }, { session });

      await EventBus.publish(
        "finance.invoice_generated",
        {
          invoiceId: invoice.id,
          invoiceNumber,
          orderId: order.id,
          grandTotal: invoice.grandTotal,
        },
        { source: "finance" },
      );

      logger.info("InvoiceService: invoice created", {
        invoiceId: invoice.id,
        invoiceNumber,
        orderId: order.id,
      });

      return invoice;
    });
  }
}

export default InvoiceService;
