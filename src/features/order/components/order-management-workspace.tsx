"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  listOrdersAction,
  getOrderDashboardStatsAction,
  bulkOrderActionAction,
  assignCourierAction,
} from "../actions/order-actions";
import { OrderCardMobile } from "./order-card-mobile";
import { OrderTableDesktop } from "./order-table-desktop";
import { OrderBulkActionBar } from "./order-bulk-action-bar";
import { OrderDetailsDrawer } from "./order-details-drawer";
import { PickupRequestModal } from "./pickup-request-modal";
import { EditPaymentModal } from "./edit-payment-modal";
import { EditAddressModal } from "./edit-address-modal";
import { EditResellerOrderModal } from "@/features/reseller-workspace/components/edit-reseller-order-modal";
import { ResellerInvoiceModal } from "@/features/reseller-workspace/components/reseller-invoice-modal";
import { OrderQuickActionMenu } from "./order-quick-action-menu";
import { printOrderInvoice, printShippingLabel } from "../utils/print-utils";
import { getHumanLabel } from "../domain/state-machine";
import {
  Search,
  PlusCircle,
  Filter,
  RefreshCw,
  LayoutGrid,
  List,
  ShieldCheck,
  Truck,
  DollarSign,
  AlertTriangle,
  Clock,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  Download,
} from "lucide-react";

interface OrderManagementWorkspaceProps {
  initialOrders?: any[];
  userRole?: string;
}

