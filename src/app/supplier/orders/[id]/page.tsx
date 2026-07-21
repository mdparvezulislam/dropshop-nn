"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";

export default function SupplierOrderDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const { getOrderAction } = await import("@/features/order/actions/order-actions");
        const res = await getOrderAction(params.id as string);
        if (res.success) {
          setOrder(res.data);
        } else {
          toast.error("Order not found");
        }
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Order not found.
        </CardContent>
      </Card>
    );
  }

  const o = order;
  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const items = o.items ?? [];
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 0), 0);
  const grandTotal = o.grandTotal ?? o.total ?? subtotal;

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/supplier/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`Order ${o.orderNumber ?? o._id?.slice(-6) ?? "—"}`}
          description={`Placed ${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"} · ${items.length} item${items.length !== 1 ? "s" : ""}`}
        />
        <div className="ml-auto">
          <StatusChip label={o.status} tone={statusToneFromValue(o.status)} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">No items in this order.</div>
              ) : (
                <div className="divide-y divide-border">
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.productName ?? item.name ?? `Item ${idx + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku ?? "—"} · Qty: {item.quantity ?? 0}
                        </p>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {formatCents((item.unitPrice ?? 0) * (item.quantity ?? 0))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {o.timeline?.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative ml-2 space-y-4 border-l border-border pl-4">
                  {o.timeline.map((event: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-border bg-muted" />
                      <p className="text-sm font-medium">{event.type ?? event.action ?? "Event"}</p>
                      <p className="text-xs text-muted-foreground">{event.summary ?? event.description ?? ""}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                        {event.actor ? ` · ${event.actor}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Customer &amp; Delivery</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{o.customerName ?? o.customer?.name ?? "—"}</p>
                  <p className="text-muted-foreground text-xs">{o.customerEmail ?? o.customer?.email ?? ""}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <span>{o.shippingAddress?.phone ?? o.customer?.phone ?? "—"}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p>{o.shippingAddress?.fullName ?? o.customerName ?? "—"}</p>
                  <p className="text-muted-foreground">
                    {[o.shippingAddress?.area, o.shippingAddress?.district, o.shippingAddress?.division].filter(Boolean).join(", ")}
                  </p>
                  {o.shippingAddress?.fullAddress && (
                    <p className="text-muted-foreground">{o.shippingAddress.fullAddress}</p>
                  )}
                </div>
              </div>
              {o.shippingAddress?.deliveryNote && (
                <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                  Note: {o.shippingAddress.deliveryNote}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCents(subtotal)}</span>
              </div>
              {o.deliveryCharge ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="tabular-nums">{formatCents(o.deliveryCharge)}</span>
                </div>
              ) : null}
              {o.discount ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="tabular-nums text-success">-{formatCents(o.discount)}</span>
                </div>
              ) : null}
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Grand Total</span>
                <span className="tabular-nums">{formatCents(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {(o.paymentMethod || o.paymentStatus) && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Payment</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-sm">
                {o.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium uppercase">{o.paymentMethod}</span>
                  </div>
                )}
                {o.paymentStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusChip label={o.paymentStatus} tone={statusToneFromValue(o.paymentStatus)} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {o.trackingNumber && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Tracking</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm">
                <p className="font-mono text-xs">{o.trackingNumber}</p>
                {o.trackingUrl && (
                  <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-primary hover:underline">
                    Track shipment →
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
