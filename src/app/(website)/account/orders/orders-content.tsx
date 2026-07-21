"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
  processing: "bg-violet-500/10 text-violet-600 border-violet-200",
  shipped: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  cancelled: "bg-rose-500/10 text-rose-600 border-rose-200",
};

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: Date;
}

export function OrdersPageContent({
  initialOrders,
  initialTotal,
}: {
  initialOrders: OrderItem[];
  initialTotal: number;
}) {
  const [orders] = useState(initialOrders);
  const [total] = useState(initialTotal);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total > 0 ? `${total} order${total !== 1 ? "s" : ""} total` : "No orders yet."}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Package className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Link href="/">
              <Button variant="outline" size="sm" className="mt-3">Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{formatDate(order.createdAt)}</span>
                        <span>·</span>
                        <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        STATUS_COLORS[order.status] || "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </Badge>
                    <span className="text-sm font-semibold">৳{order.total.toLocaleString()}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                {i < orders.length - 1 && <Separator />}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
