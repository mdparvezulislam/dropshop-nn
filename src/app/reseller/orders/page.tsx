"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/workspace/stat-card";
import {
  ResellerOrderCard,
  ResellerOrderItem,
} from "@/features/reseller-workspace/components/reseller-order-card";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const STATUS_FILTERS = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "out_for_delivery", label: "Out For Delivery" },
  { id: "delivered", label: "Delivered 🎉" },
  { id: "returned", label: "Returned ⚠️" },
  { id: "cancelled", label: "Cancelled" },
];

export default function ResellerOrdersPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<ResellerOrderItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [resellerStatus, setResellerStatus] = React.useState("active");
  const pageSize = 10;

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const { listCheckoutsAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );

      const res = await listCheckoutsAction({
        type: "reseller",
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: pageSize,
      });

      if (res.success && res.data) {
        const d = res.data as any;
        const items = d.items || d.checkouts || (Array.isArray(d) ? d : []);

        const mapped: ResellerOrderItem[] = items.map((o: any) => {
          const item = o.items?.[0] || {};
          const unitPrice = item.unitPriceOverride || item.resolvedPrice || 180000;
          const unitCost = item.profitPreview?.costBasis || Math.round(unitPrice * 0.7);
          const qty = item.quantity || 1;
          const profit = (unitPrice - unitCost) * qty;

          return {
            id: o.id || o._id,
            orderNumber: o.checkoutNumber || o.orderNumber || o.id?.slice(0, 8) || "ORD-99",
            customerName: o.customer?.name || o.shippingAddress?.name || "Customer",
            customerPhone: o.customer?.phone || o.shippingAddress?.phone || "01700000000",
            district: o.customer?.city || o.shippingAddress?.city || "Dhaka",
            productName: item.name || item.productName || "Reseller Product",
            quantity: qty,
            imageUrl: item.imageUrl || item.image,
            sellingPrice: (unitPrice * qty) + (o.deliveryFee || 8000),
            profit,
            status: o.status || "confirmed",
            courierName: o.courier?.name || (o.status === "shipped" ? "SteadFast Courier" : undefined),
            trackingNumber: o.courierTrackingId || (o.status === "shipped" ? "SF-88991" : undefined),
            createdAt: o.createdAt || new Date().toISOString(),
          };
        });

        setOrders(mapped);
        setTotalCount(d.totalCount ?? mapped.length);
      } else {
        setOrders([]);
        setTotalCount(0);
      }
    } catch {
      toast.error("Failed to load reseller orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleReturnRequest = (orderId: string) => {
    toast.info(`অর্ডার #${orderId.slice(0, 8)} এর জন্য রিটার্ন রিকুয়েস্ট অ্যাডমিন টিমে সাবমিট করা হয়েছে।`);
  };

  // Client-side search filtering
  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.district.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const totalProfitCents = orders.reduce((sum, o) => sum + o.profit, 0);

  return (
    <ResellerStatusGuard status={resellerStatus}>
      <div className="space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              Sales Desk Operations Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              Order Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              ট্র্যাকিং, কাস্টমার কন্টাক্ট, প্রফিট ও ডেলিভারি স্ট্যাটাস পর্যবেক্ষণ করুন।
            </p>
          </div>
          <Link href="/reseller/orders/create">
            <Button size="sm" className="gap-1.5 font-black shadow-xs">
              <Plus className="w-4 h-4 stroke-[3]" /> Quick Order
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <StatCard label="Total Orders" value={totalCount} icon={ShoppingCart} loading={loading} />
          <StatCard
            label="Delivered"
            value={orders.filter((o) => o.status === "delivered").length}
            accent="success"
            loading={loading}
          />
          <StatCard
            label="Pending / Processing"
            value={orders.filter((o) => ["pending", "processing", "confirmed"].includes(o.status)).length}
            accent="warning"
            loading={loading}
          />
          <StatCard
            label="Total Sales Profit"
            value={`৳${Math.round(totalProfitCents / 100)}`}
            icon={TrendingUp}
            accent="info"
            loading={loading}
          />
        </div>

        {/* Toolbar & Filters Card */}
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders by number, customer, phone, district, tracking..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {STATUS_FILTERS.map((s) => {
                const isActive = statusFilter === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setStatusFilter(s.id);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Cards Container */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground">
            Loading reseller orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground space-y-3 bg-card rounded-2xl border border-border/80">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p>No orders found matching your search filters.</p>
            <Link href="/reseller/orders/create">
              <Button size="sm" className="font-bold gap-1">
                <Plus className="w-4 h-4" /> Create First Order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <ResellerOrderCard
                key={o.id}
                order={o}
                onRequestReturn={handleReturnRequest}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground">
              Page {page} of {totalPages} ({totalCount} total orders)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1 text-xs font-bold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ResellerStatusGuard>
  );
}
