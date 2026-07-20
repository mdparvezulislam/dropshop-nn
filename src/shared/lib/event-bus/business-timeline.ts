import { logger } from "@/shared/utils/logger";
import type { BusinessEvent, TimelineEntry, TimelineChange, EventActor } from "./types";

const EVENT_ACTION_MAP: Record<string, string> = {
  "product.created": "Created",
  "product.updated": "Updated",
  "product.deleted": "Deleted",
  "product.published": "Published",
  "product.archived": "Archived",
  "product.visibility_changed": "Visibility Changed",
  "product.status_changed": "Status Changed",
  "product.variant_created": "Variant Created",
  "product.variant_updated": "Variant Updated",
  "product.variant_deleted": "Variant Deleted",
  "supplier.created": "Created",
  "supplier.updated": "Updated",
  "supplier.approved": "Approved",
  "supplier.rejected": "Rejected",
  "supplier.inventory_updated": "Inventory Updated",
  "supplier.status_changed": "Status Changed",
  "price.created": "Pricing Created",
  "price.updated": "Pricing Updated",
  "price.wholesale_tier_updated": "Wholesale Tier Updated",
  "price.minimum_price_updated": "Minimum Price Updated",
  "price.recommended_price_updated": "Recommended Price Updated",
  "price.campaign_started": "Campaign Started",
  "price.campaign_ended": "Campaign Ended",
  "inventory.created": "Inventory Created",
  "inventory.adjusted": "Stock Adjusted",
  "stock.increased": "Stock Increased",
  "stock.decreased": "Stock Decreased",
  "stock.reserved": "Stock Reserved",
  "stock.released": "Stock Released",
  "inventory.low_stock_detected": "Low Stock Alert",
  "inventory.out_of_stock": "Out of Stock",
  "inventory.warehouse_changed": "Warehouse Changed",
  "order.created": "Order Created",
  "order.confirmed": "Order Confirmed",
  "order.paid": "Order Paid",
  "order.packed": "Order Packed",
  "order.shipped": "Order Shipped",
  "order.delivered": "Order Delivered",
  "order.returned": "Order Returned",
  "order.cancelled": "Order Cancelled",
  "customer.registered": "Customer Registered",
  "customer.verified": "Customer Verified",
  "customer.profile_updated": "Profile Updated",
  "reseller.registered": "Reseller Registered",
  "reseller.approved": "Reseller Approved",
  "reseller.business_profile_completed": "Business Profile Completed",
  "reseller.selling_price_updated": "Selling Price Updated",
  "reseller.store_published": "Store Published",
  "wholesaler.registered": "Wholesaler Registered",
  "wholesaler.approved": "Wholesaler Approved",
  "wholesaler.pricing_viewed": "Pricing Viewed",
  "payment.initiated": "Payment Initiated",
  "payment.completed": "Payment Completed",
  "payment.failed": "Payment Failed",
  "payment.refund_created": "Refund Created",
  "system.login": "Login",
  "system.logout": "Logout",
  "system.role_changed": "Role Changed",
  "system.permission_changed": "Permission Changed",
};

const ENTITY_TYPE_MAP: Record<string, string> = {
  product: "Product",
  supplier: "Supplier",
  price: "ProductPricing",
  inventory: "ProductInventory",
  stock: "ProductInventory",
  order: "Order",
  customer: "Customer",
  reseller: "Reseller",
  wholesaler: "Wholesaler",
  payment: "Payment",
};

export class BusinessTimelineService {
  async record(event: BusinessEvent): Promise<void> {
    const entityInfo = this.extractEntityInfo(event);
    if (!entityInfo) return;

    const entry: TimelineEntry = {
      id: event.eventId,
      entityType: entityInfo.entityType,
      entityId: entityInfo.entityId,
      eventType: event.eventType,
      action: this.getActionText(event),
      summary: this.getSummary(event),
      actor: event.actor,
      changes: this.extractChanges(event),
      metadata: event.data as Record<string, unknown>,
      correlationId: event.correlationId,
      timestamp: new Date(event.timestamp),
    };

    try {
      const { default: BaseRepository } = await import(
        "@/shared/lib/database/generic-repository"
      );
      const { model } = await import("mongoose");

      const TimelineSchema = new (await import("mongoose")).Schema(
        {
          entityType: { type: String, required: true, index: true },
          entityId: { type: String, required: true, index: true },
          eventType: { type: String, required: true },
          action: { type: String, required: true },
          summary: { type: String },
          actor: {
            id: String,
            name: String,
            role: String,
          },
          changes: [
            {
              field: String,
              oldValue: {},
              newValue: {},
            },
          ],
          metadata: {},
          correlationId: String,
          timestamp: { type: Date, required: true },
        },
        { timestamps: true },
      );

      TimelineSchema.index(
        { entityType: 1, entityId: 1, timestamp: -1 },
        { name: "entity_timeline" },
      );
      TimelineSchema.index(
        { "actor.id": 1, timestamp: -1 },
        { name: "actor_timeline" },
      );
      TimelineSchema.index(
        { createdAt: 1 },
        { expireAfterSeconds: 90 * 24 * 60 * 60, name: "ttl_90d" },
      );

      const TimelineModel =
        (await import("mongoose")).models.BusinessTimeline ||
        model("BusinessTimeline", TimelineSchema);

      await TimelineModel.create(entry);
    } catch (error) {
      logger.error("BusinessTimelineService: failed to record timeline entry", error, {
        eventId: event.eventId,
        eventType: event.eventType,
      });
    }
  }

  private extractEntityInfo(
    event: BusinessEvent,
  ): { entityType: string; entityId: string } | null {
    const data = event.data as Record<string, unknown>;
    const domain = event.eventType.split(".")[0];

    const entityType = ENTITY_TYPE_MAP[domain];
    if (!entityType) return null;

    const possibleIdFields = [
      `${domain}Id`,
      `${entityType.charAt(0).toLowerCase() + entityType.slice(1)}Id`,
    ];

    for (const field of possibleIdFields) {
      const entityId = data[field] as string | undefined;
      if (entityId) return { entityType, entityId };
    }

    return null;
  }

  private getActionText(event: BusinessEvent): string {
    return EVENT_ACTION_MAP[event.eventType] ?? event.eventType;
  }

  private getSummary(event: BusinessEvent): string {
    const action = this.getActionText(event);
    const actorName = event.actor?.name ?? event.actor?.role ?? "System";

    return `${action} by ${actorName}`;
  }

  private extractChanges(event: BusinessEvent): TimelineChange[] | undefined {
    const data = event.data as Record<string, unknown>;
    const rawChanges = data.changes;

    if (Array.isArray(rawChanges)) {
      return rawChanges as TimelineChange[];
    }

    if (data.oldValue !== undefined || data.newValue !== undefined) {
      return [
        {
          field: "value",
          oldValue: data.oldValue as unknown,
          newValue: data.newValue as unknown,
        },
      ];
    }

    if (event.eventType.includes("updated")) {
      const changes: TimelineChange[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "object" && value !== null && "oldValue" in value) {
          const v = value as Record<string, unknown>;
          changes.push({
            field: key,
            oldValue: v.oldValue,
            newValue: v.newValue,
          });
        }
      }
      return changes.length > 0 ? changes : undefined;
    }

    return undefined;
  }
}
