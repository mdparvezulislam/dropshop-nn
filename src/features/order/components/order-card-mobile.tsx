"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Printer,
  FileText,
  Truck,
  MoreVertical,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Copy,
  Plus,
  Eye,
  FileCheck,
  Lock,
  Edit2,
  Check,
} from "lucide-react";
import { getHumanLabel, type OrderStatus } from "../domain/state-machine";
import { getOrderPaymentDetails, formatAmount } from "../utils/payment-utils";
import { printOrderInvoice, printShippingLabel } from "../utils/print-utils";

interface OrderCardMobileProps {
  order: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetails: (id: string) => void;
  onQuickAction: (action: string, order: any) => void;
}

export function OrderCardMobile({
  order,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onQuickAction,
}: OrderCardMobileProps): React.ReactElement {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const status: OrderStatus = order.status || "pending";
  const customerName = order.customer?.name || "GUEST CUSTOMER";
  const phone = order.customer?.phone || order.shipping?.phone || "";
  const address =
    order.shipping?.address ||
    `${order.shipping?.district || ""}, ${order.shipping?.division || ""}`.trim() ||
    "N/A";
  
  const payDetails = getOrderPaymentDetails(order);
  const items = order.items || order.pricing?.items || [];
  const channel = order.source || order.type || "website";
  const riskScore = order.riskScore ?? 76;
  const isHighRisk = riskScore < 50;

  // Courier Slip / Shipping Label Fetched status check
  const hasCourierSlip = Boolean(order.courierInfo?.trackingNumber || order.pickupRequested);
  const deliveryCharge = order.shipping?.deliveryCharge ?? order.shippingCost ?? 120;

  const statusColorMap: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900 border-amber-300",
    confirmed: "bg-blue-100 text-blue-900 border-blue-300",
    processing: "bg-indigo-100 text-indigo-900 border-indigo-300",
    shipped: "bg-purple-100 text-purple-900 border-purple-300",
    delivered: "bg-emerald-100 text-emerald-900 border-emerald-300",
    cancelled: "bg-rose-100 text-rose-900 border-rose-300",
    returned: "bg-red-100 text-red-900 border-red-300",
  };

  const channelBadgeMap: Record<string, { label: string; cls: string }> = {
    facebook: { label: "Facebook Ads", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    website: { label: "Website", cls: "bg-slate-50 text-slate-700 border-slate-200" },
    reseller: { label: "Reseller Hub", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    wholesaler: { label: "B2B Wholesale", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  };

  const formattedPhoneForWhatsapp = phone.replace(/[^0-9]/g, "").replace(/^0/, "880");

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format exact timestamp e.g. "Today 1:54 PM" or "Jul 28, 1:54 PM"
  const formatExactTime = (dateStr?: string) => {
    if (!dateStr) return "Today 1:54 PM";
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return isToday ? `Today ${timeStr}` : `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${timeStr}`;
  };

  return (
    <div
      onClick={() => onViewDetails(orderId)}
      className={`group relative rounded-3xl border transition-all duration-200 bg-card p-4 shadow-sm hover:shadow-md cursor-pointer ${
        isSelected ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5" : "border-border/80 hover:border-slate-300"
      }`}
    >
      {/* 1. TOP HEADER ROW (Matching Screenshot EXACTLY) */}
      <div className="flex items-center justify-between gap-1.5 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Circular Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(orderId);
            }}
            className="flex items-center justify-center shrink-0"
          >
            <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(orderId)} className="rounded-full h-5 w-5" />
          </div>

          {/* Order ID */}
          <span className="text-sm font-black font-mono tracking-tight text-foreground shrink-0">
            {orderNumber}
          </span>

          {/* Status Chip */}
          <span
            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
              statusColorMap[status] || "bg-slate-100 text-slate-800"
            }`}
          >
            {getHumanLabel(status)}
          </span>

          {/* Risk Score Chip */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border shrink-0 ${
              isHighRisk
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {riskScore}%
          </span>
        </div>

        {/* Quick Icon Actions Bar (Screenshot inspired) */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Quick Green Phone Call */}
          {phone && (
            <a
              href={`tel:${phone}`}
              title="Quick Call"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors border border-emerald-300"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}

          {/* View Details Eye Icon */}
          <button
            type="button"
            onClick={() => onViewDetails(orderId)}
            title="View Details"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Download Invoice Printer Icon */}
          <button
            type="button"
            onClick={() => printOrderInvoice(order)}
            title="Print / Download Tax Invoice"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>

          {/* Courier Slip / Shipping Label Button (Lock vs Green Download) */}
          <button
            type="button"
            onClick={() => {
              if (hasCourierSlip) {
                printShippingLabel(order);
              } else {
                toast.error("Courier slip not fetched or not approved yet!");
              }
            }}
            title={hasCourierSlip ? "Download Shipping Label / Courier Slip" : "Courier Slip Not Fetched / Not Approved"}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors border ${
              hasCourierSlip
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
          >
            {hasCourierSlip ? <FileCheck className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          </button>

          {/* Three Dots Menu */}
          <button
            type="button"
            onClick={() => onQuickAction("menu", order)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. CUSTOMER & PRICING MIDDLE SECTION */}
      <div className="py-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Customer Info & Contact */}
          <div className="space-y-1.5 flex-1">
            {/* Customer Name & Copy & Order Count Badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-foreground tracking-tight">
                {customerName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(customerName, "Customer Name");
                }}
                className="p-1 text-slate-400 hover:text-foreground"
                title="Copy Name"
              >
                {copiedField === "Customer Name" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              {/* Order Count / Risk Alert badge (e.g. ⚠ 2) */}
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full border border-rose-200">
                <AlertTriangle className="h-3 w-3 text-rose-600" />
                {order.customerOrderCount || 2}
              </span>
            </div>

            {/* Phone & Call & Whatsapp & Copy */}
            {phone && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <span>{phone}</span>
                <a href={`tel:${phone}`} title="Call" className="p-0.5 text-emerald-700 hover:text-emerald-800">
                  <Phone className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`https://wa.me/${formattedPhoneForWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  className="p-0.5 text-green-700 hover:text-green-800"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(phone, "Phone Number")}
                  className="p-0.5 text-slate-400 hover:text-foreground"
                  title="Copy Phone"
                >
                  {copiedField === "Phone Number" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {/* Address & Copy Address */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
              <span className="line-clamp-1">{address}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(address, "Address")}
                className="p-0.5 text-slate-400 hover:text-foreground shrink-0"
                title="Copy Address"
              >
                {copiedField === "Address" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Inline + Add note Button */}
            <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
              <button
                type="button"
                onClick={() => onQuickAction("notes", order)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-amber-600 bg-muted/40 hover:bg-muted px-2 py-0.5 rounded-lg border border-border/60 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add note
              </button>
            </div>

            {/* Exact Timestamp */}
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1 pt-1">
              <Clock className="h-3 w-3" />
              {formatExactTime(order.createdAt)}
            </p>
          </div>

          {/* Right: Grand Total, Due Amount, COD, Channel */}
          <div className="text-right shrink-0 font-mono space-y-1" onClick={(e) => e.stopPropagation()}>
            <div className="text-xl font-black tracking-tight text-foreground">
              ৳{formatAmount(payDetails.grandTotal)}
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className={payDetails.dueCls}>{payDetails.dueLabel}</span>
              <button
                type="button"
                onClick={() => onQuickAction("edit_payment", order)}
                title="Edit Payment / COD"
                className="p-0.5 text-slate-400 hover:text-amber-500"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
            <div>
              <span className="inline-flex px-2 py-0.2 text-[10px] font-bold rounded bg-slate-100 text-slate-800 border border-slate-200">
                {payDetails.paymentMethodLabel}
              </span>
            </div>
            <div>
              <span className={`inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${channelBadgeMap[channel]?.cls || "bg-slate-100 text-slate-700"}`}>
                {channelBadgeMap[channel]?.label || channel}
              </span>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT ITEMS SUMMARY LIST WITH THUMBNAIL (Screenshot inspired) */}
        {items.length > 0 && (
          <div className="rounded-2xl bg-muted/40 p-3 space-y-2 border border-border/60">
            {items.map((item: any, idx: number) => {
              const unitPrice = item.unitSellingPrice || item.unitPrice || 0;
              const subtotal = unitPrice * item.quantity;
              const productName = item.productName || item.name || "Product Item";
              const productImg = item.imageUrl || item.image || "/placeholder.png";

              return (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {/* Thumbnail */}
                    <div className="h-9 w-9 rounded-lg bg-slate-200 border border-border overflow-hidden shrink-0 relative">
                      <Image
                        src={productImg}
                        alt={productName}
                        fill
                        className="object-cover"
                        sizes="36px"
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-foreground line-clamp-1">{productName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        (৳{formatAmount(unitPrice)} × {item.quantity})
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-black text-foreground shrink-0 text-sm">
                    ৳{formatAmount(subtotal)}
                  </span>
                </div>
              );
            })}

            {/* Delivery Charge Breakdown */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5 font-medium">
              <span>Delivery Charge:</span>
              <span className="font-mono font-bold text-foreground">
                ৳{formatAmount(deliveryCharge)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderCardMobile;