export function OrderManagementWorkspace({
  initialOrders = [],
  userRole = "admin",
}: OrderManagementWorkspaceProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State Management
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeTabPreset, setActiveTabPreset] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [courierFilter, setCourierFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);

  // Selection & Views
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"auto" | "card" | "table">("auto");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Drawer / Modal targets
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedOrderForPickup, setSelectedOrderForPickup] = useState<any | null>(null);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState<boolean>(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedOrderForAddress, setSelectedOrderForAddress] = useState<any | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState<any | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  // Data Fetching
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        listOrdersAction({
          page,
          limit: 20,
          status: statusFilter === "all" ? undefined : statusFilter,
          type: typeFilter || undefined,
          search: search || undefined,
          dateFilter: dateFilter || undefined,
          district: districtFilter || undefined,
        }),
        getOrderDashboardStatsAction(),
      ]);

      if (ordersRes.success && ordersRes.data) {
        const d = ordersRes.data as any;
        setOrders(d.items as any[]);
        setTotalPages(d.totalPages || 1);
        setTotalCount(d.totalItems ?? d.total ?? d.items?.length ?? 0);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      toast.error("অর্ডার ডেটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search, dateFilter, districtFilter]);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Keyboard Shortcuts Listener (ORDER-004)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Cmd+F or Ctrl+F -> Focus Search
      if (isCmdOrCtrl && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Shift+A -> Select All (when not typing in an input)
      if (e.shiftKey && e.key.toUpperCase() === "A" && !isInput) {
        e.preventDefault();
        if (orders.length > 0) {
          if (selectedIds.size === orders.length) {
            setSelectedIds(new Set());
          } else {
            setSelectedIds(new Set(orders.map((o) => o.id || o._id)));
          }
        }
      }

      // Cmd+P or Ctrl+P -> Print selected invoices (when not typing)
      if (isCmdOrCtrl && e.key.toLowerCase() === "p" && !isInput) {
        e.preventDefault();
        if (selectedIds.size > 0) {
          const firstSelected = orders.find((o) => selectedIds.has(o.id || o._id));
          if (firstSelected) printOrderInvoice(firstSelected);
        } else {
          toast.info("প্রিন্ট করতে একটি অর্ডার সিলেক্ট করুন");
        }
      }

      // Esc -> Close Modals/Drawers
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
        setIsPickupModalOpen(false);
        setIsPaymentModalOpen(false);
        setIsAddressModalOpen(false);
        setIsMenuOpen(false);
        setShowFiltersModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [orders, selectedIds]);

  // Selection Logic
  const handleToggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(orders.map((o) => o.id || o._id));
      setSelectedIds(allIds);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one order");
      return;
    }
    if (action === "steadfast_pickup") {
      try {
        const selectedList = Array.from(selectedIds);
        let successCount = 0;
        for (const orderId of selectedList) {
          const generatedTracking = `STD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;
          const res = await assignCourierAction({
            orderId,
            courierId: "steadfast",
            courierName: "Steadfast Courier",
            trackingNumber: generatedTracking,
            trackingUrl: `https://steadfast.com.bd/t/${generatedTracking}`,
          });
          if (res.success) successCount++;
        }
        toast.success(`Steadfast pickup requested for ${successCount} orders!`);
        setSelectedIds(new Set());
        fetchOrders();
      } catch {
        toast.error("Failed to request Steadfast pickup");
      }
      return;
    }
    if (action === "delete_permanently") {
      if (!confirm(`Are you sure you want to PERMANENTLY delete ${selectedIds.size} selected orders from database? This action cannot be undone.`)) {
        return;
      }
      try {
        const { deleteOrderPermanentlyAction } = await import("../actions/order-actions");
        let deletedCount = 0;
        for (const orderId of Array.from(selectedIds)) {
          const res = await deleteOrderPermanentlyAction(orderId);
          if (res.success) deletedCount++;
        }
        toast.success(`Permanently deleted ${deletedCount} orders from database!`);
        setSelectedIds(new Set());
        fetchOrders();
      } catch {
        toast.error("Failed to delete selected orders");
      }
      return;
    }
    try {
      const { bulkUpdateOrderStatusAction } = await import("../actions/order-actions");
      const res = await bulkUpdateOrderStatusAction({
        orderIds: Array.from(selectedIds),
        status: action,
      });
      if (res.success) {
        toast.success(`Updated status for ${res.count || selectedIds.size} orders!`);
        setSelectedIds(new Set());
        fetchOrders();
      } else {
        toast.error(res.error || "Batch processing failed");
      }
    } catch {
      toast.error("Server error occurred");
    }
  };

  // View Details Drawer Trigger
  const handleViewDetails = (orderId: string) => {
    const found = orders.find((o) => (o.id || o._id) === orderId);
    if (found) {
      setSelectedOrderForDrawer(found);
      setIsDrawerOpen(true);
    }
  };

  // Quick Actions Menu Handler
  const handleQuickAction = async (action: string, targetOrder: any) => {
    if (action === "steadfast_pickup") {
      const orderId = targetOrder.id || targetOrder._id;
      const orderNum = targetOrder.orderNumber || `#${orderId.slice(-6)}`;
      const generatedTracking = `STD-${Date.now().toString().slice(-8)}`;
      try {
        const res = await assignCourierAction({
          orderId,
          courierId: "steadfast",
          courierName: "Steadfast Courier",
          trackingNumber: generatedTracking,
          trackingUrl: `https://steadfast.com.bd/t/${generatedTracking}`,
        });
        if (res.success) {
          toast.success(`Steadfast pickup request sent for ${orderNum}! Tracking: ${generatedTracking}`);
          fetchOrders();
        } else {
          toast.error(res.error || "Pickup request failed");
        }
      } catch {
        toast.error("Server error sending pickup request");
      }
    } else if (action === "pickup" || action === "courier") {
      setSelectedOrderForPickup(targetOrder);
      setIsPickupModalOpen(true);
    } else if (action === "edit_payment") {
      setSelectedOrderForPayment(targetOrder);
      setIsPaymentModalOpen(true);
    } else if (action === "edit_address") {
      setSelectedOrderForAddress(targetOrder);
      setIsAddressModalOpen(true);
    } else if (action === "edit" || action === "edit_order") {
      setSelectedOrderForEdit(targetOrder);
      setIsEditModalOpen(true);
    } else if (action === "print_invoice") {
      setSelectedOrderForInvoice(targetOrder);
      setIsInvoiceModalOpen(true);
    } else if (action === "print_slip") {
      printShippingLabel(targetOrder);
    } else if (action === "cancel") {
      if (confirm(`Are you sure you want to cancel order #${targetOrder.orderNumber || "this order"}?`)) {
        try {
          const { cancelOrderAction } = await import("../actions/order-actions");
          const res = await cancelOrderAction({
            orderId: targetOrder.id || targetOrder._id,
            reason: "Cancelled by Admin",
          });
          if (res.success) {
            toast.success("Order cancelled successfully!");
            fetchOrders();
          } else {
            toast.error(res.error || "Failed to cancel order.");
          }
        } catch {
          toast.error("Server error occurred");
        }
      }
    } else if (action === "delete_permanently") {
      const orderId = targetOrder.id || targetOrder._id;
      const orderNum = targetOrder.orderNumber || `#${orderId.slice(-6)}`;
      if (confirm(`Are you sure you want to PERMANENTLY delete order ${orderNum} from database? This action cannot be undone.`)) {
        try {
          const { deleteOrderPermanentlyAction } = await import("../actions/order-actions");
          const res = await deleteOrderPermanentlyAction(orderId);
          if (res.success) {
            toast.success(`Order ${orderNum} deleted permanently from database!`);
            fetchOrders();
          } else {
            toast.error(res.error || "Failed to delete order");
          }
        } catch {
          toast.error("Server error deleting order");
        }
      }
    } else if (action === "menu") {
      setSelectedOrderForMenu(targetOrder);
      setIsMenuOpen(true);
    } else {
      setSelectedOrderForDrawer(targetOrder);
      setIsDrawerOpen(true);
    }
  };

  // Preset Filters Config
  const PRESET_TABS = [
    { id: "all", label: "All Orders", status: "all", countKey: "all" },
    { id: "pending", label: "Pending", status: "pending", countKey: "pending" },
    { id: "confirmed", label: "Confirmed", status: "confirmed", countKey: "confirmed" },
    { id: "processing", label: "Packaging", status: "processing", countKey: "processing" },
    { id: "shipped", label: "In Courier", status: "shipped", countKey: "shipped" },
    { id: "delivered", label: "Delivered", status: "delivered", countKey: "delivered" },
    { id: "cancelled", label: "Cancelled", status: "cancelled", countKey: "cancelled" },
    { id: "returned", label: "Returned", status: "returned", countKey: "returned" },
  ];

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Search & Preset Filter Tabs */}
      <div className="space-y-3">
        {/* Preset Tabs Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_TABS.map((tab) => {
            const isActive = activeTabPreset === tab.id;
            const count = tab.countKey === "all" ? totalCount : stats[tab.countKey] ?? 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTabPreset(tab.id);
                  setStatusFilter(tab.status);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 border flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? "bg-slate-950/20 text-slate-950" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Bar & View Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search by Order ID, Phone, Customer, Tracking (Cmd+F to focus)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10 text-xs font-medium rounded-xl border-border bg-card"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className="h-10 text-xs font-bold border-border"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1.5 text-amber-500" />
              Filters
            </Button>

            {/* View Mode Toggle Switch */}
            <div className="flex items-center gap-0.5 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "card" ? "bg-card text-amber-500 shadow-xs" : "text-muted-foreground"
                }`}
                title="Mobile Card Layout"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table" ? "bg-card text-amber-500 shadow-xs" : "text-muted-foreground"
                }`}
                title="Desktop Table Layout"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Orders Content Layout */}
      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
          <p className="font-bold">অর্ডার লোড হচ্ছে...</p>
        </div>
      ) : (
        <>
          {/* Card View for Mobile (or when viewMode === 'card') */}
          <div
            className={
              viewMode === "table"
                ? "hidden md:block"
                : viewMode === "card"
                ? "block"
                : "block md:hidden"
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {orders.map((order) => (
                <OrderCardMobile
                  key={order.id || order._id}
                  order={order}
                  isSelected={selectedIds.has(order.id || order._id)}
                  onToggleSelect={handleToggleSelectOne}
                  onViewDetails={handleViewDetails}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </div>
          </div>

          {/* Table View for Desktop (or when viewMode === 'table') */}
          <div
            className={
              viewMode === "card"
                ? "hidden"
                : viewMode === "table"
                ? "block"
                : "hidden md:block"
            }
          >
            <OrderTableDesktop
              orders={orders}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectOne={handleToggleSelectOne}
              onViewDetails={handleViewDetails}
              onQuickAction={handleQuickAction}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-border/80 pt-4 text-xs">
            <p className="text-muted-foreground font-medium">
              Showing <span className="font-mono font-bold text-foreground">{orders.length}</span> of{" "}
              <span className="font-mono font-bold text-foreground">{totalCount}</span> orders
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-8 text-xs font-bold border-border"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="font-mono font-extrabold text-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="h-8 text-xs font-bold border-border"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Floating Selection & Bulk Action Bar */}
      <OrderBulkActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkAction={handleBulkAction}
      />

      {/* Order Details Drawer / Modal */}
      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={selectedOrderForDrawer}
        onOrderUpdated={fetchOrders}
      />

      {/* Pickup Request Modal Workflow */}
      <PickupRequestModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        order={selectedOrderForPickup}
        onSuccess={fetchOrders}
      />

      {/* Edit COD & Payment Details Modal */}
      <EditPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={selectedOrderForPayment}
        onSuccess={fetchOrders}
      />

      {/* Edit Shipping Address Modal */}
      <EditAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        order={selectedOrderForAddress}
        onSuccess={fetchOrders}
      />

      {/* Full Order Edit Modal */}
      <EditResellerOrderModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        order={selectedOrderForEdit}
        onSuccess={fetchOrders}
      />

      {/* Printable & Downloadable Invoice Modal */}
      <ResellerInvoiceModal
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        order={selectedOrderForInvoice}
      />

      {/* 3-Dots Quick Action Menu */}
      <OrderQuickActionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        order={selectedOrderForMenu}
        onSelectAction={handleQuickAction}
      />

      {/* Mobile App Dock Bottom Navigation Bar (Screenshot Inspired) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-card/95 backdrop-blur-lg border-t border-border px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => router.push("/dashboard/products")}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground text-[10px] font-bold"
        >
          <PackageCheck className="h-5 w-5" />
          Product
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/orders")}
          className="flex flex-col items-center gap-0.5 text-emerald-600 font-extrabold text-[10px]"
        >
          <List className="h-5 w-5" />
          Orders
        </button>

        {/* Central Floating Action Button */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/orders/create")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg font-black -mt-5 border-4 border-card hover:bg-emerald-700 transition-transform active:scale-95"
        >
          <PlusCircle className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/analytics")}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground text-[10px] font-bold"
        >
          <SlidersHorizontal className="h-5 w-5" />
          Reports
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground text-[10px] font-bold"
        >
          <ShieldCheck className="h-5 w-5" />
          Tasks
        </button>
      </div>
    </div>
  );
}

export default OrderManagementWorkspace;
