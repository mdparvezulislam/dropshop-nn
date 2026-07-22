import { OrderRepository } from "../repositories/order-repository";
import type { Order, OrderItem } from "../domain/order-entity";

export class ExportService {
  private readonly orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async exportOrdersCsv(filter: Record<string, unknown>): Promise<string> {
    const orders = await this.orderRepository.find(filter, { sort: { createdAt: -1 } } as any);
    const header = "Order#,Customer,Phone,Division,District,Items,Subtotal,Discount,Tax,Grand Total,Profit,Status,Source,Courier,Tracking,Created At";
    const rows = orders.map((o: Order) =>
      [
        o.orderNumber,
        `"${o.customer?.name ?? ""}"`,
        o.customer?.phone ?? "",
        o.shipping?.division ?? "",
        o.shipping?.district ?? "",
        o.items?.length ?? 0,
        o.pricing?.subtotal ?? 0,
        o.pricing?.discountTotal ?? 0,
        o.pricing?.taxTotal ?? 0,
        o.pricing?.grandTotal ?? 0,
        o.profitPreview?.totalProfit ?? 0,
        o.status,
        o.source ?? "",
        o.shippingInfo?.courierName ?? "",
        o.shippingInfo?.trackingNumber ?? "",
        new Date(o.createdAt).toISOString(),
      ].join(","),
    );
    return [header, ...rows].join("\n");
  }

  async exportCodCsv(filter: Record<string, unknown>): Promise<string> {
    const header = "Order#,Courier,Tracking,Expected,Received,Difference,Status,Date";
    const orders = await this.orderRepository.find(filter, { sort: { createdAt: -1 } } as any);
    const rows = orders
      .filter((o: Order) => o.pricing?.grandTotal > 0)
      .map((o: Order) =>
        [
          o.orderNumber,
          o.shippingInfo?.courierName ?? "",
          o.shippingInfo?.trackingNumber ?? "",
          o.pricing?.grandTotal ?? 0,
          0,
          -(o.pricing?.grandTotal ?? 0),
          "pending",
          new Date(o.createdAt).toISOString(),
        ].join(","),
      );
    return [header, ...rows].join("\n");
  }

  async exportCourierReportCsv(filter: Record<string, unknown>): Promise<string> {
    const header = "Order#,Courier,Tracking,Status,District,Amount,Weight";
    const orders = await this.orderRepository.find(filter, { sort: { createdAt: -1 } } as any);
    const rows = orders
      .filter((o: Order) => o.shippingInfo?.courierName)
      .map((o: Order) =>
        [
          o.orderNumber,
          o.shippingInfo?.courierName ?? "",
          o.shippingInfo?.trackingNumber ?? "",
          o.status,
          o.shipping?.district ?? "",
          o.pricing?.grandTotal ?? 0,
          500,
        ].join(","),
      );
    return [header, ...rows].join("\n");
  }
}

export default ExportService;
