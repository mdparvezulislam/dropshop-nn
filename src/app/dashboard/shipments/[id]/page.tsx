import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentStatusBadge } from "@/components/dashboard/fulfillment/shipment-status-badge";
import { ShipmentControlPanel } from "@/components/dashboard/fulfillment/shipment-control-panel";
import { getShipmentAction } from "@/features/courier/actions/fulfillment-actions";

export const metadata: Metadata = {
  title: "Shipment",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function formatDateTime(iso?: string): string {
  return iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default async function ShipmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getShipmentAction(id);

  if (!result.success) {
    return (
      <div className="p-6">
        <p role="alert" className="text-sm font-bold text-destructive">
          {result.error}
        </p>
      </div>
    );
  }
  if (!result.data) notFound();

  const shipment = result.data;

  // Only milestones that actually happened are rendered — an empty date is
  // omitted rather than shown as a placeholder.
  const milestones = [
    { label: "Created", at: shipment.createdAt },
    { label: "Picked up", at: shipment.pickupDate },
    { label: "Dispatched", at: shipment.dispatchDate },
    { label: "Estimated delivery", at: shipment.estimatedDeliveryDate },
    { label: "Delivered", at: shipment.deliveryDate },
    { label: "Returned", at: shipment.returnDate },
  ].filter((m) => Boolean(m.at));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/shipments"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground mb-1 focus-visible:outline-2 focus-visible:outline-primary rounded"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            All shipments
          </Link>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-foreground">
            {shipment.shipmentNumber}
          </h1>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">
            Order{" "}
            <Link
              href={`/dashboard/orders/${shipment.orderId}`}
              className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              {shipment.orderNumber}
            </Link>{" "}
            • {shipment.providerName}
          </p>
        </div>
        <ShipmentStatusBadge status={shipment.status} label={shipment.statusLabel} />
      </div>

      {shipment.lastFailureReason && (
        <p
          role="status"
          className="text-xs font-bold text-warning bg-warning/10 border border-warning/30 rounded-xl px-3.5 py-2.5"
        >
          {shipment.lastFailureReason}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-4">
          <ShipmentControlPanel shipment={shipment} />
        </div>

        <div className="space-y-4">
          {/* Recipient */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                Recipient
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-semibold text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">{shipment.recipient.name}</p>
              <p className="font-mono">{shipment.recipient.phone}</p>
              <p>
                {shipment.recipient.address}, {shipment.recipient.area},{" "}
                {shipment.recipient.district}
              </p>
              <p className="pt-1.5 capitalize">Zone: {shipment.deliveryZone.replace(/_/g, " ")}</p>
            </CardContent>
          </Card>

          {/* Charges */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="text-xs font-semibold text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <dt>COD to collect</dt>
                  <dd className="text-foreground tabular-nums">
                    {shipment.codAmount > 0 ? formatBdt(shipment.codAmount) : "Prepaid"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery charge</dt>
                  <dd className="text-foreground tabular-nums">
                    {formatBdt(shipment.deliveryCharge)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>COD charge</dt>
                  <dd className="text-foreground tabular-nums">{formatBdt(shipment.codCharge)}</dd>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-border">
                  <dt>Chargeable weight</dt>
                  <dd className="text-foreground tabular-nums">{shipment.chargeableWeight} g</dd>
                </div>
              </dl>
              {shipment.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  Track on {shipment.providerName}
                </a>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          {milestones.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="text-xs font-semibold text-muted-foreground space-y-1.5">
                  {milestones.map((m) => (
                    <div key={m.label} className="flex justify-between gap-3">
                      <dt>{m.label}</dt>
                      <dd className="text-foreground text-right">{formatDateTime(m.at)}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Timeline */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Shipment timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3.5" aria-label="Shipment timeline">
            {shipment.history.map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="flex gap-3">
                <span className="flex flex-col items-center" aria-hidden>
                  <span
                    className={`h-2.5 w-2.5 rounded-full mt-1.5 ${
                      index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                  {index < shipment.history.length - 1 && (
                    <span className="w-px flex-1 bg-border mt-1" />
                  )}
                </span>
                <div className="pb-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">
                    {entry.statusLabel}
                    {entry.location ? ` • ${entry.location}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.message}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    {formatDateTime(entry.at)}
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
