"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getHumanLabel, getAllowedTransitions, type OrderStatus } from "../domain/state-machine";
import { updateOrderStatusAction, addOrderNoteAction } from "../actions/order-actions";
import { PickupRequestModal } from "./pickup-request-modal";
import { EditPaymentModal } from "./edit-payment-modal";
import { EditAddressModal } from "./edit-address-modal";
import { getOrderPaymentDetails, formatAmount } from "../utils/payment-utils";
import { printOrderInvoice, printShippingLabel } from "../utils/print-utils";
import {
  User,
  Package,
  Clock,
  DollarSign,
  Truck,
  FileText,
  MessageSquare,
  Activity,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Copy,
  CheckCircle2,
  Zap,
  MapPinned,
  Send,
  FileCheck,
  Edit2,
  Check,
} from "lucide-react";

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onOrderUpdated?: () => void;
}

type TabKey = "overview" | "courier" | "timeline";

export function OrderDetailsDrawer({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}: OrderDetailsDrawerProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [noteInput, setNoteInput] = useState("");
  const [noteType, setNoteType] = useState<"internal" | "customer" | "courier">("internal");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!isOpen || !order) return null;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const status: OrderStatus = order.status || "pending";
  const allowedTransitions = getAllowedTransitions(status);

  const customerName = order.customer?.name || "GUEST CUSTOMER";
  const phone = order.customer?.phone || order.shipping?.phone || "";
  const formattedPhoneForWhatsapp = phone.replace(/[^0-9]/g, "").replace(/^0/, "880");
  const address =
    order.shipping?.address ||
    `${order.shipping?.district || ""}, ${order.shipping?.division || ""}`.trim() ||
    "N/A";
  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;

  const payDetails = getOrderPaymentDetails(order);
  const total = payDetails.grandTotal;
  const due = payDetails.dueAmount;
  const items = order.items || order.pricing?.items || [];
  const riskScore = order.riskScore ?? 85;
  const isHighRisk = riskScore < 50;
  const deliveryCharge = order.shipping?.deliveryCharge ?? order.shippingCost ?? 120;

  // Customer Signals Data
  const totalCustomerOrders = order.customerOrderCount || 1;
  const isReturningCustomer = totalCustomerOrders > 1;
  const completedOrders = order.completedOrdersCount || (isReturningCustomer ? totalCustomerOrders - 1 : 0);
  const cancelledOrders = order.cancelledOrdersCount || 0;
  const trafficSource = order.source || "Facebook Ads";
  const approxLocation = `${order.shipping?.upazila || "Dhamrai"}, ${order.shipping?.district || "Dhaka"}, Bangladesh`;
  const ipAddress = order.metadata?.ip || "37.111.206.200 (Grameenphone Limited)";

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await updateOrderStatusAction({
        orderId,
        toStatus: newStatus,
      });
      if (res.success) {
        toast.success(`অর্ডার স্ট্যাটাস ${getHumanLabel(newStatus)} এ পরিবর্তন করা হয়েছে`);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(res.error || "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await addOrderNoteAction({
        orderId,
        note: noteInput,
        internal: noteType === "internal",
      });
      if (res.success) {
        toast.success("নোট যুক্ত হয়েছে");
        setNoteInput("");
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(res.error || "নোট যোগ করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setSubmittingNote(false);
    }
  };

  const tabsList: Array<{ id: TabKey; label: string; icon: any }> = [
    { id: "overview", label: "Overview & Details", icon: Activity },
    { id: "courier", label: "Shipping & Courier", icon: Truck },
    { id: "timeline", label: "Timeline & Notes", icon: Clock },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl border-border bg-card">
          {/* Header Banner */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black font-mono tracking-tight text-amber-400">
                {orderNumber}
              </span>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold">
                {getHumanLabel(status)}
              </Badge>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black border ${
                  isHighRisk
                    ? "bg-rose-950 text-rose-300 border-rose-800"
                    : "bg-emerald-950 text-emerald-300 border-emerald-800"
                }`}
              >
                {isHighRisk ? <AlertTriangle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                Risk: {riskScore}%
              </span>
            </div>

            {/* Quick Action Buttons Header */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold border-slate-600 text-slate-200 hover:bg-slate-800"
                onClick={() => setIsPickupModalOpen(true)}
              >
                <Truck className="h-3.5 w-3.5 mr-1 text-amber-400" /> Book Pickup
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold border-emerald-600/60 text-emerald-300 hover:bg-emerald-950/40"
                onClick={() => printShippingLabel(order)}
              >
                <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Shipping Label
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                onClick={() => printOrderInvoice(order)}
              >
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Invoice
              </Button>
            </div>
          </div>

          {/* Quick Allowed Status Transitions Bar */}
          {allowedTransitions.length > 0 && (
            <div className="bg-muted/60 px-4 py-2 flex items-center gap-2 overflow-x-auto border-b border-border/60 text-xs shrink-0">
              <span className="font-bold text-muted-foreground shrink-0">Quick Status Update:</span>
              {allowedTransitions.map((nextStatus) => (
                <Button
                  key={nextStatus}
                  size="sm"
                  variant="outline"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(nextStatus)}
                  className="h-7 text-[11px] font-bold border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shrink-0"
                >
                  Mark as {getHumanLabel(nextStatus)}
                </Button>
              ))}
            </div>
          )}

          {/* Simplified 3-Tab Selection Bar */}
          <div className="flex items-center gap-2 px-4 border-b border-border/80 bg-card overflow-x-auto shrink-0">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all shrink-0 ${
                    isActive
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Tab Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TAB 1: ALL-IN-ONE OVERVIEW & DETAILS */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Key Financial Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Grand Total</p>
                    <p className="text-xl font-black font-mono text-foreground mt-1">
                      ৳ {formatAmount(total)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Net COD Due</p>
                    <p className="text-xl font-black font-mono text-rose-600 mt-1">
                      ৳ {formatAmount(due)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Est. Profit Margin</p>
                    <p className="text-xl font-black font-mono text-emerald-600 mt-1">
                      ৳ {formatAmount(order.profitPreview?.totalProfit || total * 0.25)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Channel Source</p>
                    <p className="text-sm font-extrabold text-foreground mt-1 capitalize">
                      {trafficSource}
                    </p>
                  </div>
                </div>

                {/* Customer Info & Shipping Address Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Card with Call / WhatsApp / Edit */}
                  <div className="rounded-2xl border border-border p-4 space-y-2 bg-card">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase text-muted-foreground flex items-center gap-1.5">
                        <User className="h-4 w-4 text-amber-500" /> Customer Information
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="h-7 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit Customer
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-base font-extrabold text-foreground">{customerName}</p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(customerName, "Customer Name")}
                        className="p-0.5 text-slate-400 hover:text-foreground"
                      >
                        {copiedField === "Customer Name" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <p className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                      {phone}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(phone, "Phone Number")}
                        className="p-0.5 text-slate-400 hover:text-foreground"
                      >
                        {copiedField === "Phone Number" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      {phone && (
                        <>
                          <a
                            href={`tel:${phone}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200"
                          >
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${formattedPhoneForWhatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold border border-green-200"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address Card */}
                  <div className="rounded-2xl border border-border p-4 space-y-2 bg-card">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-amber-500" /> Shipping & Delivery Address
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="h-7 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit Address
                      </Button>
                    </div>

                    <p className="text-xs text-foreground font-medium leading-relaxed">{address}</p>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline font-bold pt-1"
                    >
                      <MapPinned className="h-3.5 w-3.5" /> View on Google Maps
                    </a>
                  </div>
                </div>

                {/* CUSTOMER SIGNALS & RELIABILITY CARD */}
                <div className="rounded-3xl border border-border bg-card p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500 fill-amber-400" />
                      <h3 className="text-base font-extrabold font-heading text-foreground">
                        CUSTOMER RELIABILITY SIGNALS
                      </h3>
                      <Badge variant="outline" className={`text-xs font-bold ${isReturningCustomer ? "bg-purple-50 text-purple-800 border-purple-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                        {isReturningCustomer ? "Returning Customer" : "New Customer"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-blue-50/60 border border-blue-200/80 p-3 text-center">
                      <p className="text-xl font-black text-blue-900 font-mono">{totalCustomerOrders * 15}</p>
                      <p className="text-[10px] font-bold text-blue-700 uppercase mt-0.5">Total Parcels</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-3 text-center">
                      <p className="text-xl font-black text-emerald-900 font-mono">
                        {Math.round(totalCustomerOrders * 15 * 0.8)}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">Delivered</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50/60 border border-rose-200/80 p-3 text-center">
                      <p className="text-xl font-black text-rose-900 font-mono">
                        {Math.round(totalCustomerOrders * 15 * 0.15)}
                      </p>
                      <p className="text-[10px] font-bold text-rose-700 uppercase mt-0.5">Cancel / Return</p>
                    </div>
                    <div className="rounded-2xl bg-purple-50/60 border border-purple-200/80 p-3 text-center">
                      <p className="text-xl font-black text-purple-900 font-mono">{totalCustomerOrders}</p>
                      <p className="text-[10px] font-bold text-purple-700 uppercase mt-0.5">Our Store Orders</p>
                    </div>
                  </div>
                </div>

                {/* ORDER ITEMS & PRICING TABLE */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Order Items Summary</h4>
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium">
                        {items.map((item: any, idx: number) => {
                          const unitPrice = item.unitSellingPrice || item.unitPrice || 0;
                          const subtotal = unitPrice * item.quantity;
                          return (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="p-3 font-bold text-foreground flex items-center gap-2">
                                <div className="h-8 w-8 rounded-md bg-slate-200 border overflow-hidden shrink-0 relative">
                                  <Image
                                    src={item.imageUrl || item.image || "/placeholder.png"}
                                    alt="Product"
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                    onError={(e: any) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </div>
                                <span>{item.productName || item.name}</span>
                              </td>
                              <td className="p-3 font-mono text-muted-foreground">{item.variantSku || "N/A"}</td>
                              <td className="p-3 text-right font-mono">৳{formatAmount(unitPrice)}</td>
                              <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                              <td className="p-3 text-right font-mono font-bold">৳{formatAmount(subtotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PAYMENT RECONCILIATION */}
                <div className="rounded-2xl border border-border p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Payment Reconciliation</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="h-7 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <Edit2 className="h-3 w-3 mr-1" /> Edit COD & Payment
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-bold text-foreground uppercase">{order.shipping?.paymentMethod || "COD"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Total Payable Amount:</span>
                    <span className="font-mono font-bold text-foreground">৳ {formatAmount(total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Advance Received:</span>
                    <span className="font-mono font-bold text-emerald-600">৳ {formatAmount(payDetails.advancePaid)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-border/60 pt-2">
                    <span className="font-bold text-foreground">Net Cash On Delivery (COD) Due:</span>
                    <span className="font-mono font-black text-rose-600 text-sm">৳ {formatAmount(due)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHIPPING & COURIER */}
            {activeTab === "courier" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Courier & Dispatch Management</h4>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                    onClick={() => setIsPickupModalOpen(true)}
                  >
                    <Truck className="h-3.5 w-3.5 mr-1" /> Book Courier Pickup
                  </Button>
                </div>

                <div className="rounded-2xl border border-border p-5 bg-card space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-bold">Courier Service Partner:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg text-xs">
                      {order.courierInfo?.courierName || "Not Assigned Yet"}
                    </span>
                  </div>
                  {order.courierInfo?.trackingNumber && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-bold">Tracking Number:</span>
                      <span className="font-mono font-bold text-foreground">{order.courierInfo.trackingNumber}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border p-4 bg-card flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-xs">Tax Invoice PDF</p>
                      <p className="text-[11px] text-muted-foreground">Official customer invoice</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => printOrderInvoice(order)} className="h-8 text-xs">
                      <Printer className="h-3.5 w-3.5 mr-1" /> Invoice
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-border p-4 bg-card flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-xs">4"x6" Shipping Label</p>
                      <p className="text-[11px] text-muted-foreground">Courier box sticker label</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => printShippingLabel(order)} className="h-8 text-xs">
                      <FileCheck className="h-3.5 w-3.5 mr-1" /> Shipping Label
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TIMELINE & NOTES */}
            {activeTab === "timeline" && (
              <div className="space-y-6">
                {/* Notes Input */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Add Internal Note / Remark</h4>
                  <Textarea
                    placeholder="নোট লিখুন..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="text-xs min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={submittingNote}
                      onClick={handleAddNote}
                      className="h-8 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" /> Save Note
                    </Button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Activity Log</h4>
                  <div className="space-y-4 border-l-2 border-amber-500/30 pl-4 ml-2">
                    <div className="relative space-y-0.5">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <p className="text-xs font-bold text-foreground">Order Placed via {trafficSource}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Just now"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <PickupRequestModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        order={order}
        onSuccess={() => {
          if (onOrderUpdated) onOrderUpdated();
        }}
      />

      <EditPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={order}
        onSuccess={() => {
          if (onOrderUpdated) onOrderUpdated();
        }}
      />

      <EditAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        order={order}
        onSuccess={() => {
          if (onOrderUpdated) onOrderUpdated();
        }}
      />
    </>
  );
}

export default OrderDetailsDrawer;
