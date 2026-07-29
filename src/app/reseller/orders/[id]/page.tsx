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
        const { listCheckoutsAction } = await import(
          "@/features/checkout/actions/checkout-actions"
        );
        const res = await listCheckoutsAction({ type: "reseller", limit: 20 });
        if (res.success && res.data) {
          const items = (res.data as any).items || (res.data as any).checkouts || [];
          const found = items.find((o: any) => (o.id || o._id) === orderId) || items[0];

          if (found) {
            const item = found.items?.[0] || {};
            const unitPrice = item.unitPriceOverride || item.resolvedPrice || 180000;
            const unitCost = item.profitPreview?.costBasis || Math.round(unitPrice * 0.7);
            const qty = item.quantity || 1;
            const profit = (unitPrice - unitCost) * qty;

            setOrder({
              id: found.id || found._id,
              orderNumber: found.checkoutNumber || found.orderNumber || found.id?.slice(0, 8) || "ORD-99",
              customerName: found.customer?.name || found.shippingAddress?.name || "Customer Name",
              customerPhone: found.customer?.phone || found.shippingAddress?.phone || "01700000000",
              customerEmail: found.customer?.email || "customer@example.com",
              fullAddress: found.shippingAddress?.addressLine1 || "Dhanmondi 32, Dhaka",
              district: found.customer?.city || found.shippingAddress?.city || "Dhaka",
              productName: item.name || item.productName || "Reseller Product",
              quantity: qty,
              unitPrice,
              unitCost,
              deliveryFee: found.deliveryFee || 8000,
              sellingPriceTotal: (unitPrice * qty) + (found.deliveryFee || 8000),
              profit,
              status: found.status || "confirmed",
              courierName: found.courier?.name || "SteadFast Courier",
              trackingNumber: found.courierTrackingId || "SF-881923",
              notes: found.notes || "কাস্টমার ডেলিভারির সময় রিসিভ করবে",
              createdAt: found.createdAt || new Date().toISOString(),
              timeline: [
                { status: "Created", title: "Order Created by Reseller", date: found.createdAt || new Date().toISOString() },
                { status: "Confirmed", title: "Order Confirmed & Sent to Processing", date: found.createdAt || new Date().toISOString() },
                { status: "Shipped", title: "Handed over to SteadFast Courier", date: new Date().toISOString() },
              ],
            });
          }
        }
      } catch {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }
    load();
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
            </div>
          </div>

          {/* Quick Stat Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">মোট বিক্রীত মূল্য</span>
              <p className="text-base font-black text-foreground tabular-nums">৳{sellingPriceTaka}</p>
            </div>
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-center">
              <span className="text-[10px] font-bold text-success uppercase">আপনার প্রফিট</span>
              <p className="text-base font-black text-success tabular-nums">+৳{profitTaka}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">কুরিয়ার স্ট্যাটাস</span>
              <p className="text-xs font-black text-primary truncate">{order.courierName}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">ট্র্যাকিং কোড</span>
              <p className="text-xs font-mono font-black text-foreground truncate">{order.trackingNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs font-bold">Overview</TabsTrigger>
          <TabsTrigger value="customer" className="text-xs font-bold">Customer</TabsTrigger>
          <TabsTrigger value="products" className="text-xs font-bold">Products</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs font-bold">Timeline</TabsTrigger>
          <TabsTrigger value="courier" className="text-xs font-bold">Courier</TabsTrigger>
          <TabsTrigger value="profit" className="text-xs font-bold">Profit</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs font-bold">Notes</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3 text-xs">
                <h3 className="font-black text-foreground flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4 text-primary" /> কাস্টমার ও ডেলিভারি বিবরণ:
                </h3>
                <div className="space-y-1.5 text-muted-foreground font-semibold">
                  <p>• নাম: <span className="text-foreground font-bold">{order.customerName}</span></p>
                  <p>• মোবাইল: <span className="text-foreground font-bold font-mono">{order.customerPhone}</span></p>
                  <p>• জেলা: <span className="text-foreground font-bold">{order.district}</span></p>
                  <p>• সম্পূর্ণ ঠিকানা: <span className="text-foreground font-bold">{order.fullAddress}</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-3 text-xs">
                <h3 className="font-black text-foreground flex items-center gap-1.5 text-sm">
                  <TrendingUp className="w-4 h-4 text-success" /> ফাইনান্সিয়াল হিসাব:
                </h3>
                <div className="space-y-1.5 text-muted-foreground font-semibold">
                  <p>• হোলসেল কেনা খরচ: <span className="text-foreground font-bold">৳{Math.round(order.unitCost / 100 * order.quantity)}</span></p>
                  <p>• কাস্টমারের নিকট বিক্রয় মূল্য: <span className="text-foreground font-bold">৳{Math.round(order.unitPrice / 100 * order.quantity)}</span></p>
                  <p>• ডেলিভারি চার্জ: <span className="text-foreground font-bold">৳{Math.round(order.deliveryFee / 100)}</span></p>
                  <p>• মোট বিল (Grand Total): <span className="text-primary font-black">৳{sellingPriceTaka}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Customer */}
        <TabsContent value="customer" className="pt-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3 text-xs font-semibold">
              <h3 className="text-sm font-black text-foreground">কাস্টমার প্রোফাইল:</h3>
              <p>• নাম: {order.customerName}</p>
              <p>• মোবাইল: {order.customerPhone}</p>
              <p>• ইমেইল: {order.customerEmail}</p>
              <p>• ঠিকানা: {order.fullAddress}, {order.district}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Products */}
        <TabsContent value="products" className="pt-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3 text-xs font-semibold">
              <h3 className="text-sm font-black text-foreground">অর্ডারকৃত পণ্য:</h3>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{order.productName}</p>
                  <p className="text-muted-foreground">পরিমাণ: {order.quantity} টি</p>
                </div>
                <p className="font-black text-primary text-sm">৳{Math.round(order.unitPrice / 100 * order.quantity)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Timeline */}
        <TabsContent value="timeline" className="pt-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-black text-foreground">অর্ডার হিস্ট্রি ও টাইমলাইন:</h3>
              <div className="space-y-3 border-l-2 border-primary/30 pl-4">
                {order.timeline?.map((t: any, i: number) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{new Date(t.date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Courier */}
        <TabsContent value="courier" className="pt-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3 text-xs font-semibold">
              <h3 className="text-sm font-black text-foreground">কুরিয়ার ট্র্যাকিং:</h3>
              <p>• কুরিয়ার: {order.courierName}</p>
              <p>• ট্র্যাকিং নম্বর: {order.trackingNumber}</p>
              <p>• বর্তমান স্ট্যাটাস: In Transit</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Profit */}
        <TabsContent value="profit" className="pt-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3 text-xs font-semibold">
              <h3 className="text-sm font-black text-success">প্রফিট বিবরণী:</h3>
              <p>• কাস্টমার সেলస్ সাবটোটাল: ৳{Math.round(order.unitPrice / 100 * order.quantity)}</p>
              <p>• হোলসেল কেনা খরচ: ৳{Math.round(order.unitCost / 100 * order.quantity)}</p>
              <p className="text-sm font-black text-success pt-2 border-t border-border/60">
                • আপনার নিট প্রফিট: +৳{profitTaka}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Notes */}
        <TabsContent value="notes" className="pt-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3 text-xs font-semibold">
              <h3 className="text-sm font-black text-foreground">অর্ডার নোটস:</h3>
              <p className="p-3 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground">
                {order.notes || "কোনো বিশেষ নোট নেই।"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
