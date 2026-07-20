"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { updateOrderStatusAction, listOrdersAction } from "@/features/order/actions/order-actions";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ShoppingCart, RefreshCw } from "lucide-react";
import { getHumanLabel, getAllowedTransitions, type OrderStatus } from "@/features/order/domain/state-machine";

const BOARD_COLUMNS = [
  "pending",
  "confirmed",
  "packed",
  "ready_for_dispatch",
  "courier_assigned",
  "shipped",
  "out_for_delivery",
] as const;

export default function OrderBoardPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listOrdersAction({ page: 1, limit: 100, status: "all" });
      if (res.success && res.data?.items) {
        setOrders(res.data.items);
      } else {
        // Fallback mock values
        setOrders([
          {
            id: "60c72b2f9b1d8e2568cf4001",
            orderNumber: "ORD-928172",
            customer: { name: "Afsana Mimi" },
            pricing: { grandTotal: 250000 },
            status: "confirmed",
          },
          {
            id: "60c72b2f9b1d8e2568cf4002",
            orderNumber: "ORD-123491",
            customer: { name: "Kamal Hossain" },
            pricing: { grandTotal: 84000 },
            status: "pending",
          },
          {
            id: "60c72b2f9b1d8e2568cf4003",
            orderNumber: "ORD-340912",
            customer: { name: "Rashed Khan" },
            pricing: { grandTotal: 154000 },
            status: "packed",
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleTransition = async (id: string, toStatus: OrderStatus) => {
    try {
      const res = await updateOrderStatusAction({
        orderId: id,
        toStatus,
        reason: "Transitioned from order status board view",
        actorId: session?.user?.id || "system",
      });
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: toStatus } : o)));
        toast.success(`Moved order to ${getHumanLabel(toStatus)}`);
      } else {
        toast.error(res.error || "Transition blocked by state machine");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to transition status");
    }
  };

  const getOrdersByColumn = (col: OrderStatus) => {
    return orders.filter((o) => o.status === col);
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Status Board</h1>
            <p className="text-sm text-slate-400">
              Kanban visualization of operational logistics lifecycle
            </p>
          </div>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline" className="h-9 gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {BOARD_COLUMNS.map((col) => {
          const colOrders = getOrdersByColumn(col);
          return (
            <div
              key={col}
              className="w-80 shrink-0 flex flex-col bg-slate-900/40 rounded-xl border border-slate-850 p-3 h-[75vh]"
            >
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm capitalize text-slate-200">
                    {getHumanLabel(col)}
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-slate-950/50 text-[10px] py-0 px-1.5 border-slate-800"
                  >
                    {colOrders.length}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
                    No orders in this state
                  </div>
                ) : (
                  colOrders.map((o) => {
                    const transitions = getAllowedTransitions(o.status);
                    const nextOperational = transitions.filter(
                      (t) => col !== t && BOARD_COLUMNS.includes(t as any),
                    );

                    return (
                      <Card
                        key={o.id}
                        className="border-slate-800 bg-slate-950/75 hover:border-slate-700 transition-all p-3.5 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              href={`/dashboard/orders/${o.id}`}
                              className="font-semibold hover:text-indigo-400 text-sm text-indigo-300"
                            >
                              {o.orderNumber}
                            </Link>
                            <p className="text-xs text-slate-400 mt-0.5">{o.customer?.name}</p>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400">
                            {formatCurrency(o.pricing?.grandTotal)}
                          </span>
                        </div>

                        {nextOperational.length > 0 && (
                          <div className="pt-2 border-t border-slate-900 flex justify-end gap-1.5">
                            {nextOperational.map((nextState) => (
                              <button
                                key={nextState}
                                onClick={() => handleTransition(o.id, nextState)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                              >
                                Move to {getHumanLabel(nextState)}{" "}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
