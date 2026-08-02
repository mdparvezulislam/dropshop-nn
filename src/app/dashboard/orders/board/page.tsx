"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatusAction, listOrdersAction } from "@/features/order/actions/order-actions";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ShoppingCart, RefreshCw, Truck, CheckCircle2, Store, Eye, Package } from "lucide-react";
import {
  getHumanLabel,
  getAllowedTransitions,
  type OrderStatus,
} from "@/features/order/domain/state-machine";
import { formatAmount } from "@/features/order/utils/payment-utils";
import { Spinner } from "@/components/ui/spinner";
import { OrderDetailsDrawer } from "@/features/order/components/order-details-drawer";

const BOARD_COLUMNS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "pickup_requested",
  "shipped",
  "delivered",
];

export default function OrderBoardPage(): React.ReactElement {
  const { data: session } = useSession() as any;
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = React.useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrdersAction({ page: 1, limit: 100, status: "all" });
      if (res.success && res.data?.items) {
        setOrders(res.data.items);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransition = async (id: string, toStatus: OrderStatus) => {
    setMutatingId(id);
    try {
      const res = await updateOrderStatusAction({
        orderId: id,
        toStatus,
        reason: "Transitioned from order status board view",
        actorId: session?.user?.id || "system",
      });
      if (res.success) {
        setOrders((prev) => prev.map((o) => ((o.id || o._id) === id ? { ...o, status: toStatus } : o)));
        toast.success(`Moved order to ${getHumanLabel(toStatus)}`);
      } else {
        toast.error(res.error || "Transition blocked by state machine");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to transition status");
    } finally {
      setMutatingId(null);
    }
  };

  const getOrdersByColumn = (col: OrderStatus) => {
    return orders.filter((o) => (o.status || "pending") === col);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2.5 rounded-2xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
                Order Operational Board
              </h1>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
                KANBAN PIPELINE
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Visual fulfillment pipeline tracking orders from Pending confirmation to Courier delivery.
            </p>
          </div>
        </div>

        <Button
          onClick={loadData}
          disabled={loading}
          variant="outline"
          size="sm"
          className="h-9 text-xs font-bold gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Board
        </Button>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none items-start">
        {BOARD_COLUMNS.map((col) => {
          const colOrders = getOrdersByColumn(col);

          return (
            <div
              key={col}
              className="w-80 shrink-0 flex flex-col bg-muted/40 rounded-3xl border border-border/80 p-3.5 min-h-[600px] max-h-[80vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xs text-foreground uppercase tracking-wide">
                    {getHumanLabel(col)}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono bg-card text-foreground font-bold">
                    {colOrders.length}
                  </Badge>
                </div>
              </div>

              {/* Column Cards Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-36 border border-dashed border-border/70 rounded-2xl text-muted-foreground text-xs font-medium">
                    No orders in this state
                  </div>
                ) : (
                  colOrders.map((o: any) => {
                    const oId = o.id || o._id;
                    const orderNumber = o.orderNumber || `#${oId.slice(-6)}`;
                    const customerName = o.customer?.name || "Customer";
                    const grandTotal = o.pricing?.grandTotal || 0;
                    const grandTotalTaka = grandTotal > 5000 ? Math.round(grandTotal / 100) : grandTotal;
                    const allowed = getAllowedTransitions(o.status || "pending");
                    const nextOperational = allowed.filter(
                      (t) => col !== t && BOARD_COLUMNS.includes(t as any),
                    );

                    return (
                      <Card
                        key={oId}
                        className="border-border bg-card hover:border-amber-500/50 transition-all p-4 space-y-3 shadow-2xs"
                      >
                        <div className="flex justify-between items-start border-b border-border/60 pb-2">
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForDrawer(o);
                                setIsDrawerOpen(true);
                              }}
                              className="font-extrabold text-amber-600 dark:text-amber-400 hover:underline text-xs truncate block text-left"
                            >
                              {orderNumber}
                            </button>
                            <p className="text-[11px] font-bold text-foreground truncate mt-0.5">{customerName}</p>
                          </div>
                          <span className="text-xs font-mono font-black text-foreground shrink-0">
                            ৳ {formatAmount(grandTotalTaka)}
                          </span>
                        </div>

                        {/* Action Buttons to Transition Status */}
                        {nextOperational.length > 0 && (
                          <div className="pt-1 flex flex-wrap justify-end gap-1.5">
                            {nextOperational.map((nextState) => (
                              <Button
                                key={nextState}
                                size="sm"
                                disabled={mutatingId === oId}
                                onClick={() => handleTransition(oId, nextState as OrderStatus)}
                                className="h-7 px-2.5 text-[10px] font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-1"
                              >
                                Move to {getHumanLabel(nextState as OrderStatus)} <ArrowRight className="h-3 w-3" />
                              </Button>
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

      {/* Order Details Drawer Modal */}
      {selectedOrderForDrawer && (
        <OrderDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedOrderForDrawer(null);
          }}
          order={selectedOrderForDrawer}
          onOrderUpdated={loadData}
        />
      )}
    </div>
  );
}
