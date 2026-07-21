"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { cn } from "@/shared/utils/cn";

export default function WholesaleBulkOrderDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const { getOrderAction } = await import("@/features/order/actions/order-actions");
        const res = await getOrderAction({ orderId: params.id as string });
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
      <div className="space-y-6">
        <PageHeader title="Order Not Found" />
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Order not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const o = order;
  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const shipping = o.shipping ?? {};
  const items = o.items ?? [];
  const subtotal = items.reduce((s: number, i: any) => s + (i.resolvedPrice ?? i.unitPrice ?? 0) * (i.quantity ?? 0), 0);
  const deliveryCharge = o.deliveryCharge ?? 0;
  const grandTotal = o.grandTotal ?? o.total ?? subtotal + deliveryCharge;

  const timeline = [
    { label: "Order Placed", date: o.createdAt, done: true },
    { label: "Processing", date: o.processedAt, done: !!o.processedAt },
    { label: "Shipped", date: o.shippedAt, done: !!o.shippedAt },
    { label: "Delivered", date: o.deliveredAt, done: !!o.deliveredAt },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/wholesale/bulk-orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader
            title={`Order ${o.orderNumber ?? o._id?.slice(-8) ?? ""}`}
            description={`Placed ${o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}`}
          />
        </div>
        <StatusChip label={o.status ?? "pending"} tone={statusToneFromValue(o.status)} />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Order Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-0">
            {timeline.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      step.done
                        ? "border-success bg-success/10 text-success"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center">{step.label}</span>
                  {step.date && (
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(step.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {i < timeline.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1",
                      step.done ? "bg-success" : "bg-border",
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left - Items */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.productName ?? item.title ?? "Product"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        SKU: {item.variantSku ?? "—"} · Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCents((item.resolvedPrice ?? item.unitPrice ?? 0) * (item.quantity ?? 0))}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {formatCents(item.resolvedPrice ?? item.unitPrice ?? 0)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{shipping.receiverName ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{shipping.phone ?? "—"}</span>
              </div>
              {shipping.area && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{shipping.area}, {shipping.district ?? "—"}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right - Summary */}
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="tabular-nums">{formatCents(deliveryCharge)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatCents(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Payment</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{o.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid / Bank Transfer"}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip label={o.paymentStatus ?? "pending"} tone={statusToneFromValue(o.paymentStatus)} />
              </div>
            </CardContent>
          </Card>

          {o.trackingNumber && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm">
                <span className="font-mono">{o.trackingNumber}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
