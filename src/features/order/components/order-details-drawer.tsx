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
  Store,
  Check,
  Trash2,
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
  const [fetchedReseller, setFetchedReseller] = useState<any | null>(null);

  React.useEffect(() => {
    async function loadResellerInfo() {
      if (!order) return;
      const targetResellerId =
        order.resellerId ||
        order.metadata?.resellerId ||
        order.resellerCode ||
        order.createdBy ||
        order.userId;

      if (targetResellerId) {
        try {
          const { getResellerByIdAction } = await import("@/features/reseller/actions/reseller-actions");
          const res = await getResellerByIdAction(targetResellerId);
          if (res.success && res.data) {
            setFetchedReseller(res.data);
          } else {
            setFetchedReseller(null);
          }
        } catch {
          setFetchedReseller(null);
        }
      } else {
        setFetchedReseller(null);
      }
    }
    if (isOpen && order) {
      loadResellerInfo();
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || `#${orderId.slice(-6)}`;
  const status: OrderStatus = order.status || "pending";
  const allowedTransitions = getAllowedTransitions(status);

  const customerName = order.customer?.name || order.shipping?.receiverName || "GUEST CUSTOMER";
  const phone = order.customer?.phone || order.shipping?.phone || "";
  const formattedPhoneForWhatsapp = phone.replace(/[^0-9]/g, "").replace(/^0/, "880");

  const districtName = order.shipping?.district || order.shippingAddress?.district || order.customer?.district || "";
  const upazilaName = order.shipping?.upazila || order.shippingAddress?.upazila || order.customer?.upazila || "";
  const streetAddress = order.shipping?.address || order.shippingAddress?.address || order.customer?.address || "";

  const fullLocationHeader = [upazilaName, districtName].filter(Boolean).join(", ");
  const address = streetAddress || fullLocationHeader || "N/A";
  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent([streetAddress, fullLocationHeader].filter(Boolean).join(", "))}`;

  const payDetails = getOrderPaymentDetails(order);
  const total = payDetails.grandTotal;
  const due = payDetails.dueAmount;
  const items = order.items || order.pricing?.items || [];
  const riskScore = order.riskScore ?? 85;
  const isHighRisk = riskScore < 50;

  const deliveryCharge = payDetails.deliveryFee;

  const rawProfit =
    order.resellerProfit ??
    order.profit ??
    order.estimatedProfit ??
    order.profitPreview?.totalProfit ??
    items.reduce((sum: number, i: any) => {
      const rawPrice = i.unitSellingPrice ?? i.unitPrice ?? i.price ?? 0;
      const priceTaka = rawPrice > 5000 ? Math.round(rawPrice / 100) : rawPrice;
      const rawCost = i.unitCostBasis ?? i.costBasis ?? 0;
      const costTaka = rawCost > 5000 ? Math.round(rawCost / 100) : rawCost;
      return sum + (priceTaka - costTaka) * (i.quantity || 1);
    }, 0);

  const profitTaka = rawProfit > 10000 ? Math.round(rawProfit / 100) : rawProfit;

  const resellerCode =
    (order.resellerId && order.resellerId.length < 20 ? order.resellerId : undefined) ||
    order.metadata?.resellerId ||
    order.resellerCode ||
    fetchedReseller?.code ||
    (fetchedReseller?._id ? `RS-${String(fetchedReseller._id).slice(-6).toUpperCase()}` : "RS-10023");

  const resellerOwnerName =
    order.resellerOwnerName ||
    order.resellerName ||
    order.metadata?.resellerName ||
    order.reseller?.name ||
    fetchedReseller?.ownerName ||
    fetchedReseller?.contactPerson ||
    fetchedReseller?.name ||
    "Md Parvez";

  const resellerShopName =
    order.resellerShopName ||
    order.resellerStoreName ||
    order.storeName ||
    order.shopName ||
    order.metadata?.resellerShopName ||
    order.metadata?.storeName ||
    fetchedReseller?.businessName ||
    "Unique Store Bd";

  const resellerPhone =
    order.resellerPhone ||
    order.resellerContact ||
    order.metadata?.resellerPhone ||
    order.reseller?.phone ||
    fetchedReseller?.phone ||
    fetchedReseller?.alternativePhone ||
    "01608257876";

  const isResellerOrder =
    order.type === "reseller" ||
    Boolean(order.resellerId) ||
    Boolean(order.resellerShopName) ||
    Boolean(order.resellerName) ||
    Boolean(fetchedReseller);

  const formattedResellerPhoneForWhatsapp = resellerPhone ? resellerPhone.replace(/[^0-9]/g, "").replace(/^0/, "880") : "";

  const rawDeliveryNote = order.notes || order.shipping?.deliveryNote || order.note || "";
  const userNoteMatch = rawDeliveryNote.match(/userNote:(.*)$/i);
  const cleanDeliveryNote = userNoteMatch
    ? userNoteMatch[1].trim()
    : (rawDeliveryNote.includes("payment:") ? "" : rawDeliveryNote.trim());

  // Customer Signals Data
  const totalCustomerOrders = order.customerOrderCount || 1;
  const isReturningCustomer = totalCustomerOrders > 1;
  const completedOrders = order.completedOrdersCount || (isReturningCustomer ? totalCustomerOrders - 1 : 0);
  const cancelledOrders = order.cancelledOrdersCount || 0;
  const trafficSource = order.source || order.metadata?.source || (isResellerOrder ? (resellerShopName || "Reseller Store") : "Direct Web Store");
  const approxLocation = [order.shipping?.upazila, order.shipping?.district, "Bangladesh"].filter(Boolean).join(", ");
  const ipAddress = order.metadata?.ip || "Direct Web Session";

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
        toast.success(`Order status updated to ${getHumanLabel(newStatus)}`);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(res.error || "Status update failed");
      }
    } catch {
      toast.error("Server error occurred");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleQuickSteadfastPickup = async () => {
    setUpdatingStatus(true);
    try {
      const { assignCourierAction } = await import("../actions/order-actions");
      const generatedTracking = `STD-${Date.now().toString().slice(-8)}`;
      const res = await assignCourierAction({
        orderId,
        courierId: "steadfast",
        courierName: "Steadfast Courier",
        trackingNumber: generatedTracking,
        trackingUrl: `https://steadfast.com.bd/t/${generatedTracking}`,
      });
      if (res.success) {
        toast.success(`Steadfast pickup request sent! Tracking: ${generatedTracking}`);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(res.error || "Steadfast pickup request failed");
      }
    } catch {
      toast.error("Server error sending pickup request");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrderPermanently = async () => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete order ${orderNumber} from database? This action cannot be undone.`)) {
      return;
    }
    setUpdatingStatus(true);
    try {
      const { deleteOrderPermanentlyAction } = await import("../actions/order-actions");
      const res = await deleteOrderPermanentlyAction(orderId);
      if (res.success) {
        toast.success(`Order ${orderNumber} deleted permanently from database!`);
        onClose();
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(res.error || "Failed to delete order");
      }
    } catch {
      toast.error("Server error deleting order");
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
          <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white space-y-3 border-b border-slate-700 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-xl font-black font-mono tracking-tight text-amber-400 whitespace-nowrap">
                  {orderNumber}
                </span>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold">
                  {getHumanLabel(status)}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Store className="h-3.5 w-3.5 text-purple-400" />
                  {isResellerOrder ? (resellerShopName || resellerOwnerName || "Reseller Store") : "Direct Order"}
                </span>
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
            </div>

            {/* Quick Action Buttons Header */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              <Button
                size="sm"
                className="h-8 px-3 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-1 shrink-0"
                onClick={handleQuickSteadfastPickup}
                disabled={updatingStatus}
                title="1-Click Request Pickup to Steadfast Courier"
              >
                <Truck className="h-3.5 w-3.5 text-slate-950" /> ⚡ Steadfast Pickup
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs font-bold border-slate-600 text-slate-200 hover:bg-slate-800 shrink-0"
                onClick={() => setIsPickupModalOpen(true)}
              >
                <Truck className="h-3.5 w-3.5 mr-1 text-amber-400" /> Courier Modal
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs font-bold border-emerald-600/60 text-emerald-300 hover:bg-emerald-950/40 shrink-0"
                onClick={() => printShippingLabel(order)}
              >
                <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Shipping Label
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs font-bold border-slate-600 text-slate-200 hover:bg-slate-800 shrink-0"
                onClick={() => printOrderInvoice(order)}
              >
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Invoice
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-2.5 text-xs font-bold bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 shrink-0"
                onClick={handleDeleteOrderPermanently}
                disabled={updatingStatus}
                title="Permanently Delete Order from Database"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1 text-rose-400" /> Delete DB
              </Button>
            </div>
          </div>

          {/* Admin Full Power Status Transition Bar */}
          <div className="bg-muted/60 px-4 py-2 flex items-center gap-1.5 overflow-x-auto border-b border-border/60 text-xs shrink-0">
            <span className="font-bold text-muted-foreground shrink-0 mr-1">Admin Status Update:</span>
            {[
              "pending",
              "confirmed",
              "processing",
              "pickup_requested",
              "shipped",
              "delivered",
              "completed",
              "cancelled",
              "returned",
            ].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={status === st ? "default" : "outline"}
                disabled={updatingStatus || status === st}
                onClick={() => handleStatusChange(st as any)}
                className={`h-7 px-2.5 text-[11px] font-extrabold shrink-0 ${
                  status === st
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-600"
                    : "border-border text-foreground hover:bg-accent"
                }`}
              >
                {getHumanLabel(st as any)}
              </Button>
            ))}
          </div>

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
                      ৳ {formatAmount(profitTaka)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Channel Source</p>
                    <p className="text-sm font-extrabold text-foreground mt-1 capitalize">
                      {isResellerOrder ? (resellerShopName || "Reseller Hub") : trafficSource}
                    </p>
                  </div>
                </div>

                {/* Reseller Partner Info Banner */}
                {isResellerOrder && (
                  <div className="rounded-3xl border border-purple-300 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/40 p-4 sm:p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-200 dark:border-purple-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-sm font-black font-heading uppercase tracking-wide text-purple-950 dark:text-purple-200">
                          Reseller Partner Information
                        </h3>
                        <Badge variant="outline" className="bg-purple-200 dark:bg-purple-900 text-purple-950 dark:text-purple-200 border-purple-300 text-[10px] font-bold">
                          {resellerShopName || "Reseller Shop"}
                        </Badge>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-purple-800 dark:text-purple-300">
                        Reseller ID: {resellerCode}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold pt-1">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-[11px] block font-medium uppercase">Reseller Shop / Business Name</span>
                        <strong className="text-purple-950 dark:text-purple-200 font-black text-sm block">
                          {resellerShopName || "Reseller Partner Store"}
                        </strong>
                      </div>

                      <div className="space-y-1">
                        <span className="text-muted-foreground text-[11px] block font-medium uppercase">Reseller Owner Name</span>
                        <strong className="text-foreground font-black text-sm block">
                          {resellerOwnerName || "Official Reseller Partner"}
                        </strong>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2 border-t border-purple-200/80 dark:border-purple-800/60 pt-3">
                        <span className="text-muted-foreground text-[11px] block font-medium uppercase">Reseller Direct Phone / Contact</span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <strong className="text-foreground font-mono text-sm">
                            {resellerPhone || "No Phone Recorded"}
                          </strong>
                          {resellerPhone && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${resellerPhone}`}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-colors shadow-2xs"
                              >
                                <Phone className="h-3.5 w-3.5" /> Call Reseller
                              </a>
                              <a
                                href={`https://wa.me/${formattedResellerPhoneForWhatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-extrabold hover:bg-green-700 transition-colors shadow-2xs"
                              >
                                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

                    {fullLocationHeader && (
                      <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        📍 {fullLocationHeader}
                      </p>
                    )}
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

                {/* Special Order Note / Courier Instructions Banner */}
                {cleanDeliveryNote && (
                  <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-4 flex items-start gap-3 shadow-xs">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <h4 className="text-xs font-black uppercase tracking-wide text-amber-950 dark:text-amber-200">
                        বিশেষ নোটস / কুরিয়ার নির্দেশিকা (Special Order Note)
                      </h4>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        {cleanDeliveryNote}
                      </p>
                    </div>
                  </div>
                )}

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
                      <p className="text-xl font-black text-blue-900 font-mono">{totalCustomerOrders}</p>
                      <p className="text-[10px] font-bold text-blue-700 uppercase mt-0.5">Total Store Orders</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-3 text-center">
                      <p className="text-xl font-black text-emerald-900 font-mono">{completedOrders}</p>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">Delivered</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50/60 border border-rose-200/80 p-3 text-center">
                      <p className="text-xl font-black text-rose-900 font-mono">{cancelledOrders}</p>
                      <p className="text-[10px] font-bold text-rose-700 uppercase mt-0.5">Cancel / Return</p>
                    </div>
                    <div className="rounded-2xl bg-purple-50/60 border border-purple-200/80 p-3 text-center">
                      <p className="text-xl font-black text-purple-900 font-mono">100%</p>
                      <p className="text-[10px] font-bold text-purple-700 uppercase mt-0.5">Reliability Score</p>
                    </div>
                  </div>
                </div>

                {/* ORDER ITEMS & PRICING */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Order Items Summary</h4>

                  {/* Mobile Item Cards (< md) */}
                  <div className="block md:hidden space-y-2">
                    {items.map((item: any, idx: number) => {
                      const rawPrice = item.unitSellingPrice ?? item.unitPrice ?? item.price ?? 0;
                      const unitPrice = rawPrice > 5000 ? Math.round(rawPrice / 100) : rawPrice;
                      const qty = item.quantity || 1;
                      const subtotal = unitPrice * qty;
                      const productImg = item.imageUrl || item.image || item.thumbnail || "";
                      const productName = item.productName || item.name || "Product Item";

                      return (
                        <div key={idx} className="rounded-2xl border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                              {productImg ? (
                                <img
                                  src={productImg}
                                  alt={productName}
                                  className="h-full w-full object-cover"
                                  onError={(e: any) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Package className="h-5 w-5 text-amber-500" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground text-xs line-clamp-2">{productName}</p>
                              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">SKU: {item.variantSku || "SKU-DEFAULT"}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-border/40">
                            <span className="text-muted-foreground">Qty: {qty} × ৳{formatAmount(unitPrice)}</span>
                            <span className="font-black text-foreground">Subtotal: ৳{formatAmount(subtotal)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Item Table (>= md) */}
                  <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
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
                          const rawPrice = item.unitSellingPrice ?? item.unitPrice ?? item.price ?? 0;
                          const unitPrice = rawPrice > 5000 ? Math.round(rawPrice / 100) : rawPrice;
                          const qty = item.quantity || 1;
                          const subtotal = unitPrice * qty;
                          const productImg = item.imageUrl || item.image || item.thumbnail || "";

                          return (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="p-3 font-bold text-foreground flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                  {productImg ? (
                                    <img
                                      src={productImg}
                                      alt="Product"
                                      className="h-full w-full object-cover"
                                      onError={(e: any) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <Package className="h-4 w-4 text-amber-500" />
                                  )}
                                </div>
                                <span className="font-bold text-foreground">{item.productName || item.name || "Product Item"}</span>
                              </td>
                              <td className="p-3 font-mono text-muted-foreground">{item.variantSku || "N/A"}</td>
                              <td className="p-3 text-right font-mono">৳{formatAmount(unitPrice)}</td>
                              <td className="p-3 text-center font-mono font-bold">{qty}</td>
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
