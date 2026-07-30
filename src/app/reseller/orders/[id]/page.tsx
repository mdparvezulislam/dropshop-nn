"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Printer,
  Copy,
  Truck,
  Clock,
  Package,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LifeBuoy,
  TrendingUp,
  MapPin,
  User,
  DollarSign,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function ResellerOrderDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const orderId = (params.id as string) || "";

  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<any>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { getResellerOrderDetailAction } = await import(
          "@/features/reseller/actions/reseller-order-actions"
        );
        const res = await getResellerOrderDetailAction(orderId);
        if (res.success && res.data) {
          const d = res.data;
          const grandTotal = Math.round(d.sellingPriceCents / 100);
          const costBasis = Math.round(d.costBasisCents / 100);
          const deliveryFee = Math.round(d.deliveryChargeCents / 100);
          const profit = Math.round(d.profitCents / 100);

          setOrder({
            id: d.id,
            orderNumber: d.orderNumber,
            customerName: d.customerName,
            customerPhone: d.customerPhone,
            customerEmail: d.customerEmail || "",
            fullAddress: d.fullAddress,
            district: d.district,
            upazila: d.upazila,
            productName: d.productName,
            quantity: d.quantity,
            items: d.items,
            unitPrice: d.items?.[0]?.unitSellingPrice || 0,
            unitCost: d.items?.[0]?.unitCostBasis || 0,
            deliveryFee,
            grandTotal,
            costBasis,
            profit,
            status: d.status,
            courierName: d.courierName || "Courier Assigned Pending",
            trackingNumber: d.trackingNumber || "N/A",
            trackingUrl: d.trackingUrl,
            notes: d.notes || "",
            createdAt: d.createdAt,
            timeline: d.timeline || [],
          });
        } else {
          toast.error(res.error || "Order not found");
        }
      } catch {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }
    if (orderId) load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-16 text-center text-sm font-semibold text-muted-foreground animate-fade-in">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-16 text-center text-sm font-semibold text-muted-foreground space-y-4">
        <p>Order not found.</p>
        <Link href="/reseller/orders">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const sellingPriceTaka = Math.round(order.sellingPriceTotal / 100);
  const profitTaka = Math.round(order.profit / 100);

  const cleanPhone = order.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`}`;

  const handleCopySummary = () => {
    const summary = `📦 অর্ডার #${order.orderNumber}
👤 কাস্টমার: ${order.customerName} (${order.customerPhone})
📍 ঠিকানা: ${order.fullAddress}, ${order.district}
🛒 পণ্য: ${order.productName} (${order.quantity} টি)
💰 বিক্রয় মূল্য: ৳${sellingPriceTaka}
🚚 স্ট্যাটাস: ${order.status}`;
    navigator.clipboard.writeText(summary);
    toast.success("অর্ডার সামারি কপি করা হয়েছে!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDuplicateOrder = () => {
    router.push(`/reseller/orders/create?productId=${order.id}&price=${(order.unitPrice / 100).toFixed(0)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <Link
          href="/reseller/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders List
        </Link>
        <div className="flex items-center gap-2">
          <Button onClick={handleCopySummary} variant="outline" size="sm" className="gap-1 text-xs font-bold">
            <Copy className="w-3.5 h-3.5" /> Copy Order
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1 text-xs font-bold">
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* Main Order Card Header */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-mono text-foreground">
                  #{order.orderNumber}
                </h1>
                <StatusChip label={order.status.replace(/_/g, " ")} tone={statusToneFromValue(order.status)} />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">
                অর্ডার স্থানান্তরের সময়: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${order.customerPhone}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" /> কল দিন
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> হোয়াটসঅ্যাপ
              </a>
              <Button onClick={handleDuplicateOrder} variant="outline" size="sm" className="gap-1 text-xs font-bold">
                Duplicate Order
              </Button>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Grand Total Bill</span>
              <p className="text-base font-black text-foreground tabular-nums">৳{order.grandTotal || Math.round((order.sellingPriceTotal || 0) / 100)}</p>
            </div>
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-center">
              <span className="text-[10px] font-bold text-success uppercase">Your Net Profit</span>
              <p className="text-base font-black text-success tabular-nums">+৳{order.profit || Math.round((order.profit || 0) / 100)}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Courier Service</span>
              <p className="text-xs font-black text-primary truncate">{order.courierName || "Pending"}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Tracking Code</span>
              <p className="text-xs font-mono font-black text-foreground truncate">{order.trackingNumber || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streamlined 3 Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs font-extrabold gap-1">
            <Package className="w-3.5 h-3.5" /> Overview & Customer
          </TabsTrigger>
          <TabsTrigger value="courier" className="text-xs font-extrabold gap-1">
            <Truck className="w-3.5 h-3.5" /> Courier & History
          </TabsTrigger>
          <TabsTrigger value="profit" className="text-xs font-extrabold gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Profit & Notes
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Customer & Products */}
        <TabsContent value="overview" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3 text-xs">
                <h3 className="font-black text-foreground flex items-center gap-1.5 text-sm border-b border-border/60 pb-2">
                  <User className="w-4 h-4 text-primary" /> Customer & Delivery Details:
                </h3>
                <div className="space-y-2 text-muted-foreground font-semibold">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="text-foreground font-bold">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-foreground font-bold font-mono">{order.customerPhone}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="text-foreground font-bold">{order.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>District / Area:</span>
                    <span className="text-foreground font-bold">{order.district} {order.upazila ? `(${order.upazila})` : ''}</span>
                  </div>
                  <div className="pt-1">
                    <span className="block mb-0.5">Full Address:</span>
                    <p className="text-foreground font-bold p-2.5 rounded-lg bg-muted/40 border border-border/60">
                      {order.fullAddress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3 text-xs">
                <h3 className="font-black text-foreground flex items-center gap-1.5 text-sm border-b border-border/60 pb-2">
                  <TrendingUp className="w-4 h-4 text-success" /> Financial Calculation:
                </h3>
                <div className="space-y-2 text-muted-foreground font-semibold">
                  <div className="flex justify-between">
                    <span>Resell Price (Cost Basis):</span>
                    <span className="text-foreground font-bold">৳{order.costBasis || Math.round((order.unitCost || 0) / 100 * (order.quantity || 1))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Selling Price:</span>
                    <span className="text-foreground font-bold">৳{order.grandTotal ? order.grandTotal - (order.deliveryFee || 0) : Math.round((order.unitPrice || 0) / 100 * (order.quantity || 1))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span className="text-foreground font-bold">৳{order.deliveryFee || 80}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/60">
                    <span className="font-black text-foreground">Grand Total Bill:</span>
                    <span className="text-primary font-black text-sm">৳{order.grandTotal || Math.round((order.sellingPriceTotal || 0) / 100)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-success/10 border border-success/30 text-success">
                    <span className="font-bold">Net Sales Profit:</span>
                    <span className="font-black">+৳{order.profit || Math.round((order.profit || 0) / 100)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Items Breakdown Card */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-4 space-y-3 text-xs">
              <h3 className="font-black text-foreground flex items-center gap-1.5 text-sm border-b border-border/60 pb-2">
                <Package className="w-4 h-4 text-amber-500" /> Ordered Items List:
              </h3>
              <div className="divide-y divide-border/40">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-foreground text-sm">{item.productName}</p>
                        {item.variantSku && (
                          <span className="text-[11px] font-mono text-muted-foreground">SKU: {item.variantSku}</span>
                        )}
                        <p className="text-muted-foreground font-semibold">Quantity: {item.quantity} pcs</p>
                      </div>
                      <div className="text-right font-semibold">
                        <p className="font-black text-primary text-sm">৳{Math.round(item.totalSellingPrice / 100)}</p>
                        <span className="text-success text-[11px] font-bold">+৳{Math.round(item.totalProfit / 100)} Profit</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{order.productName}</p>
                      <p className="text-muted-foreground">Quantity: {order.quantity} pcs</p>
                    </div>
                    <p className="font-black text-primary text-sm">৳{order.grandTotal ? order.grandTotal - (order.deliveryFee || 80) : Math.round((order.unitPrice || 0) / 100 * (order.quantity || 1))}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Courier & Timeline */}
        <TabsContent value="courier" className="pt-4 space-y-4">
          {/* READ-ONLY Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Truck className="w-4 h-4 text-amber-500" /> Managed by Steadfast Courier Engine
            </span>
            <span className="font-semibold text-[11px] bg-amber-500/20 px-2 py-0.5 rounded-md">
              READ ONLY Mode
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3 text-xs font-semibold">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <Truck className="w-4 h-4 text-primary" /> Steadfast Live Tracking:
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Courier Service:</span>
                    <span className="text-foreground font-extrabold">{order.courierName || "Steadfast Courier"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <span className="text-primary font-mono font-extrabold">{order.trackingNumber}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Current Status:</span>
                    <span className="text-foreground font-bold uppercase">{order.status}</span>
                  </p>
                  {order.trackingNumber && order.trackingNumber !== "N/A" && (
                    <a
                      href={`https://steadfast.com.bd/t/${order.trackingNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-2"
                    >
                      View Live Steadfast Portal &rarr;
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Synchronized Timeline:
                </h3>
                <div className="space-y-3 border-l-2 border-primary/30 pl-4">
                  {order.timeline && order.timeline.length > 0 ? (
                    order.timeline.map((t: any, i: number) => (
                      <div key={i} className="space-y-0.5 text-xs">
                        <p className="font-bold text-foreground">{t.title || t.summary || t.status}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{new Date(t.date || t.timestamp || Date.now()).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground font-semibold">No timeline history recorded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Profit & Notes */}
        <TabsContent value="profit" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3 text-xs font-semibold">
                <h3 className="text-sm font-black text-success flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <TrendingUp className="w-4 h-4" /> Profit Statement:
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Customer Sales Subtotal:</span>
                    <span>৳{order.grandTotal ? order.grandTotal - (order.deliveryFee || 80) : Math.round((order.unitPrice || 0) / 100 * (order.quantity || 1))}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Resell Wholesale Cost:</span>
                    <span>৳{order.costBasis || Math.round((order.unitCost || 0) / 100 * (order.quantity || 1))}</span>
                  </p>
                  <p className="text-sm font-black text-success pt-2 border-t border-border/60 flex justify-between">
                    <span>Net Sales Profit:</span>
                    <span>+৳{order.profit || Math.round((order.profit || 0) / 100)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3 text-xs font-semibold">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <FileText className="w-4 h-4 text-primary" /> Delivery Notes & Remarks:
                </h3>
                <p className="p-3 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground font-normal leading-relaxed">
                  {order.notes || "No special instructions provided."}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
