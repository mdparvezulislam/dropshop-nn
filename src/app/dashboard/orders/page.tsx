"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { getOrderDashboardStatsAction, listOrdersAction, bulkOrderActionAction } from "@/features/order/actions/order-actions";
import { getHumanLabel, type OrderStatus } from "@/features/order/domain/state-machine";
import { toast } from "sonner";
import {
  Search, ShoppingCart, PlusCircle, Printer, RefreshCw,
  PackageCheck, Truck, XCircle, CheckCircle, Clock, Ban,
  Eye, FileText, Download, CheckSquare, AlertTriangle,
} from "lucide-react";

export default function OrderDashboardPage(): React.ReactElement {
  const router = useRouter();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("");
  const [districtFilter, setDistrictFilter] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        listOrdersAction({
          page,
          limit: 20,
          status: statusFilter === "all" ? undefined : statusFilter,
          type: typeFilter || undefined,
          search: search || undefined,
          dateFilter: dateFilter || undefined,
          district: districtFilter || undefined,
        }),
        getOrderDashboardStatsAction(),
      ]);
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data.items as any[]);
        setTotalPages(ordersRes.data.totalPages);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      toast.error("অর্ডার লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search, dateFilter, districtFilter]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) { toast.error("কমপক্ষে একটি অর্ডার নির্বাচন করুন"); return; }
    const res = await bulkOrderActionAction({ orderIds: Array.from(selectedIds), action: action as any });
    if (res.success) {
      toast.success(`${res.data?.successCount}টি অর্ডার আপডেট হয়েছে`);
      setSelectedIds(new Set());
      loadData();
    } else {
      toast.error(res.error || "ব্যাচ অপারেশন ব্যর্থ হয়েছে");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const formatCurrency = (amount: number) =>
    `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": case "delivered": return "success" as const;
      case "pending": case "draft": return "warning" as const;
      case "cancelled": case "failed": return "destructive" as const;
      default: return "default" as const;
    }
  };

  const STAT_CARDS = [
    { key: "today", label: "আজকের অর্ডার", labelEn: "Today's Orders", color: "text-blue-400", icon: ShoppingCart },
    { key: "pending", label: "পেন্ডিং", labelEn: "Pending", color: "text-amber-400", icon: Clock },
    { key: "confirmed", label: "কনফার্মড", labelEn: "Confirmed", color: "text-emerald-400", icon: CheckCircle },
    { key: "packed", label: "প্যাক করা হয়েছে", labelEn: "Packed", color: "text-indigo-400", icon: PackageCheck },
    { key: "courier_assigned", label: "কুরিয়ার বুক করা হয়েছে", labelEn: "Courier Booked", color: "text-violet-400", icon: Truck },
    { key: "delivered", label: "ডেলিভারি হয়েছে", labelEn: "Delivered", color: "text-emerald-500", icon: CheckSquare },
    { key: "cancelled", label: "বাতিল হয়েছে", labelEn: "Cancelled", color: "text-rose-400", icon: XCircle },
    { key: "total_cod", label: "COD বাকি", labelEn: "COD Due", color: "text-amber-500", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              অর্ডার ব্যবস্থাপনা <span className="text-muted-foreground text-lg font-normal">Order Operations</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              পর্যবেক্ষণ এবং অর্ডার লাইফসাইকেল ম্যানেজমেন্ট
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/orders/create">
              <Button size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" /> নতুন অর্ডার
              </Button>
            </Link>
            <Link href="/dashboard/orders/print">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Printer className="h-4 w-4" /> Print Center
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-lg font-bold text-foreground">{stats[card.key] ?? 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
                <p className="text-[9px] text-muted-foreground/60">{card.labelEn}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="অর্ডার নং, গ্রাহক, ফোন, ট্র্যাকিং অনুসন্ধান..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="all">সব স্ট্যাটাস (All)</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="ready_for_dispatch">Ready for Dispatch</option>
              <option value="courier_assigned">Courier Assigned</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">সব ধরন (All Types)</option>
              <option value="customer">Retail</option>
              <option value="reseller">Reseller</option>
              <option value="wholesaler">Wholesale</option>
            </select>
            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">সব সময় (All Time)</option>
              <option value="today">আজ (Today)</option>
              <option value="yesterday">গতকাল (Yesterday)</option>
              <option value="this_week">এই সপ্তাহ (This Week)</option>
              <option value="this_month">এই মাস (This Month)</option>
            </select>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg border border-border/50">
              <span className="text-sm text-muted-foreground mr-2">
                {selectedIds.size}টি নির্বাচিত
              </span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("confirm")}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("pack")}>
                <PackageCheck className="h-3.5 w-3.5 mr-1" /> Pack
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("print_invoice")}>
                <FileText className="h-3.5 w-3.5 mr-1" /> Invoice
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("print_packing_slip")}>
                <Printer className="h-3.5 w-3.5 mr-1" /> Packing Slip
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("cancel")}>
                <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left">
                  <input type="checkbox" checked={selectedIds.size === orders.length && orders.length > 0}
                    onChange={toggleSelectAll} className="rounded border-border" />
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">অর্ডার</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">গ্রাহক</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">পণ্য</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">মোট</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">লাভ</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">লজিস্টিক্স</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  এখনো কোনো অর্ডার পাওয়া যায়নি
                </td></tr>
              ) : orders.map((item) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)} className="rounded border-border" />
                  </td>
                  <td className="p-3">
                    <button onClick={() => router.push(`/dashboard/orders/${item.id}`)}
                      className="font-semibold text-foreground hover:text-primary text-sm">
                      {item.orderNumber}
                    </button>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-foreground">{item.customer.name}</div>
                    <div className="text-xs text-muted-foreground">{item.customer.phone}</div>
                  </td>
                  <td className="p-3 max-w-[180px] truncate text-sm text-muted-foreground">
                    {item.items?.map((i: any) => i.productName).join(", ") || "—"}
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(item.pricing?.grandTotal ?? 0)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="text-sm font-medium text-emerald-400">
                      {formatCurrency(item.profitPreview?.totalProfit ?? 0)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {item.profitPreview?.averageMargin ?? 0}%
                    </div>
                  </td>
                  <td className="p-3">
                    {item.shippingInfo ? (
                      <div>
                        <div className="text-xs text-foreground">{item.shippingInfo.courierName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {item.shippingInfo.trackingNumber}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">নির্ধারিত হয়নি</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusVariant(item.status)}>
                      {getHumanLabel(item.status as OrderStatus)}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => router.push(`/dashboard/orders/${item.id}`)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent">
                        <Eye className="h-4 w-4" />
                      </button>
                      {["pending", "draft", "confirmed"].includes(item.status) && (
                        <button onClick={async () => {
                          const res = await bulkOrderActionAction({
                            orderIds: [item.id], action: "cancel",
                          });
                          if (res.success) { toast.success("বাতিল করা হয়েছে"); loadData(); }
                        }}
                          className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10">
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">
              পৃষ্ঠা {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}>পূর্ববর্তী</Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}>পরবর্তী</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
