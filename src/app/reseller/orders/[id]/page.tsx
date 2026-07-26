"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, Truck, Clock, MapPin, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { Spinner } from "@/components/ui/spinner";
import { getHumanLabel, getAllowedTransitions } from "@/features/order/domain/state-machine";

export default function ResellerOrderDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [transitioning, setTransitioning] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const { getOrderAction } = await import("@/features/order/actions/order-actions");
        const res = await getOrderAction({ orderId: params.id });
        if (res.success) {
          setOrder(res.data);
        } else {
          toast.error(res.error ?? "Order not found");
        }
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleCancel = async () => {
    setTransitioning(true);
    try {
      const { cancelOrderAction } = await import("@/features/order/actions/order-actions");
      const res = await cancelOrderAction({
        orderId: params.id,
        reason: "Cancelled by reseller",
        cancelledBy: "reseller",
      });
      if (res.success) {
        setOrder((prev: any) => ({ ...prev, status: "cancelled" }));
        toast.success("Order cancelled");
      } else {
        toast.error(res.error ?? "Failed to cancel");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setTransitioning(false);
    }
  };

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
            This order could not be found. It may have been removed.
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const items = order.pricing?.items ?? [];
  const timeline = order.timeline ?? [];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/reseller/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`Order ${order.orderNumber ?? "—"}`}
          badge={
            <StatusChip
              label={getHumanLabel(order.status)}
              tone={statusToneFromValue(order.status)}
            />
          }
          description={`Placed on ${new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Main */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">No timeline entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {timeline.map((entry: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium">{entry.action ?? entry.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.actor ?? "System"} ·{" "}
                          {new Date(entry.createdAt ?? entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="divide-y divide-border">
                {items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatCents(item.totalPrice ?? item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Customer & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{order.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{order.customer?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium text-right max-w-[60%]">
                  {order.shippingInfo?.address ?? order.customer?.address ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Courier</span>
                <span className="font-medium">{order.shippingInfo?.courierName ?? "Pending"}</span>
              </div>
              {order.shippingInfo?.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking</span>
                  <span className="font-medium font-mono text-xs">
                    {order.shippingInfo.trackingNumber}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCents(order.pricing?.subtotal ?? order.pricing?.grandTotal ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">
                  {formatCents(order.shippingInfo?.deliveryCharge ?? 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Grand Total</span>
                <span className="font-bold tabular-nums text-primary">
                  {formatCents(order.pricing?.grandTotal ?? 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Profit</span>
                <span className="font-semibold text-success">
                  {formatCents(order.profitPreview?.totalProfit ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {order.status !== "cancelled" && order.status !== "completed" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={transitioning}
                  onClick={handleCancel}
                >
                  {transitioning ? "Cancelling…" : "Cancel Order"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Order Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1.5 text-xs text-muted-foreground">
              <p>Type: {order.type ?? "N/A"}</p>
              <p>Payment: {order.paymentMethod ?? "COD"}</p>
              {order.shippingInfo?.deliveryCharge && (
                <p>Delivery: {formatCents(order.shippingInfo.deliveryCharge)}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
