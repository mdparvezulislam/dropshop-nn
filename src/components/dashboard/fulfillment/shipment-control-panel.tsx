"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Truck, PackageOpen, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COURIER_PROVIDERS } from "@/features/courier/domain/courier-catalog";
import {
  assignCourierAction,
  updateShipmentNotesAction,
  updateShipmentPackageAction,
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

/**
 * The operator's controls for one shipment: move its status, record the
 * courier and tracking number, capture the package, and leave notes.
 *
 * The status selector is built from the shipment's own allowed transitions, so
 * illegal jumps are not offered in the first place — the server refuses them
 * too, but an operator should never be able to click something that will fail.
 */
export function ShipmentControlPanel({
  shipment,
}: {
  shipment: AdminShipmentDto;
}): React.ReactElement {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<{ success: boolean; error?: string }>, okMessage: string) => {
    setPending(key);
    try {
      const result = await fn();
      if (result.success) {
        toast.success(okMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "Action failed");
      }
    } finally {
      setPending(null);
    }
  };

  // ── Status ──────────────────────────────────────────────────────────
  const [nextStatus, setNextStatus] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState("");

  // ── Courier ─────────────────────────────────────────────────────────
  const [provider, setProvider] = React.useState(shipment.provider);
  const [trackingCode, setTrackingCode] = React.useState(shipment.trackingCode ?? "");
  const [eta, setEta] = React.useState(shipment.estimatedDeliveryDate?.slice(0, 10) ?? "");

  // ── Package ─────────────────────────────────────────────────────────
  const [weight, setWeight] = React.useState(String(shipment.parcelWeight));
  const [length, setLength] = React.useState(String(shipment.dimensions?.length ?? ""));
  const [width, setWidth] = React.useState(String(shipment.dimensions?.width ?? ""));
  const [height, setHeight] = React.useState(String(shipment.dimensions?.height ?? ""));
  const [packageCount, setPackageCount] = React.useState(String(shipment.packageCount));

  // ── Notes ───────────────────────────────────────────────────────────
  const [deliveryNotes, setDeliveryNotes] = React.useState(shipment.deliveryNotes ?? "");
  const [internalNotes, setInternalNotes] = React.useState(shipment.internalNotes ?? "");

  // Live preview of what the courier will bill on, using the same
  // max(actual, volumetric) rule the server applies.
  const chargeablePreview = React.useMemo(() => {
    const actual = Number(weight) || 0;
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    const volumetric = l > 0 && w > 0 && h > 0 ? Math.round((l * w * h) / 5) : 0;
    return { actual, volumetric, chargeable: Math.max(actual, volumetric) };
  }, [weight, length, width, height]);

  return (
    <div className="space-y-4">
      {/* Status */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" aria-hidden />
            Shipment status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shipment.allowedTransitions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              This shipment is {shipment.statusLabel.toLowerCase()} — a final state. No further
              status changes are possible.
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="next-status" className={labelClass}>
                    Move to
                  </label>
                  <select
                    id="next-status"
                    className={inputClass}
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                  >
                    <option value="">Select a status…</option>
                    {shipment.allowedTransitions.map((t) => (
                      <option key={t.status} value={t.status}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status-note" className={labelClass}>
                    Note (optional)
                  </label>
                  <input
                    id="status-note"
                    className={inputClass}
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="What happened?"
                  />
                </div>
              </div>
              <button
                type="button"
                className={primaryButtonClass}
                disabled={!nextStatus || pending === "status"}
                onClick={() =>
                  run(
                    "status",
                    () =>
                      updateShipmentStatusAction({
                        shipmentId: shipment.id,
                        toStatus: nextStatus,
                        message: statusMessage.trim() || undefined,
                      }),
                    "Shipment status updated",
                  )
                }
              >
                {pending === "status" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                Update status
              </button>
              {!shipment.trackingCode && (
                <p className="text-[11px] font-semibold text-warning">
                  Record the courier&apos;s tracking number below before marking the parcel picked
                  up.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Courier */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Courier &amp; tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="courier-provider" className={labelClass}>
                Courier
              </label>
              <select
                id="courier-provider"
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
              <label htmlFor="tracking-code" className={labelClass}>
                Tracking number
              </label>
              <input
                id="tracking-code"
                className={inputClass}
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="From the courier's panel"
              />
            </div>
            <div>
              <label htmlFor="eta" className={labelClass}>
                Estimated delivery
              </label>
              <input
                id="eta"
                type="date"
                className={inputClass}
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            No courier API is connected yet. Book the parcel in the courier&apos;s own panel, then
            record the real tracking number here — the customer sees exactly what you enter.
          </p>
          <button
            type="button"
            className={primaryButtonClass}
            disabled={pending === "courier"}
            onClick={() =>
              run(
                "courier",
                () =>
                  assignCourierAction({
                    shipmentId: shipment.id,
                    provider,
                    trackingCode: trackingCode.trim() || undefined,
                    estimatedDeliveryDate: eta || undefined,
                  }),
                "Courier details saved",
              )
            }
          >
            {pending === "courier" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
            <Save className="h-3.5 w-3.5" aria-hidden />
            Save courier details
          </button>
        </CardContent>
      </Card>

      {/* Package */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <PackageOpen className="h-3.5 w-3.5 text-primary" aria-hidden />
            Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
            <div>
              <label htmlFor="pkg-weight" className={labelClass}>
                Weight (g)
              </label>
              <input
                id="pkg-weight"
                type="number"
                min={1}
                className={inputClass}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pkg-length" className={labelClass}>
                Length (cm)
              </label>
              <input
                id="pkg-length"
                type="number"
                min={0}
                className={inputClass}
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pkg-width" className={labelClass}>
                Width (cm)
              </label>
              <input
                id="pkg-width"
                type="number"
                min={0}
                className={inputClass}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pkg-height" className={labelClass}>
                Height (cm)
              </label>
              <input
                id="pkg-height"
                type="number"
                min={0}
                className={inputClass}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pkg-count" className={labelClass}>
                Packages
              </label>
              <input
                id="pkg-count"
                type="number"
                min={1}
                className={inputClass}
                value={packageCount}
                onChange={(e) => setPackageCount(e.target.value)}
              />
            </div>
          </div>

          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-semibold text-muted-foreground">
            <div className="flex gap-1.5">
              <dt>Actual:</dt>
              <dd className="text-foreground tabular-nums">{chargeablePreview.actual} g</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Volumetric:</dt>
              <dd className="text-foreground tabular-nums">
                {chargeablePreview.volumetric > 0 ? `${chargeablePreview.volumetric} g` : "—"}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Chargeable:</dt>
              <dd className="text-foreground tabular-nums font-bold">
                {chargeablePreview.chargeable} g
              </dd>
            </div>
          </dl>

          <button
            type="button"
            className={primaryButtonClass}
            disabled={pending === "package"}
            onClick={() =>
              run(
                "package",
                () =>
                  updateShipmentPackageAction({
                    shipmentId: shipment.id,
                    recalculateCharges: true,
                    package: {
                      weightGrams: weight,
                      lengthCm: length || undefined,
                      widthCm: width || undefined,
                      heightCm: height || undefined,
                      packageCount: packageCount || undefined,
                    },
                  }),
                "Package saved and delivery charge recalculated",
              )
            }
          >
            {pending === "package" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
            <Save className="h-3.5 w-3.5" aria-hidden />
            Save package
          </button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <StickyNote className="h-3.5 w-3.5 text-primary" aria-hidden />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label htmlFor="delivery-notes" className={labelClass}>
              Delivery note — visible to the customer
            </label>
            <textarea
              id="delivery-notes"
              rows={2}
              maxLength={500}
              className={`${inputClass} h-auto py-2 resize-y`}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Call before delivery"
            />
          </div>
          <div>
            <label htmlFor="internal-notes" className={labelClass}>
              Internal note — staff only, never shown to the customer
            </label>
            <textarea
              id="internal-notes"
              rows={2}
              maxLength={1000}
              className={`${inputClass} h-auto py-2 resize-y`}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Anything the team needs to know"
            />
          </div>
          <button
            type="button"
            className={primaryButtonClass}
            disabled={pending === "notes"}
            onClick={() =>
              run(
                "notes",
                () =>
                  updateShipmentNotesAction({
                    shipmentId: shipment.id,
                    deliveryNotes,
                    internalNotes,
                  }),
                "Notes saved",
              )
            }
          >
            {pending === "notes" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
            <Save className="h-3.5 w-3.5" aria-hidden />
            Save notes
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShipmentControlPanel;
