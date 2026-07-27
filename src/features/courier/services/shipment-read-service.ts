import { ShipmentRepository } from "../repositories/shipment-repository";
import {
  getShipmentStatusLabelBn,
  getShipmentStatusTone,
  type ShipmentStatusTone,
} from "../domain/shipment-state-machine";
import { getCourierNameBn } from "../domain/courier-catalog";
import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";

/**
 * The customer-facing shipment view.
 *
 * This is an allow-list, not a filter: internal notes, COD/return charges,
 * pickup address, consignment references, retry counts and failure reasons
 * never appear here. What is absent stays absent — a missing tracking number
 * renders as "not issued yet", never as a placeholder that looks real.
 */
export interface CustomerShipmentView {
  status: ShipmentStatus;
  statusLabel: string;
  tone: ShipmentStatusTone;
  courierName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  /** ISO strings; only present once the milestone actually happened. */
  dispatchedAt?: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
  deliveryNotes?: string;
  packageCount: number;
  timeline: Array<{ label: string; message: string; at: string }>;
}

const iso = (date?: Date): string | undefined => (date ? new Date(date).toISOString() : undefined);

export function toCustomerShipmentView(shipment: Shipment): CustomerShipmentView {
  return {
    status: shipment.status,
    statusLabel: getShipmentStatusLabelBn(shipment.status),
    tone: getShipmentStatusTone(shipment.status),
    courierName: getCourierNameBn(shipment.provider),
    trackingNumber: shipment.trackingCode,
    trackingUrl: shipment.trackingUrl,
    dispatchedAt: iso(shipment.dispatchDate ?? shipment.pickupDate),
    estimatedDeliveryAt: iso(shipment.estimatedDeliveryDate),
    deliveredAt: iso(shipment.deliveryDate),
    returnedAt: iso(shipment.returnDate),
    deliveryNotes: shipment.deliveryNotes,
    packageCount: shipment.packageCount ?? 1,
    timeline: [...shipment.history]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((entry) => ({
        label: getShipmentStatusLabelBn(entry.status),
        message: entry.message,
        at: new Date(entry.timestamp).toISOString(),
      })),
  };
}

/**
 * Reads the shipment attached to an order for customer surfaces.
 * Returns null when no shipment exists yet — callers show an honest
 * "not dispatched yet" message rather than inventing one.
 */
export class ShipmentReadService {
  private readonly shipments: ShipmentRepository;

  constructor() {
    this.shipments = new ShipmentRepository();
  }

  async getCustomerShipmentForOrder(orderId: string): Promise<CustomerShipmentView | null> {
    const shipment = await this.shipments.findLatestByOrderId(orderId);
    return shipment ? toCustomerShipmentView(shipment) : null;
  }
}

export default ShipmentReadService;
