"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Plus,
  Printer,
  Eye,
  Edit3,
  Trash2,
  Phone,
  Copy,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { EditResellerOrderModal } from "@/features/reseller-workspace/components/edit-reseller-order-modal";
import { ResellerInvoiceModal } from "@/features/reseller-workspace/components/reseller-invoice-modal";
import { OrderNoteModal } from "@/shared/components/order-note-modal";
import type { ResellerOrderDTO } from "@/features/reseller/actions/reseller-order-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function ResellerOrdersPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<ResellerOrderDTO[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [statusCounts, setStatusCounts] = React.useState<{
    all: number;
    new: number;
    pending: number;
    approved: number;
    wfp: number;
    packaging: number;
    shipment: number;
    delivered: number;
    wfr: number;
    returned: number;
    cancel: number;
  }>({
    all: 0,
    new: 0,
    pending: 0,
    approved: 0,
    wfp: 0,
    packaging: 0,
    shipment: 0,
    delivered: 0,
    wfr: 0,
    returned: 0,
    cancel: 0,
  });

  // Modals state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedOrderToEdit, setSelectedOrderToEdit] = React.useState<ResellerOrderDTO | null>(null);

  const [invoiceModalOpen, setInvoiceModalOpen] = React.useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = React.useState<ResellerOrderDTO | null>(null);

  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [selectedOrderForNote, setSelectedOrderForNote] = React.useState<ResellerOrderDTO | null>(null);

  // Shop Settings for Invoice Branding
  const [shopSettings, setShopSettings] = React.useState<{
    businessName?: string;
    phone?: string;
    address?: string;
    invoiceFooter?: string;
  } | null>(null);

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const { getResellerOrdersAction } = await import(
        "@/features/reseller/actions/reseller-order-actions"
      );
      const { getResellerShopSettingsAction } = await import(
        "@/features/reseller/actions/reseller-actions"
      );

      const [res, shopRes] = await Promise.allSettled([
        getResellerOrdersAction({
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search.trim() || undefined,
          page,
          limit: pageSize,
        }),
        getResellerShopSettingsAction(),
      ]);

      if (shopRes.status === "fulfilled" && shopRes.value.success && shopRes.value.data) {
        setShopSettings(shopRes.value.data);
      }

      if (res.status === "fulfilled" && res.value.success && res.value.data) {
        setOrders(res.value.data.items || []);
        setTotalCount(res.value.data.totalCount ?? (res.value.data.items || []).length);
        if (res.value.data.statusCounts) {
          setStatusCounts(res.value.data.statusCounts);
        }
      } else {
        setOrders([]);
        setTotalCount(0);
      }
    } catch {
      toast.error("রিটেইলার অর্ডার তালিকা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, pageSize]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handlePrintInvoice = (order: ResellerOrderDTO) => {
    setSelectedOrderForInvoice(order);
    setInvoiceModalOpen(true);
  };

  const handleEditClick = (order: ResellerOrderDTO) => {
    const isBlocked =
      Boolean(order.trackingNumber) ||
      ["pickup_requested", "shipment", "shipped", "in_transit", "delivered", "completed", "cancelled"].includes(
        order.status,
      );

    if (isBlocked) {
      toast.error("কুরিয়ার পিকআপ রিকুয়েস্টের পর বা ট্র্যাকিং নম্বর আসার পর অর্ডার এডিট করা সম্ভব নয়।");
      return;
    }
    setSelectedOrderToEdit(order);
    setEditModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি মুছে ফেলতে চান?")) return;

    try {
      const { deleteResellerOrderAction } = await import(
        "@/features/reseller/actions/reseller-order-actions"
      );
      const res = await deleteResellerOrderAction(orderId);
      if (res.success) {
        toast.success("অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে।");
        loadOrders();
      } else {
        toast.error(res.error || "অর্ডার মুছে ফেলতে ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("একটি সমস্যা হয়েছে।");
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success(`মোবাইল নম্বর কপি করা হয়েছে: ${phone}`);
  };

  const statusBadges = [
    { id: "new", label: "New", count: statusCounts.new || 0 },
    { id: "pending", label: "Pending", count: statusCounts.pending || 0 },
    { id: "approved", label: "Approved", count: statusCounts.approved || 0 },
    { id: "wfp", label: "WFP", count: statusCounts.wfp || 0 },
    { id: "packaging", label: "Packaging", count: statusCounts.packaging || 0 },
    { id: "shipment", label: "Shipment", count: statusCounts.shipment || 0 },
    { id: "delivered", label: "Delivered", count: statusCounts.delivered || 0 },
    { id: "wfr", label: "WFR", count: statusCounts.wfr || 0 },
    { id: "returned", label: "Returned", count: statusCounts.returned || 0 },
    { id: "cancel", label: "Cancel", count: statusCounts.cancel || 0 },
    { id: "all", label: "All", count: statusCounts.all || totalCount },
  ];

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.district.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <ResellerStatusGuard status="active">
      <div className="space-y-5 animate-fade-in pb-16">
        {/* Top Filter Chips (Matching Screenshot exact layout & counts) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statusBadges.map((b) => {
            const isActive = statusFilter === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setStatusFilter(b.id);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
                  isActive
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-2xs font-bold"
                    : "bg-emerald-50/40 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-emerald-200/60 dark:border-slate-700 hover:bg-emerald-100/60",
                )}
              >
                <span>{b.label}</span>
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100">
                  {b.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header & Controls Card */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Order list
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              {totalCount} টি অর্ডার
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter Invoice, customer phone"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-rose-500"
              />
            </div>

            {/* Page Size Select */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-rose-500"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <Link href="/reseller/orders/create">
              <Button size="sm" className="gap-1 font-black bg-rose-600 hover:bg-rose-700 text-white shrink-0">
                <Plus className="w-4 h-4" /> নতুন অর্ডার
              </Button>
            </Link>
          </div>
        </div>

        {/* Content Container (Mobile Card View & Desktop Table View) */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground">
            অর্ডার তালিকা লোড হচ্ছে...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground space-y-3 bg-card rounded-2xl border border-border/80">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p>কোনো অর্ডার পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* MOBILE CARD VIEW (< 768px) */}
            <div className="block md:hidden space-y-3">
              {filteredOrders.map((o, idx) => {
                const serialNo = (page - 1) * pageSize + idx + 1;
                const totalBillTaka =
                  (o.sellingPriceCents || 0) > 5000
                    ? Math.round((o.sellingPriceCents || 0) / 100)
                    : o.sellingPriceCents || 0;
                const deliveryTaka =
                  (o.deliveryChargeCents || 0) > 5000
                    ? Math.round((o.deliveryChargeCents || 0) / 100)
                    : o.deliveryChargeCents || 0;
                const advancePaidTaka =
                  (o.advancePaidCents || 0) > 5000
                    ? Math.round((o.advancePaidCents || 0) / 100)
                    : o.advancePaidCents || 0;
                const dueTaka = Math.max(0, totalBillTaka - advancePaidTaka);
                const profitTaka =
                  Math.abs(o.profitCents || 0) > 5000
                    ? Math.round((o.profitCents || 0) / 100)
                    : o.profitCents || 0;
                const isEditable =
                  !o.trackingNumber &&
                  !["pickup_requested", "shipment", "shipped", "in_transit", "delivered", "completed", "cancelled"].includes(
                    o.status,
                  );

                const rawNote = (o as any).notes || (o as any).shipping?.deliveryNote || "";
                const userMatch = rawNote.match(/userNote:(.*)$/i);
                const cleanNote = userMatch ? userMatch[1].trim() : (rawNote.includes("payment:") ? "" : rawNote.trim());

                return (
                  <Card key={o.id} className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      {/* Top Row: Serial, Invoice & Status */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground font-mono">#{serialNo}</span>
                          <span className="font-mono font-black text-sm text-foreground">#{o.orderNumber}</span>
                        </div>
                        <StatusChip
                          label={o.status.replace(/_/g, " ")}
                          tone={statusToneFromValue(o.status)}
                        />
                      </div>

                      {/* Customer Block */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-slate-900 dark:text-slate-100 text-sm">{o.customerName}</p>
                          <span className="font-mono font-extrabold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-900">
                            {o.customerPhone}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{o.fullAddress}, {o.district}</p>

                        {/* Customer Quick Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${o.customerPhone}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                          >
                            <Phone className="w-3 h-3 text-rose-500" /> কল
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(o.customerPhone)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                          >
                            <Copy className="w-3 h-3 text-indigo-500" /> কপি
                          </button>
                          <a
                            href={`https://wa.me/88${o.customerPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold"
                          >
                            <MessageCircle className="w-3 h-3" /> হোয়াটসঅ্যাপ
                          </a>
                        </div>
                      </div>

                      {/* Product Block */}
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
                        {o.imageUrl && (
                          <img
                            src={o.imageUrl}
                            alt={o.productName}
                            className="w-12 h-12 object-cover rounded-lg border border-border shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-foreground line-clamp-1">{o.productName}</p>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">পরিমাণ: {o.quantity} টি</p>
                        </div>
                      </div>

                      {/* Financial Summary Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-border/60">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">মোট বিল:</span>
                          <span className="font-black text-foreground">৳{totalBillTaka}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">অগ্রিম পরিশোধ:</span>
                          <span className="font-bold text-emerald-600">৳{advancePaidTaka}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">ক্যাশ অন ডেলিভারি:</span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">৳{dueTaka}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">আপনার প্রফিট:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">+৳{profitTaka}</span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePrintInvoice(o)}
                            className="h-8 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> ইনভয়েস
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForNote(o);
                              setNoteModalOpen(true);
                            }}
                            className="h-8 px-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/20"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            {cleanNote ? "নোট দেখুন" : "নোট"}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Link href={`/reseller/orders/${o.id}`}>
                            <button
                              type="button"
                              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="ভিউ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEditClick(o)}
                            disabled={!isEditable}
                            className={cn(
                              "p-2 rounded-xl transition-colors",
                              isEditable ? "hover:bg-primary/10 text-primary" : "text-muted-foreground/30 cursor-not-allowed",
                            )}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id)}
                            disabled={!isEditable}
                            className={cn(
                              "p-2 rounded-xl transition-colors",
                              isEditable ? "hover:bg-rose-500/10 text-rose-600" : "text-muted-foreground/30 cursor-not-allowed",
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW (>= 768px) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-black border-b border-border text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">#</th>
                    <th className="py-3 px-3">Invoice</th>
                    <th className="py-3 px-3 min-w-[200px]">Customer</th>
                    <th className="py-3 px-3 min-w-[180px]">Product</th>
                    <th className="py-3 px-3 min-w-[140px]">Details</th>
                    <th className="py-3 px-3 min-w-[170px]">Activities</th>
                    <th className="py-3 px-3">Courier</th>
                    <th className="py-3 px-3 text-center">Comment</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredOrders.map((o, idx) => {
                    const serialNo = (page - 1) * pageSize + idx + 1;
                    const totalBillTaka =
                      (o.sellingPriceCents || 0) > 5000
                        ? Math.round((o.sellingPriceCents || 0) / 100)
                        : o.sellingPriceCents || 0;
                    const deliveryTaka =
                      (o.deliveryChargeCents || 0) > 5000
                        ? Math.round((o.deliveryChargeCents || 0) / 100)
                        : o.deliveryChargeCents || 0;
                    const advancePaidTaka =
                      (o.advancePaidCents || 0) > 5000
                        ? Math.round((o.advancePaidCents || 0) / 100)
                        : o.advancePaidCents || 0;
                    const dueTaka = Math.max(0, totalBillTaka - advancePaidTaka);
                    const profitTaka =
                      Math.abs(o.profitCents || 0) > 5000
                        ? Math.round((o.profitCents || 0) / 100)
                        : o.profitCents || 0;
                    const isEditable =
                      !o.trackingNumber &&
                      !["pickup_requested", "shipment", "shipped", "in_transit", "delivered", "completed", "cancelled"].includes(
                        o.status,
                      );

                    return (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        {/* # Serial */}
                        <td className="py-3.5 px-3 text-center text-muted-foreground font-mono font-bold">
                          {serialNo}
                        </td>

                        {/* Invoice ID */}
                        <td className="py-3.5 px-3 font-mono font-extrabold text-foreground whitespace-nowrap">
                          #{o.orderNumber}
                        </td>

                        {/* Customer Info Block */}
                        <td className="py-3.5 px-3 space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                            {o.customerName}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold border border-indigo-200/60 dark:border-indigo-900">
                              {o.customerPhone}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 max-w-xs">
                            {o.fullAddress}, {o.district}
                          </p>
                          {/* Quick Contact Icons */}
                          <div className="flex items-center gap-1 pt-1">
                            <a
                              href={`tel:${o.customerPhone}`}
                              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600"
                              title="কল করুন"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(o.customerPhone)}
                              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600"
                              title="নম্বর কপি করুন"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://wa.me/88${o.customerPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="হোয়াটসঅ্যাপ মেসেজ"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        </td>

                        {/* Product Info Block */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {o.imageUrl && (
                              <img
                                src={o.imageUrl}
                                alt={o.productName}
                                className="w-10 h-10 object-cover rounded-lg border border-border shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-bold text-foreground line-clamp-1 max-w-[150px]">
                                {o.productName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                Qty: {o.quantity}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Details (Financial Breakdown matching image) */}
                        <td className="py-3.5 px-3 space-y-0.5 text-[11px] font-mono">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-bold text-foreground">৳{totalBillTaka}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount:</span>
                            <span>৳0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Paid:</span>
                            <span className={cn("font-bold", advancePaidTaka > 0 ? "text-emerald-600" : "text-slate-500")}>
                              ৳{advancePaidTaka}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping:</span>
                            <span>৳{deliveryTaka}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Due:</span>
                            <span className={cn("font-extrabold", dueTaka > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600")}>
                              ৳{dueTaka}
                            </span>
                          </div>
                          <div className="flex justify-between text-emerald-600 font-extrabold border-t border-border/40 pt-0.5">
                            <span>Profit:</span>
                            <span>+৳{profitTaka}</span>
                          </div>
                        </td>

                        {/* Activities */}
                        <td className="py-3.5 px-3 space-y-1.5">
                          <p className="text-[11px] text-muted-foreground whitespace-nowrap font-mono">
                            Order Date: {new Date(o.createdAt).toLocaleString("bn-BD")}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">Status:</span>
                            <StatusChip
                              label={o.status.replace(/_/g, " ")}
                              tone={statusToneFromValue(o.status)}
                            />
                          </div>
                        </td>

                        {/* Courier Tracking */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold border border-border">
                            {o.courierName || "Steadfast"}
                          </span>
                          {o.trackingNumber && (
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                              {o.trackingNumber}
                            </p>
                          )}
                        </td>

                        {/* Comment */}
                        <td className="py-3.5 px-3 text-center">
                          {(() => {
                            const rawNote = (o as any).notes || (o as any).shipping?.deliveryNote || "";
                            const userMatch = rawNote.match(/userNote:(.*)$/i);
                            const cleanNote = userMatch ? userMatch[1].trim() : (rawNote.includes("payment:") ? "" : rawNote.trim());
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForNote(o);
                                  setNoteModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] border border-amber-500/20 transition-all shadow-2xs cursor-pointer"
                                title="বিশেষ নোট পড়ুন বা নতুন নোট লিখুন"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                {cleanNote ? (
                                  <span className="max-w-[80px] truncate font-bold" title={cleanNote}>{cleanNote}</span>
                                ) : (
                                  <span>নোট</span>
                                )}
                              </button>
                            );
                          })()}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Print Invoice Button */}
                            <button
                              type="button"
                              onClick={() => handlePrintInvoice(o)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors cursor-pointer"
                              title="ইনভয়েস প্রিন্ট করুন"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* View details */}
                            <Link href={`/reseller/orders/${o.id}`}>
                              <button
                                type="button"
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="অর্ডার ডিটেইলস"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>

                            {/* Edit order */}
                            <button
                              type="button"
                              onClick={() => handleEditClick(o)}
                              disabled={!isEditable}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                isEditable
                                  ? "hover:bg-primary/10 text-primary"
                                  : "text-muted-foreground/30 cursor-not-allowed",
                              )}
                              title={isEditable ? "এডিট" : "অনুমোদিত অর্ডারে এডিট প্রযোজ্য নয়"}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete order */}
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o.id)}
                              disabled={!isEditable}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                isEditable
                                  ? "hover:bg-rose-500/10 text-rose-600"
                                  : "text-muted-foreground/30 cursor-not-allowed",
                              )}
                              title={isEditable ? "ডিলিট" : "অনুমোদিত অর্ডারে ডিলিট প্রযোজ্য নয়"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground">
              Page {page} of {totalPages} ({totalCount} total orders)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1 text-xs font-bold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      <EditResellerOrderModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        order={selectedOrderToEdit}
        onSuccess={loadOrders}
      />

      {/* Printable Invoice Modal */}
      <ResellerInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        order={selectedOrderForInvoice}
        shopName={shopSettings?.businessName}
        shopPhone={shopSettings?.phone}
        shopAddress={shopSettings?.address}
        invoiceFooter={shopSettings?.invoiceFooter}
      />

      {/* Order Note / Courier Instructions Modal */}
      <OrderNoteModal
        open={noteModalOpen}
        onOpenChange={setNoteModalOpen}
        order={selectedOrderForNote}
        onSuccess={loadOrders}
      />
    </ResellerStatusGuard>
  );
}
