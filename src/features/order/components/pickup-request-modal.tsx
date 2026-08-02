"use client";

import React, { useState } from "react";
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
import { assignCourierAction } from "../actions/order-actions";
import {
  Truck,
  Package,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Calendar,
} from "lucide-react";

interface PickupRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess?: () => void;
}

export function PickupRequestModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: PickupRequestModalProps): React.ReactElement | null {
  const [courierProvider, setCourierProvider] = useState<string>("Steadfast Courier");
  const [pickupAddress, setPickupAddress] = useState<string>("Dhaka Central Hub - Tejgaon, Dhaka");
  const [contactName, setContactName] = useState<string>("Operations Desk");
  const [contactPhone, setContactPhone] = useState<string>("+8801700000000");
  const [packageCount, setPackageCount] = useState<number>(1);
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const hasExistingPickup = Boolean(order.courierInfo?.trackingNumber || order.pickupRequested);

  const handleBookPickup = async () => {
    setLoading(true);
    try {
      const generatedTracking = `TRK-${Date.now().toString().slice(-8)}`;
      const res = await assignCourierAction({
        orderId,
        courierId: courierProvider.toLowerCase().replace(/\s+/g, "_"),
        courierName: courierProvider,
        trackingNumber: generatedTracking,
        trackingUrl: `https://courier.example.com/track/${generatedTracking}`,
      });

      if (res.success) {
        toast.success(`${courierProvider} এ পিকআপ রিকোয়েস্ট সফল হয়েছে! Tracking: ${generatedTracking}`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "পিকআপ বুকিং ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPickup = async () => {
    setLoading(true);
    try {
      const res = await assignCourierAction({
        orderId,
        courierId: "",
        courierName: "",
        trackingNumber: "",
        trackingUrl: "",
      });
      if (res.success) {
        toast.success("পিকআপ রিকোয়েস্ট বাতিল করা হয়েছে");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "বাতিল করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold font-heading">
                Courier Pickup Request — {orderNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Book automated merchant pickup for customer delivery
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Existing Pickup Status Warning/Banner */}
        {hasExistingPickup && (
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3.5 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold">Active Pickup Booked: {order.courierInfo?.courierName}</p>
                <p className="font-mono text-[11px] text-blue-700">
                  Tracking #: {order.courierInfo?.trackingNumber}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-blue-300 text-rose-600 hover:bg-rose-50"
              onClick={handleCancelPickup}
              disabled={loading}
            >
              Cancel Pickup
            </Button>
          </div>
        )}

        <div className="space-y-4 text-xs py-2">
          {/* Customer & Destination Summary */}
          <div className="rounded-2xl bg-muted/40 p-3.5 space-y-1 border border-border/60">
            <p className="font-bold text-foreground">
              Customer: {order.customer?.name} ({order.customer?.phone})
            </p>
            <p className="text-muted-foreground flex items-center gap-1 line-clamp-2">
              <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              Destination: {order.shipping?.address || `${order.shipping?.district}, ${order.shipping?.division}`}
            </p>
          </div>

          {/* Courier Partner Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">1. Select Courier Service Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Pathao Express", speed: "Same-Day / 24h", logo: "🚀" },
                { name: "Steadfast Courier", speed: "Nationwide 24-48h", logo: "📦" },
                { name: "RedX Logistics", speed: "Doorstep Pickup", logo: "⚡" },
                { name: "Paperfly Express", speed: "64 Districts COD", logo: "✈️" },
              ].map((c) => (
                <div
                  key={c.name}
                  onClick={() => setCourierProvider(c.name)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                    courierProvider === c.name
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20"
                      : "border-border hover:border-slate-300 bg-card"
                  }`}
                >
                  <span className="text-xl">{c.logo}</span>
                  <div>
                    <p className="font-bold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.speed}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Address & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Merchant Pickup Hub</label>
              <select
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Dhaka Central Hub - Tejgaon, Dhaka">Dhaka Central Hub (Tejgaon)</option>
                <option value="Chattogram Hub - Agrabad, CTG">Chattogram Hub (Agrabad)</option>
                <option value="Uttara Fulfillment Center - Dhaka">Uttara Fulfillment Center</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Contact Person Phone</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          {/* Package Weight & Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Package Count</label>
              <Input
                type="number"
                min={1}
                value={packageCount}
                onChange={(e) => setPackageCount(Number(e.target.value))}
                className="h-10 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Estimated Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                min={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Special Delivery / Pickup Notes</label>
            <Input
              placeholder="e.g. Fragile electronic items, handle with care."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="h-10 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-border/60 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="h-10 text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleBookPickup}
            disabled={loading}
            className="h-10 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Booking...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-1.5" /> Book Pickup Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PickupRequestModal;
