"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateOrderAddressAction } from "../actions/order-actions";
import { MapPin, User, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { SmartAddressPicker } from "@/shared/components/address/smart-address-picker";

interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess?: () => void;
}

export function EditAddressModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: EditAddressModalProps): React.ReactElement | null {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [upazila, setUpazila] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer?.name || order.shipping?.receiverName || "");
      setPhone(order.customer?.phone || order.shipping?.phone || "");
      setDivision(order.shipping?.division || order.shippingAddress?.division || "Dhaka");
      setDistrict(order.shipping?.district || order.shippingAddress?.district || "Dhaka");
      setUpazila(order.shipping?.upazila || order.shippingAddress?.upazila || "");
      setAddress(order.shipping?.address || order.shippingAddress?.address || "");

      const rawNote = order.shipping?.deliveryNote || order.notes || "";
      let userNote = rawNote;
      if (rawNote.includes("userNote:")) {
        const match = rawNote.match(/userNote:([^;]+)/);
        userNote = match ? match[1].trim() : "";
      } else if (rawNote.startsWith("payment:") || rawNote.includes("deliveryCharge:")) {
        userNote = "";
      }
      setDeliveryNote(userNote);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;

  const handleSave = async () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast.error("নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা দেওয়া আবশ্যক!");
      return;
    }

    setLoading(true);
    try {
      const rawNote = order.shipping?.deliveryNote || order.notes || "";
      let finalNotePayload = deliveryNote.trim();
      if (rawNote.startsWith("payment:") || rawNote.includes("deliveryCharge:")) {
        const baseMeta = rawNote.split(";userNote:")[0];
        finalNotePayload = finalNotePayload ? `${baseMeta};userNote:${finalNotePayload}` : baseMeta;
      }

      const res = await updateOrderAddressAction({
        orderId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        division,
        district,
        upazila,
        address: address.trim(),
        deliveryNote: finalNotePayload,
      });

      if (res.success) {
        toast.success(`অর্ডার ${orderNumber} এর কাস্টমার ঠিকানা আপডেটেড হয়েছে!`);
        if (onSuccess) onSuccess();
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "ঠিকানা আপডেট করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold font-heading">
                Edit Customer & Shipping Address — {orderNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update customer receiver name, phone, district, and street address
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 text-xs py-2">
          {/* Receiver Name */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Customer / Receiver Name</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. মুহাম্মাদ আলী"
              className="h-10 text-xs font-semibold"
            />
          </div>

          {/* Receiver Phone */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Contact Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01733514987"
              className="h-10 text-xs font-mono font-bold"
            />
          </div>

          {/* Division & District & Upazila Grid */}
          <div className="col-span-1 sm:col-span-3">
            <SmartAddressPicker
              districtValue={district}
              upazilaValue={upazila}
              onDistrictChange={(newDistrict) => setDistrict(newDistrict)}
              onUpazilaChange={(newUpazila) => setUpazila(newUpazila)}
            />
          </div>

          {/* Street Address */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Full Street Address</label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. বহুতকুল রয়াইল ধামরাই ঢাকা"
              className="min-h-[70px] text-xs font-medium"
            />
          </div>

          {/* Delivery Note */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Delivery Instructions / Note</label>
            <Input
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="e.g. Call before delivery, deliver in afternoon"
              className="h-10 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-border/60 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="h-10 text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="h-10 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Save Address Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditAddressModal;
