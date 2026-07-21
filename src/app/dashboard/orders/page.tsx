"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { listOrdersAction, cancelOrderAction } from "@/features/order/actions/order-actions";
import { toast } from "sonner";
import { Search, ShoppingCart, Eye, Ban, CheckCircle, Copy, KanbanSquare } from "lucide-react";
import { getHumanLabel, type OrderStatus } from "@/features/order/domain/state-machine";

export default function OrdersPage() {
  const { data: session } = useSession() as any;
  const userRole = session?.user?.role || "Admin";
  const isReseller = userRole === "Reseller";

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const res = await listOrdersAction({
          page: 1,
          limit: 50,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search || undefined,
        });
        if (res.success && res.data?.items) {
          setOrders(res.data.items);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Failed to load orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [search, statusFilter]);

  const handleCancel = async (id: string) => {
    try {
      const res = await cancelOrderAction({
        orderId: id,
        reason: "Cancelled from order management console dashboard",
        cancelledBy: session?.user?.id || "system",
      });
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
        toast.success("Order cancelled successfully");
      } else {
        toast.error(res.error || "Failed to cancel order");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard: ${text}`);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "success" as const;
      case "pending":
      case "draft":
        return "warning" as const;
      case "cancelled":
      case "failed":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Order Lifecycle Engine</h1>
          <p className="text-sm text-slate-400">
            {isReseller
              ? "Track your orders, timeline transitions and profit payouts details"
              : "Enterprise Order State Machine and logistics dashboard"}
          </p>
        </div>
        {!isReseller && (
          <Link
            href="/dashboard/orders/board"
            className="flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 transition-colors gap-2"
          >
            <KanbanSquare className="h-4.5 w-4.5" /> Order Kanban Board
          </Link>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShoppingCart className="h-3.5 w-3.5" /> Total Orders
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Fulfilling Active</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">
              {
                orders.filter(
                  (o) => !["completed", "cancelled", "failed", "refunded"].includes(o.status),
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Profit Share</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(
                orders.reduce((acc, curr) => acc + (curr.profitPreview?.totalProfit || 0), 0),
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Terminal Success</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-indigo-400">
              {orders.filter((o) => o.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search order number or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white w-full md:w-44"
          >
            <option value="all">All States</option>
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
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders registered"
            description="Create validation checkouts draft to create your first order."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Order Ref</TableHead>
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Items summary</TableHead>
                  <TableHead className="text-slate-400">Grand Total</TableHead>
                  <TableHead className="text-slate-400">Profit preview</TableHead>
                  <TableHead className="text-slate-400">Logistics / Tracking</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((item) => (
                  <TableRow key={item.id} className="border-slate-800 hover:bg-slate-900/10">
                    <TableCell>
                      <div className="font-semibold text-white inline-flex items-center gap-1.5">
                        {item.orderNumber}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.orderNumber)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-800 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-200">{item.customer.name}</div>
                      <div className="text-xs text-slate-500">{item.customer.phone}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-300">
                      {item.pricing?.items
                        ?.map((it: any) => `${it.productName} (x${it.quantity})`)
                        .join(", ")}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {formatCurrency(item.pricing?.grandTotal)}
                    </TableCell>
                    <TableCell className="text-emerald-400 font-medium">
                      {formatCurrency(item.profitPreview?.totalProfit || 0)}
                    </TableCell>
                    <TableCell>
                      {item.shippingInfo ? (
                        <div>
                          <div className="text-sm text-slate-200">
                            {item.shippingInfo.courierName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            Track: {item.shippingInfo.trackingNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>
                        {getHumanLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/dashboard/orders/${item.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {!isReseller && ["pending", "draft", "confirmed"].includes(item.status) && (
                          <button
                            type="button"
                            onClick={() => handleCancel(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-400 hover:bg-slate-800"
                            title="Cancel Order"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
