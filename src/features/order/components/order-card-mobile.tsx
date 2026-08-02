"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Phone,
  MessageCircle,
  Clock,
  Printer,
  Truck,
  MoreVertical,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Plus,
  Eye,
  FileCheck,
  Lock,
  Edit2,
  Check,
  Package,
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

function ProductThumbnail({ src, name }: { src?: string; name?: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || error) {
    return (
      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Package className="h-5 w-5 text-amber-600" />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border overflow-hidden shrink-0 relative flex items-center justify-center">
      <img
        src={src}
        alt={name || "Product"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {!loaded && <Package className="h-5 w-5 text-muted-foreground animate-pulse absolute" />}
    </div>
  );
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
  const resellerShopName =
    order.resellerShopName ||
    order.resellerStoreName ||
    order.storeName ||
    order.shopName ||
    (order.resellerName ? `${order.resellerName} Store` : undefined);
  const isResellerOrder = order.type === "reseller" || Boolean(order.resellerId) || Boolean(resellerShopName);
  const riskScore = order.riskScore ?? 76;
  const isHighRisk = riskScore < 50;

  const hasCourierSlip = Boolean(order.courierInfo?.trackingNumber || order.pickupRequested);
  
  const rawDeliveryCharge = order.shipping?.deliveryCharge ?? order.shippingCost ?? 120;
  const deliveryCharge = rawDeliveryCharge > 5000 ? Math.round(rawDeliveryCharge / 100) : rawDeliveryCharge;

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
      className={`group relative rounded-3xl border transition-all duration-200 bg-card p-4 shadow-xs hover:shadow-md cursor-pointer ${
        isSelected ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5" : "border-border/80 hover:border-slate-300"
      }`}
    >
      {/* 1. TOP HEADER ROW */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(orderId);
            }}
            className="flex items-center justify-center shrink-0"
          >
            <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(orderId)} className="rounded-full h-5 w-5" />
          </div>

          <span className="text-sm font-black font-mono tracking-tight text-foreground">
            {orderNumber}
          </span>

          <span
            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
              statusColorMap[status] || "bg-slate-100 text-slate-800"
            }`}
          >
            {getHumanLabel(status)}
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border ${
              isHighRisk
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isHighRisk ? <AlertTriangle className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
            {riskScore}%
          </span>

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
          {/* Customer Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-foreground tracking-tight truncate">
                {customerName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(customerName, "Customer Name");
                }}
                className="p-1 text-slate-400 hover:text-foreground shrink-0"
                title="Copy Name"
              >
                {copiedField === "Customer Name" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {phone && (
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <span>{phone}</span>
                <a href={`tel:${phone}`} title="Call Customer" className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
                  <Phone className="h-3 w-3" />
                </a>
                <a
                  href={`https://wa.me/${formattedPhoneForWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  className="p-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                >
                  <MessageCircle className="h-3 w-3" />
                </a>
              </div>
            )}

            <p className="text-xs text-muted-foreground truncate">{address}</p>

            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1 pt-0.5">
              <Clock className="h-3 w-3" />
              {formatExactTime(order.createdAt)}
            </p>
          </div>

          {/* Pricing Totals */}
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
            <div className="flex justify-end gap-1">
              <span className="inline-flex px-2 py-0.2 text-[10px] font-bold rounded bg-slate-100 text-slate-800 border border-slate-200">
                {payDetails.paymentMethodLabel}
              </span>
              <span className={`inline-flex px-2 py-0.2 text-[10px] font-extrabold rounded border ${
                isResellerOrder
                  ? "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800"
                  : (channelBadgeMap[channel]?.cls || "bg-slate-100 text-slate-700")
              }`}>
                {isResellerOrder ? (resellerShopName || "Reseller Store") : (channelBadgeMap[channel]?.label || channel)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT ITEMS SUMMARY */}
        {items.length > 0 && (
          <div className="rounded-2xl bg-muted/40 p-3 space-y-2 border border-border/60">
            {items.map((item: any, idx: number) => {
              const rawPrice = item.unitSellingPrice ?? item.unitPrice ?? item.price ?? 0;
              const unitPrice = rawPrice > 5000 ? Math.round(rawPrice / 100) : rawPrice;
              const quantity = item.quantity || 1;
              const subtotal = unitPrice * quantity;
              const productName = item.productName || item.name || "Product Item";
              const productImg = item.imageUrl || item.image || item.thumbnail || "";

              return (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ProductThumbnail src={productImg} name={productName} />
                    <div className="overflow-hidden">
                      <p className="font-bold text-foreground line-clamp-1">{productName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        (৳{formatAmount(unitPrice)} × {quantity})
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-black text-foreground shrink-0 text-sm">
                    ৳{formatAmount(subtotal)}
                  </span>
                </div>
              );
            })}

            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5 font-medium">
              <span>Delivery Charge:</span>
              <span className="font-mono font-bold text-foreground">
                ৳{formatAmount(deliveryCharge)}
              </span>
            </div>
          </div>
        )}

        {/* 4. CLEAN TOUCH ACTION STRIP */}
        <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            onClick={() => onQuickAction("steadfast_pickup", order)}
            className="flex-1 h-8 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 border-0 shadow-2xs gap-1"
          >
            <Truck className="h-3.5 w-3.5 text-slate-950" /> ⚡ Steadfast Pickup
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (hasCourierSlip) {
                printShippingLabel(order);
              } else {
                toast.info("Courier slip will generate after Steadfast pickup confirmation");
              }
            }}
            className={`h-8 px-2.5 text-xs font-bold border shrink-0 ${
              hasCourierSlip ? "text-emerald-700 bg-emerald-50 border-emerald-300" : "text-slate-500 border-slate-200"
            }`}
            title="Shipping Slip"
          >
            {hasCourierSlip ? <FileCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Lock className="h-3.5 w-3.5" />}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => printOrderInvoice(order)}
            className="h-8 px-2.5 text-xs font-bold border border-slate-200 shrink-0"
            title="Print Tax Invoice"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(orderId)}
            className="h-8 px-2.5 text-xs font-bold border border-slate-200 shrink-0"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderCardMobile;
