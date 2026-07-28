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
  Eye,
  DollarSign,
  Edit2,
  Copy,
  Check,
  FileCheck,
  Lock,
} from "lucide-react";
import { getHumanLabel, type OrderStatus } from "../domain/state-machine";
import { getOrderPaymentDetails, formatAmount } from "../utils/payment-utils";
import { printOrderInvoice, printShippingLabel } from "../utils/print-utils";

interface OrderTableDesktopProps {
  orders: any[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onViewDetails: (id: string) => void;
  onQuickAction: (action: string, order: any) => void;
}

export function OrderTableDesktop({
  orders,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onViewDetails,
  onQuickAction,
}: OrderTableDesktopProps): React.ReactElement {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isAllSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id || o._id));

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
    facebook: { label: "Facebook Ads", cls: "bg-blue-100 text-blue-800 border-blue-200" },
    website: { label: "Website", cls: "bg-slate-100 text-slate-800 border-slate-200" },
    reseller: { label: "Reseller Hub", cls: "bg-purple-100 text-purple-800 border-purple-200" },
    wholesaler: { label: "B2B Wholesale", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
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
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-extrabold text-[11px] border-b border-border/80">
          <tr>
            <th className="p-3.5 w-10 text-center">
              <Checkbox checked={isAllSelected} onCheckedChange={onToggleSelectAll} />
            </th>
            <th className="p-3.5">Order</th>
            <th className="p-3.5">Customer & Contact</th>
            <th className="p-3.5">Channel</th>
            <th className="p-3.5">Items & Delivery</th>
            <th className="p-3.5 text-right">Total & Due</th>
            <th className="p-3.5">Status & Risk</th>
            <th className="p-3.5">Courier & Slip</th>
            <th className="p-3.5 text-right w-28">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-12 text-center text-muted-foreground">
                কোনো অর্ডার পাওয়া যায়নি।
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const orderId = order.id || order._id;
              const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
              const isSelected = selectedIds.has(orderId);
              const status: OrderStatus = order.status || "pending";
              const customerName = order.customer?.name || "GUEST CUSTOMER";
              const phone = order.customer?.phone || order.shipping?.phone || "";
              const formattedPhoneForWhatsapp = phone.replace(/[^0-9]/g, "").replace(/^0/, "880");
              const address =
                order.shipping?.address ||
                `${order.shipping?.district || ""}, ${order.shipping?.division || ""}`.trim() ||
                "N/A";
              
              const payDetails = getOrderPaymentDetails(order);
              const items = order.items || order.pricing?.items || [];
              const channel = order.source || order.type || "website";
              const riskScore = order.riskScore ?? 76;
              const isHighRisk = riskScore < 50;
              const hasCourierSlip = Boolean(order.courierInfo?.trackingNumber || order.pickupRequested);
              const deliveryCharge = order.shipping?.deliveryCharge ?? order.shippingCost ?? 120;

              return (
                <tr
                  key={orderId}
                  onClick={() => onViewDetails(orderId)}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                    isSelected ? "bg-amber-500/5" : ""
                  }`}
                >
                  <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelectOne(orderId)}
                    />
                  </td>

                  {/* Order ID & Timestamp */}
                  <td className="p-3.5">
                    <div className="font-mono font-black text-sm text-foreground">{orderNumber}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {formatExactTime(order.createdAt)}
                    </div>
                  </td>

                  {/* Customer Info & Copy Buttons */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-foreground text-sm">{customerName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(customerName, "Customer Name");
                        }}
                        className="p-0.5 text-slate-400 hover:text-foreground"
                        title="Copy Name"
                      >
                        {copiedField === "Customer Name" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>

                      {order.customerOrderCount && order.customerOrderCount > 1 && (
                        <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full border border-rose-200">
                          ⚠ {order.customerOrderCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                      <span className="font-mono text-muted-foreground">{phone}</span>
                      {phone && (
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${phone}`}
                            title="Quick Call"
                            className="p-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                          >
                            <Phone className="h-3 w-3" />
                          </a>
                          <a
                            href={`https://wa.me/${formattedPhoneForWhatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Direct WhatsApp"
                            className="p-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(phone, "Phone")}
                            className="p-0.5 text-slate-400 hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 line-clamp-1">
                      <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                      {address}
                    </div>
                  </td>

                  {/* Channel Source */}
                  <td className="p-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        channelBadgeMap[channel]?.cls || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {channelBadgeMap[channel]?.label || channel}
                    </span>
                  </td>

                  {/* Items Summary with Product Thumbnail & Delivery Charge */}
                  <td className="p-3.5">
                    {items.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-slate-200 border overflow-hidden shrink-0 relative">
                            <Image
                              src={items[0].imageUrl || items[0].image || "/placeholder.png"}
                              alt="Product"
                              fill
                              className="object-cover"
                              sizes="28px"
                              onError={(e: any) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-foreground line-clamp-1">
                              {items[0].productName || items[0].name || "Product Item"}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              (৳{formatAmount(items[0].unitSellingPrice || items[0].unitPrice || 0)} × {items[0].quantity})
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Delivery Charge: ৳{formatAmount(deliveryCharge)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No items</span>
                    )}
                  </td>

                  {/* Pricing Total & Due */}
                  <td className="p-3.5 text-right font-mono" onClick={(e) => e.stopPropagation()}>
                    <div className="text-sm font-black text-foreground">
                      ৳ {formatAmount(payDetails.grandTotal)}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={payDetails.dueCls}>{payDetails.dueLabel}</span>
                      <button
                        type="button"
                        onClick={() => onQuickAction("edit_payment", order)}
                        title="Edit COD & Payment Details"
                        className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-0.5">
                      <span className={`inline-flex px-2 py-0.2 text-[9px] rounded border ${payDetails.badgeCls}`}>
                        {payDetails.badgeLabel}
                      </span>
                    </div>
                  </td>

                  {/* Status & Risk */}
                  <td className="p-3.5 space-y-1">
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        statusColorMap[status] || "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {getHumanLabel(status)}
                    </Badge>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border ${
                          isHighRisk
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {isHighRisk ? <AlertTriangle className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                        Score: {riskScore}%
                      </span>
                    </div>
                  </td>

                  {/* Courier & Slip Download Status */}
                  <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                    {order.courierInfo?.courierName ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          <Truck className="h-3.5 w-3.5" />
                          {order.courierInfo.courierName}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => printShippingLabel(order)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200"
                          >
                            <FileCheck className="h-3 w-3 text-emerald-600" /> Print Courier Slip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQuickAction("pickup", order)}
                          className="h-7 px-2 text-[11px] font-bold text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
                        >
                          <Truck className="h-3 w-3 mr-1" /> Book Pickup
                        </Button>
                        <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Slip Not Fetched
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Action Controls */}
                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => printOrderInvoice(order)}
                        title="Print / Download Tax Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onViewDetails(orderId)}
                        title="View Full Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onQuickAction("menu", order)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTableDesktop;
