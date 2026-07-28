"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderAction } from "@/features/order/actions/order-actions";
import { OrderDetailsDrawer } from "@/features/order/components/order-details-drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrderAction({ orderId });
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        toast.error(res.error || "অর্ডার বিবরণ পাওয়া যায়নি");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/dashboard/orders");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/orders")}
          className="h-9 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Orders
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
          <p className="font-bold">অর্ডার ডেটা লোড হচ্ছে...</p>
        </div>
      ) : (
        order && (
          <OrderDetailsDrawer
            isOpen={isOpen}
            onClose={handleClose}
            order={order}
            onOrderUpdated={loadOrder}
          />
        )
      )}
    </div>
  );
}
