"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, ExternalLink, Loader2, Package, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShipmentStatusBadge } from "./shipment-status-badge";
import { COURIER_PROVIDERS } from "@/features/courier/domain/courier-catalog";
import {
  createShipmentAction,
  getShipmentForOrderAction,
  updateShipmentStatusAction,
  type AdminShipmentDto,
} from "@/features/courier/actions/fulfillment-actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground " +
  "placeholder:font-normal placeholder:text-muted-foreground " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

const labelClass = "block text-[11px] font-bold text-muted-foreground mb-1";

const primaryButtonClass =
  "h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground " +
  "text-xs font-bold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export interface OrderFulfillmentItem {
  productId: string;
  productName?: string;
  variantSku?: string;
  quantity: number;
}

/** Order statuses at which packing has not started yet. */
const PRE_PACK_STATUSES = ["draft", "pending", "confirmed", "picking"];

/**
 * Fulfillment for a single order: the packing checklist, shipment creation and
 * a live summary of the shipment once it exists.
 *
 * The checklist is a real gate, not decoration — the create-shipment form stays
 * disabled until every line has been physically picked, because a shipment
 * created against an incomplete parcel is a partial delivery nobody recorded.
 */
export function OrderFulfillmentPanel({
  orderId,
  orderStatus,
  items,
  onChanged,
}: {
  orderId: string;
  orderStatus: string;
  items: OrderFulfillmentItem[];
  onChanged?: () => void;
}): React.ReactElement {
  const [shipment, setShipment] = React.useState<AdminShipmentDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [pending, setPending] = React.useState<string | null>(null);

  const [checked, setChecked] = React.useState<Set<string>>(new Set());
  const [provider, setProvider] = React.useState(COURIER_PROVIDERS[0]?.id ?? "pathao");
  const [weight, setWeight] = React.useState("500");
  const [length, setLength] = React.useState("");
  const [width, setWidth] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [packageCount, setPackageCount] = React.useState("1");
  const [trackingCode, setTrackingCode] = React.useState("");
  const [deliveryNotes, setDeliveryNotes] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getShipmentForOrderAction(orderId);
      if (result.success) setShipment(result.data);
      else toast.error(result.error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const itemKey = (item: OrderFulfillmentItem, index: number) =>
    `${item.productId}-${item.variantSku ?? index}`;

  const allPicked = items.length > 0 && items.every((item, i) => checked.has(itemKey(item, i)));

  const toggleItem = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCreate = async () => {
    setPending("create");
    try {
      const result = await createShipmentAction({
        orderId,
        provider,
        trackingCode: trackingCode.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        package: {
          weightGrams: weight,
          lengthCm: length || undefined,
          widthCm: width || undefined,
          heightCm: height || undefined,
          packageCount: packageCount || undefined,
        },
      });

      if (result.success) {
        toast.success(`Shipment ${result.data.shipmentNumber} created`);
        setShipment(result.data);
        onChanged?.();
      } else {
        toast.error(result.error);
      }
    } finally {
      setPending(null);
    }
  };

  const handleStatus = async (toStatus: string, label: string) => {
    setPending(toStatus);
    try {
      const result = await updateShipmentStatusAction({ shipmentId: shipment!.id, toStatus });
      if (result.success) {
        toast.success(`Shipment moved to ${label}`);
        setShipment(result.data);
        onChanged?.();
      } else {
        toast.error(result.error);
      }
    } finally {
      setPending(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 justify-center text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading fulfillment…
      </div>
    );
  }

  // ── Shipment exists ────────────────────────────────────────────────
  if (shipment) {
    return (
      <div className="space-y-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" aria-hidden />
                Shipment {shipment.shipmentNumber}
              </CardTitle>
              <ShipmentStatusBadge status={shipment.status} label={shipment.statusLabel} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between gap-2">
                <dt>Courier</dt>
                <dd className="text-foreground">{shipment.providerName}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Tracking number</dt>
                <dd className="text-foreground font-mono">
                  {shipment.trackingCode ?? "Not issued yet"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Package</dt>
                <dd className="text-foreground">
                  {shipment.packageCount} × {shipment.chargeableWeight} g
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>COD</dt>
                <dd className="text-foreground tabular-nums">
                  {shipment.codAmount > 0 ? `৳${shipment.codAmount.toLocaleString("en-BD")}` : "Prepaid"}
                </dd>
              </div>
            </dl>

            {shipment.allowedTransitions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {shipment.allowedTransitions.map((t) => (
                  <button
                    key={t.status}
                    type="button"
                    disabled={pending !== null}
                    onClick={() => handleStatus(t.status, t.label)}
                    className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-xs font-bold text-foreground hover:border-primary/50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {pending === t.status && (
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    )}
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={`/dashboard/shipments/${shipment.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Full shipment view
              </Link>
              {shipment.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  Track on {shipment.providerName}
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Shipment timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3" aria-label="Shipment timeline">
              {shipment.history.map((entry, index) => (
                <li key={`${entry.at}-${index}`} className="flex gap-3">
                  <span className="flex flex-col items-center" aria-hidden>
                    <span
                      className={`h-2 w-2 rounded-full mt-1.5 ${
                        index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    {index < shipment.history.length - 1 && (
                      <span className="w-px flex-1 bg-border mt-1" />
                    )}
                  </span>
                  <div className="min-w-0 pb-1">
                    <p className="text-xs font-bold text-foreground">{entry.statusLabel}</p>
                    <p className="text-xs text-muted-foreground">{entry.message}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                      {new Date(entry.at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── No shipment yet ────────────────────────────────────────────────
  const tooEarly = PRE_PACK_STATUSES.includes(orderStatus) && orderStatus !== "confirmed" && orderStatus !== "picking";

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-primary" aria-hidden />
            Packing checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">This order has no items to pack.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {items.map((item, index) => {
                  const key = itemKey(item, index);
                  return (
                    <li key={key}>
                      <label className="flex items-start gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checked.has(key)}
                          onChange={() => toggleItem(key)}
                          className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-foreground">
                            {item.productName ?? item.productId}
                          </span>
                          <span className="block text-[11px] font-semibold text-muted-foreground">
                            {item.variantSku ? `${item.variantSku} • ` : ""}Qty {item.quantity}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p
                className={`mt-3 text-[11px] font-bold ${allPicked ? "text-success" : "text-muted-foreground"}`}
                role="status"
              >
                {allPicked ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    All {items.length} lines picked — ready to create the shipment.
                  </span>
                ) : (
                  `${checked.size} of ${items.length} lines picked.`
                )}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-primary" aria-hidden />
            Create shipment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tooEarly ? (
            <p className="text-xs text-muted-foreground">
              Confirm this order before creating a shipment.{" "}
              <Badge variant="muted" size="sm" className="ml-1">
                {orderStatus}
              </Badge>
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="of-provider" className={labelClass}>
                    Courier
                  </label>
                  <select
                    id="of-provider"
                    className={inputClass}
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  >
                    {COURIER_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="of-tracking" className={labelClass}>
                    Tracking number (if already booked)
                  </label>
                  <input
                    id="of-tracking"
                    className={inputClass}
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Leave empty until the courier issues one"
                  />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                <div>
                  <label htmlFor="of-weight" className={labelClass}>
                    Weight (g)
                  </label>
                  <input
                    id="of-weight"
                    type="number"
                    min={1}
                    className={inputClass}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="of-length" className={labelClass}>
                    L (cm)
                  </label>
                  <input
                    id="of-length"
                    type="number"
                    min={0}
                    className={inputClass}
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="of-width" className={labelClass}>
                    W (cm)
                  </label>
                  <input
                    id="of-width"
                    type="number"
                    min={0}
                    className={inputClass}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="of-height" className={labelClass}>
                    H (cm)
                  </label>
                  <input
                    id="of-height"
                    type="number"
                    min={0}
                    className={inputClass}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="of-count" className={labelClass}>
                    Packages
                  </label>
                  <input
                    id="of-count"
                    type="number"
                    min={1}
                    className={inputClass}
                    value={packageCount}
                    onChange={(e) => setPackageCount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="of-notes" className={labelClass}>
                  Delivery note — visible to the customer
                </label>
                <input
                  id="of-notes"
                  className={inputClass}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Call before delivery"
                />
              </div>

              <button
                type="button"
                className={primaryButtonClass}
                disabled={!allPicked || pending === "create"}
                onClick={handleCreate}
              >
                {pending === "create" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                Create shipment
              </button>
              {!allPicked && items.length > 0 && (
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Tick every line on the packing checklist first.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderFulfillmentPanel;
