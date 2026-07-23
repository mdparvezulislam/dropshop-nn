"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";

export default function SupplierPODetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [acting, setActing] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const { getOrderAction } = await import("@/features/order/actions/order-actions");
        const res = await getOrderAction(params.id as string);
        if (res.success) {
          setOrder(res.data);
        } else {
          toast.error("Purchase order not found");
        }
      } catch {
        toast.error("Failed to load purchase order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function transitionOrder(newStatus: string) {
    setActing(true);
    try {
      const { updateOrderStatusAction } = await import("@/features/order/actions/order-actions");
      const res = await updateOrderStatusAction({ orderId: params.id as string, toStatus: newStatus });
      if (res.success) {
        toast.success(`Order updated to ${newStatus.replace(/_/g, " ")}`);
        setOrder((prev: any) => ({ ...prev, status: newStatus }));
      } else {
        toast.error(res.error ?? "Failed to update order");
      }
    } catch {
      toast.error("Failed to update order");
    } finally {
      setActing(false);
    }
  }

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
          Purchase order not found.
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
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/supplier/purchase-orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`PO ${o.orderNumber ?? o._id?.slice(-6) ?? "—"}`}
          description={`Placed ${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"} · ${items.length} item${items.length !== 1 ? "s" : ""}`}
        />
        <div className="ml-auto">
          <StatusChip label={o.status} tone={statusToneFromValue(o.status)} />
        </div>
      </div>

      {o.status === "pending" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>This purchase order is awaiting your confirmation.</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={acting} onClick={() => transitionOrder("cancelled")}>
                <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
              </Button>
              <Button size="sm" disabled={acting} onClick={() => transitionOrder("confirmed")}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Shipping</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Receiver:</span>{" "}
                {o.shippingAddress?.fullName ?? o.customerName ?? o.customer?.name ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {o.shippingAddress?.phone ?? o.customer?.phone ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Address:</span>{" "}
                {o.shippingAddress?.fullAddress ?? o.shippingAddress?.address ?? "—"}
              </div>
            </CardContent>
          </Card>

          {o.notes?.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {o.notes.map((n: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <p>{n.content ?? n.text}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
