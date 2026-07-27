"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShipmentStatusBadge } from "./shipment-status-badge";
import { bulkUpdateShipmentStatusAction } from "@/features/courier/actions/fulfillment-actions";
import type { AdminShipmentDto } from "@/features/courier/actions/fulfillment-actions";
import {
  SHIPMENT_STATUSES,
  getShipmentStatusLabel,
  isValidShipmentTransition,
} from "@/features/courier/domain/shipment-state-machine";
import type { ShipmentStatus } from "@/features/courier/domain/shipment-entity";

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`;
}

/**
 * The shipment list.
 *
 * Selection drives a bulk status update. The bulk target list is filtered to
 * statuses that are legal for *every* selected shipment, so an operator can
 * never fire a bulk action that the state machine will reject halfway through
 * and leave the batch half-applied.
 */
export function ShipmentTable({
  shipments,
}: {
  shipments: AdminShipmentDto[];
}): React.ReactElement {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);

  const selectedShipments = React.useMemo(
    () => shipments.filter((s) => selected.has(s.id)),
    [shipments, selected],
  );

  // Only statuses every selected shipment can legally reach.
  const bulkOptions = React.useMemo<ShipmentStatus[]>(() => {
    if (selectedShipments.length === 0) return [];
    return SHIPMENT_STATUSES.filter((target) =>
      selectedShipments.every((s) => isValidShipmentTransition(s.status, target)),
    );
  }, [selectedShipments]);

  React.useEffect(() => {
    if (bulkStatus && !bulkOptions.includes(bulkStatus as ShipmentStatus)) setBulkStatus("");
  }, [bulkOptions, bulkStatus]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === shipments.length ? new Set() : new Set(shipments.map((s) => s.id))));
  };

  const runBulk = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setSubmitting(true);
    try {
      const result = await bulkUpdateShipmentStatusAction({
        shipmentIds: [...selected],
        toStatus: bulkStatus,
        message: "Bulk status update from the fulfillment console",
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { updated, failed, errors } = result.data;
      if (updated > 0) toast.success(`${updated} shipment${updated === 1 ? "" : "s"} updated`);
      if (failed > 0) toast.error(`${failed} failed — ${errors[0]?.error ?? "see logs"}`);

      setSelected(new Set());
      setBulkStatus("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <PackageSearch className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-bold text-foreground">No shipments match these filters</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Shipments appear here once an order is packed and a courier is assigned from the order
          page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-2.5"
        >
          <span className="text-xs font-bold text-foreground">
            {selected.size} selected
          </span>
          <select
            aria-label="Bulk status"
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
          >
            <option value="">Move to…</option>
            {bulkOptions.map((status) => (
              <option key={status} value={status}>
                {getShipmentStatusLabel(status)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={runBulk}
            disabled={!bulkStatus || submitting}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
            Apply
          </button>
          {bulkOptions.length === 0 && (
            <span className="text-[11px] font-semibold text-muted-foreground">
              The selected shipments have no status in common — narrow the selection.
            </span>
          )}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs font-bold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary rounded"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left">
          <caption className="sr-only">Shipments</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all shipments on this page"
                  checked={selected.size === shipments.length && shipments.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
              </th>
              {["Shipment", "Order", "Courier / Tracking", "Package", "COD", "Status"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select shipment ${shipment.shipmentNumber}`}
                    checked={selected.has(shipment.id)}
                    onChange={() => toggle(shipment.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/dashboard/shipments/${shipment.id}`}
                    className="font-mono text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded"
                  >
                    {shipment.shipmentNumber}
                  </Link>
                  {shipment.createdAt && (
                    <span className="block text-[10px] font-semibold text-muted-foreground mt-0.5">
                      {new Date(shipment.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/dashboard/orders/${shipment.orderId}`}
                    className="text-xs font-bold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-primary rounded"
                  >
                    {shipment.orderNumber}
                  </Link>
                  <span className="block text-[10px] font-semibold text-muted-foreground mt-0.5 truncate max-w-40">
                    {shipment.recipient.name} • {shipment.recipient.district}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs font-bold text-foreground">{shipment.providerName}</span>
                  <span className="block text-[10px] font-mono text-muted-foreground mt-0.5">
                    {shipment.trackingCode ?? "No tracking number yet"}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  {formatWeight(shipment.chargeableWeight)}
                  {shipment.packageCount > 1 && (
                    <Badge variant="muted" size="sm" className="ml-1.5">
                      ×{shipment.packageCount}
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-3 text-xs font-bold text-foreground tabular-nums whitespace-nowrap">
                  {shipment.codAmount > 0 ? formatBdt(shipment.codAmount) : "—"}
                </td>
                <td className="px-3 py-3">
                  <ShipmentStatusBadge status={shipment.status} label={shipment.statusLabel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShipmentTable;
