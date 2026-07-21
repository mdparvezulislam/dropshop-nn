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
  FileText,
  MapPin,
  Phone,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { cn } from "@/shared/utils/cn";

export default function WholesaleOrderDetailPage(): React.ReactElement {
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

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/wholesale/orders")}>
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
                <MapPin className="h-4 w-4 text-primary" /> Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <span className="font-medium">{shipping.receiverName ?? "—"}</span>
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
              <CardTitle className="text-sm">Summary</CardTitle>
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
                <span>{o.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid"}</span>
              </div>
              <StatusChip label={o.paymentStatus ?? "pending"} tone={statusToneFromValue(o.paymentStatus)} />
            </CardContent>
          </Card>

          {o.trackingNumber && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm font-mono">
                {o.trackingNumber}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
