"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateOrderPaymentAction } from "../actions/order-actions";
import { getOrderPaymentDetails, formatAmount } from "../utils/payment-utils";
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calculator,
  RefreshCw,
} from "lucide-react";

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess?: () => void;
}

export function EditPaymentModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: EditPaymentModalProps): React.ReactElement | null {
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "partial" | "paid" | "refunded">("unpaid");
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (order) {
      const payDetails = getOrderPaymentDetails(order);
      setPaymentMethod((order.shipping?.paymentMethod || "cod").toLowerCase());
      setPaymentStatus(payDetails.paymentStatus);
      setAdvancePaid(payDetails.advancePaid);
      setDeliveryCharge(order.shipping?.deliveryCharge ?? order.shippingCost ?? 60);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const grandTotal = order.pricing?.grandTotal || order.total || 0;

  // Real-time calculation
  const currentAdvance = Math.max(0, Number(advancePaid || 0));
  const calculatedDue = paymentStatus === "paid" ? 0 : Math.max(0, grandTotal - currentAdvance);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateOrderPaymentAction({
        orderId,
        paymentStatus,
        advancePaid: currentAdvance,
        paymentMethod,
        deliveryCharge: Number(deliveryCharge || 0),
      });

      if (res.success) {
        toast.success(`অর্ডার #${orderNumber} এর পেমেন্ট তথ্য সফলভাবে আপডেটেড হয়েছে!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "পেমেন্ট আপডেট করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold font-heading">
                Edit COD & Payment Details — {orderNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update advance payment, COD due balance, and payment status
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs py-2">
          {/* Total & Realtime Due Preview Banner */}
          <div className="rounded-2xl bg-muted/40 p-4 border border-border/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Grand Total:</span>
              <span className="font-mono font-black text-foreground text-sm">
                ৳ {formatAmount(grandTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Advance Received:</span>
              <span className="font-mono font-bold text-emerald-600">
                ৳ {formatAmount(currentAdvance)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-border/60 pt-2">
              <span className="font-bold text-foreground">Calculated COD Due:</span>
              <span className={`font-mono font-black text-sm ${calculatedDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                ৳ {formatAmount(calculatedDue)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bkash">bKash Mobile Banking</option>
              <option value="nagad">Nagad Mobile Banking</option>
              <option value="rocket">Rocket Mobile Banking</option>
              <option value="bank">Bank Wire Transfer</option>
              <option value="card">Credit / Debit Card</option>
            </select>
          </div>

          {/* Payment Status Selection */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Payment Status</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "unpaid", label: "Unpaid / COD Due", cls: "border-rose-200 text-rose-800 bg-rose-50" },
                { key: "partial", label: "Partial Paid (Advance)", cls: "border-amber-200 text-amber-800 bg-amber-50" },
                { key: "paid", label: "Paid Full", cls: "border-emerald-200 text-emerald-800 bg-emerald-50" },
                { key: "refunded", label: "Refunded", cls: "border-slate-200 text-slate-800 bg-slate-50" },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setPaymentStatus(st.key as any)}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    paymentStatus === st.key
                      ? "ring-2 ring-amber-500 font-black shadow-xs " + st.cls
                      : "border-border text-muted-foreground bg-card hover:border-slate-300"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advance Amount Paid */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">
              Advance Paid Amount (৳)
            </label>
            <Input
              type="number"
              min={0}
              max={grandTotal}
              value={advancePaid}
              onChange={(e) => setAdvancePaid(Number(e.target.value))}
              placeholder="e.g. 500"
              className="h-10 text-xs font-mono font-bold"
            />
            <p className="text-[11px] text-muted-foreground">
              কাস্টমার যদি ২০০ বা ৫০০ টাকা অ্যাডভান্স পেমেন্ট করে থাকেন, এখানে বসান।
            </p>
          </div>

          {/* Delivery Charge */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">
              Delivery Charge (৳)
            </label>
            <Input
              type="number"
              min={0}
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(Number(e.target.value))}
              placeholder="e.g. 60 or 120"
              className="h-10 text-xs font-mono font-bold"
            />
            <p className="text-[11px] text-muted-foreground">
              ঢাকার ভেতরে সাধারণত ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা ডেলিভারি চার্জ।
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-border/60 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="h-10 text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Save Payment Details
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditPaymentModal;
