"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { printOrderInvoice, printShippingLabel } from "../utils/print-utils";
import {
  Printer,
  FileCheck,
  Truck,
  DollarSign,
  MapPin,
  Eye,
  XCircle,
  Phone,
  MessageCircle,
  Copy,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

interface OrderQuickActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSelectAction: (action: string, order: any) => void;
}

export function OrderQuickActionMenu({
  isOpen,
  onClose,
  order,
  onSelectAction,
}: OrderQuickActionMenuProps): React.ReactElement | null {
  if (!isOpen || !order) return null;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const phone = order.customer?.phone || order.shipping?.phone || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-5">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="text-base font-extrabold font-heading text-foreground">
            Quick Actions — {orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 text-xs py-2">
          {/* View Details */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction("view", order);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-amber-500 hover:bg-amber-500/10 transition-colors text-left font-bold text-foreground"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm">View Full Order Details</p>
              <p className="text-[11px] text-muted-foreground">Open multi-tab drawer & customer signals</p>
            </div>
          </button>

          {/* Full Edit Order */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction("edit_order", order);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-amber-500 hover:bg-amber-500/10 transition-colors text-left font-bold text-foreground"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Edit2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Full Edit Order (অর্ডার এডিট)</p>
              <p className="text-[11px] text-muted-foreground">Modify products, pricing, delivery fee & advance paid</p>
            </div>
          </button>

          {/* Edit Address */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction("edit_address", order);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-blue-500 hover:bg-blue-500/10 transition-colors text-left font-bold text-foreground"
          >
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Edit Shipping Address & Contact</p>
              <p className="text-[11px] text-muted-foreground">Update customer name, phone, district, address</p>
            </div>
          </button>

          {/* Edit Payment */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction("edit_payment", order);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors text-left font-bold text-foreground"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Edit Payment & COD Details</p>
              <p className="text-[11px] text-muted-foreground">Set advance payment amount & payment status</p>
            </div>
          </button>

          {/* Book Pickup */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction("pickup", order);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-purple-500 hover:bg-purple-500/10 transition-colors text-left font-bold text-foreground"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Book Courier Pickup</p>
              <p className="text-[11px] text-muted-foreground">Assign Pathao, Steadfast, RedX, Paperfly</p>
            </div>
          </button>

          {/* Print Invoice */}
          <button
            type="button"
            onClick={() => {
              onClose();
              printOrderInvoice(order);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-slate-400 hover:bg-muted transition-colors text-left font-bold text-foreground"
          >
            <div className="p-2 rounded-xl bg-slate-200 text-slate-800">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Print Tax Invoice</p>
              <p className="text-[11px] text-muted-foreground">Generate printable invoice popup window</p>
            </div>
          </button>

          {/* Print Shipping Label */}
          <button
            type="button"
            onClick={() => {
              onClose();
              printShippingLabel(order);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors text-left font-bold text-foreground"
          >
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Print 4"x6" Shipping Label (Courier Slip)</p>
              <p className="text-[11px] text-muted-foreground">Generate parcel shipping sticker label</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OrderQuickActionMenu;
