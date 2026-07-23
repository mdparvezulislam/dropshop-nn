"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  createShipmentAction,
  bookShipmentAction,
  cancelShipmentAction,
  bulkBookShipmentsAction,
  listShipmentsAction,
  saveCourierConfigAction,
  listCourierConfigsAction,
  testCourierConnectionAction,
  createPickupAddressAction,
  listPickupAddressesAction,
  syncShipmentTrackingAction,
  getLogisticsSummaryAction,
  getCourierHealthMetricsAction,
  listWebhookEventsAction,
  listLogisticsAuditLogsAction,
  listRetryQueueAction,
  retryLogisticsTaskAction,
} from "@/features/courier/actions/courier-actions";
import {
  recordDeliveryAttemptAction,
  reassignCourierAction,
  recordPartialDeliveryAction,
  manualInterventionAction,
  createDeliveryReturnAction,
  updateReturnStatusAction,
  createRTSAction,
  inspectRTSAction,
  createDeliveryDisputeAction,
  escalateDisputeAction,
  listDeliveryOpsDataAction,
} from "@/features/courier/actions/delivery-ops-actions";
import { toast } from "sonner";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  PlusCircle,
  MapPin,
  Activity,
  ShieldCheck,
  Zap,
  Sliders,
  AlertTriangle,
  Play,
  RotateCcw,
  ExternalLink,
  Layers,
  FileCheck,
  Building,
  AlertCircle,
  Undo2,
  FileWarning,
  ShieldAlert,
  ArrowRightLeft,
  DollarSign,
  UserCheck,
  Settings,
  Scale,
  Compass,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminCourierHubPage() {
  const { data: session } = useSession() as any;

  const [activeTab, setActiveTab] = React.useState<
    | "overview"
    | "ops_dashboard"
    | "failed_delivery"
    | "return_rts"
    | "partial_delivery"
    | "disputes"
    | "exception_queue"
    | "shipping_rules"
    | "cod_monitoring"
    | "shipments"
    | "tracking"
    | "settings"
    | "pickup"
    | "webhooks"
    | "retry"
    | "health"
  >("ops_dashboard");

  const tabSliderRef = React.useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: "left" | "right") => {
    if (tabSliderRef.current) {
      tabSliderRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<any>(null);
  const [healthMetrics, setHealthMetrics] = React.useState<any[]>([]);
  const [shipmentsData, setShipmentsData] = React.useState<{ items: any[]; total: number }>({ items: [], total: 0 });
  const [courierConfigs, setCourierConfigs] = React.useState<any[]>([]);
  const [pickupAddresses, setPickupAddresses] = React.useState<any[]>([]);
  const [webhookEvents, setWebhookEvents] = React.useState<any[]>([]);
  const [retryQueue, setRetryQueue] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

  // LOGISTICS-HUB-001B Delivery Ops Data
  const [opsData, setOpsData] = React.useState<{
    returns: any[];
    rtsList: any[];
    disputes: any[];
    escalations: any[];
    zones: any[];
    rules: any[];
    costRules: any[];
    exceptions: any;
    slaWarnings: any[];
    codSummary: any;
  }>({
    returns: [],
    rtsList: [],
    disputes: [],
    escalations: [],
    zones: [],
    rules: [],
    costRules: [],
    exceptions: { failedDeliveries: [], lostParcels: [], delayedShipments: [], damagedShipments: [] },
    slaWarnings: [],
    codSummary: null,
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [providerFilter, setProviderFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Selection & Tracking Detail
  const [selectedShipmentIds, setSelectedShipmentIds] = React.useState<string[]>([]);
  const [activeTrackingShipment, setActiveTrackingShipment] = React.useState<any>(null);

  // Modals & Submissions
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showReassignModal, setShowReassignModal] = React.useState(false);
  const [showAttemptModal, setShowAttemptModal] = React.useState(false);
  const [showReturnModal, setShowReturnModal] = React.useState(false);
  const [showDisputeModal, setShowDisputeModal] = React.useState(false);
  const [showManualModal, setShowManualModal] = React.useState(false);

  // Reassign Form State
  const [reassignShipmentId, setReassignShipmentId] = React.useState("");
  const [reassignNewCourier, setReassignNewCourier] = React.useState("pathao");
  const [reassignReason, setReassignReason] = React.useState("");

  // Attempt Form State
  const [attemptShipmentId, setAttemptShipmentId] = React.useState("");
  const [attemptStatus, setAttemptStatus] = React.useState<any>("failed");
  const [attemptReason, setAttemptReason] = React.useState<any>("customer_unavailable");
  const [attemptNotes, setAttemptNotes] = React.useState("");

  // Return Form State
  const [returnShipmentId, setReturnShipmentId] = React.useState("");
  const [returnReason, setReturnReason] = React.useState<any>("customer_refused");
  const [returnNotes, setReturnNotes] = React.useState("");

  // Dispute Form State
  const [disputeShipmentId, setDisputeShipmentId] = React.useState("");
  const [disputeType, setDisputeType] = React.useState<any>("courier_lost_package");
  const [disputeNote, setDisputeNote] = React.useState("");

  // Manual Action Form State
  const [manualShipmentId, setManualShipmentId] = React.useState("");
  const [manualActionType, setManualActionType] = React.useState<any>("force_status");
  const [manualTargetStatus, setManualTargetStatus] = React.useState("delivered");
  const [manualNotes, setManualNotes] = React.useState("");

  // Action loaders
  const [submittingAction, setSubmittingAction] = React.useState(false);
  const [testingConnection, setTestingConnection] = React.useState<Record<string, boolean>>({});
  const [bookingInProgress, setBookingInProgress] = React.useState<Record<string, boolean>>({});
  const [syncingInProgress, setSyncingInProgress] = React.useState<Record<string, boolean>>({});

  // Form states for new shipment & pickup
  const [newOrderId, setNewOrderId] = React.useState("");
  const [newOrderNum, setNewOrderNum] = React.useState("");
  const [newProvider, setNewProvider] = React.useState("steadfast");
  const [newCodAmount, setNewCodAmount] = React.useState("");
  const [newRecipientName, setNewRecipientName] = React.useState("");
  const [newRecipientPhone, setNewRecipientPhone] = React.useState("");
  const [newRecipientAddress, setNewRecipientAddress] = React.useState("");
  const [newRecipientDistrict, setNewRecipientDistrict] = React.useState("Dhaka");
  const [newRecipientArea, setNewRecipientArea] = React.useState("Mirpur");

  const [addrName, setAddrName] = React.useState("");
  const [addrPerson, setAddrPerson] = React.useState("");
  const [addrPhone, setAddrPhone] = React.useState("");
  const [addrDistrict, setAddrDistrict] = React.useState("Dhaka");
  const [addrArea, setAddrArea] = React.useState("Dhanmondi");
  const [addrStreet, setAddrStreet] = React.useState("");
  const [addrIsDefault, setAddrIsDefault] = React.useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const sumRes = await getLogisticsSummaryAction();
      if (sumRes.success) setSummary(sumRes.data);

      const healthRes = await getCourierHealthMetricsAction();
      if (healthRes.success && healthRes.data) setHealthMetrics(healthRes.data);

      const shipRes = await listShipmentsAction({
        search: searchQuery,
        provider: providerFilter,
        status: statusFilter,
        limit: 100,
      });
      if (shipRes.success && shipRes.data) setShipmentsData(shipRes.data);

      const configRes = await listCourierConfigsAction();
      if (configRes.success && configRes.data) setCourierConfigs(configRes.data);

      const addrRes = await listPickupAddressesAction();
      if (addrRes.success && addrRes.data) setPickupAddresses(addrRes.data);

      const whRes = await listWebhookEventsAction();
      if (whRes.success && whRes.data) setWebhookEvents(whRes.data);

      const retryRes = await listRetryQueueAction();
      if (retryRes.success && retryRes.data) setRetryQueue(retryRes.data);

      const audRes = await listLogisticsAuditLogsAction();
      if (audRes.success && audRes.data) setAuditLogs(audRes.data);

      const opsRes = await listDeliveryOpsDataAction();
      if (opsRes.success && opsRes.data) setOpsData(opsRes.data);
    } catch (err) {
      toast.error("Failed to load delivery operations center metadata");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAllData();
  }, [searchQuery, providerFilter, statusFilter]);

  const handleBookShipment = async (shipmentId: string) => {
    setBookingInProgress((prev) => ({ ...prev, [shipmentId]: true }));
    try {
      const res = await bookShipmentAction({ shipmentId });
      if (res.success) {
        toast.success("Shipment booked with courier successfully");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to book shipment");
      }
    } catch (err: any) {
      toast.error(err.message || "Booking error");
    } finally {
      setBookingInProgress((prev) => ({ ...prev, [shipmentId]: false }));
    }
  };

  const handleSyncTracking = async (shipmentId: string) => {
    setSyncingInProgress((prev) => ({ ...prev, [shipmentId]: true }));
    try {
      const res = await syncShipmentTrackingAction({ shipmentId });
      if (res.success) {
        toast.success("Shipment live tracking synced");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to sync tracking");
      }
    } catch (err: any) {
      toast.error(err.message || "Tracking sync error");
    } finally {
      setSyncingInProgress((prev) => ({ ...prev, [shipmentId]: false }));
    }
  };

  // Handlers for Delivery Ops Actions
  const handleReassignCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignShipmentId || !reassignReason) {
      toast.error("Please fill in shipment ID and reassignment reason");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await reassignCourierAction({
        shipmentId: reassignShipmentId,
        newCourier: reassignNewCourier,
        reason: reassignReason,
      });
      if (res.success) {
        toast.success(`Shipment reassigned to ${reassignNewCourier.toUpperCase()}`);
        setShowReassignModal(false);
        setReassignReason("");
        loadAllData();
      } else {
        toast.error(res.error || "Courier reassignment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Reassignment error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRecordAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attemptShipmentId) {
      toast.error("Please select or enter shipment ID");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await recordDeliveryAttemptAction({
        shipmentId: attemptShipmentId,
        status: attemptStatus,
        failureReason: attemptStatus === "failed" ? attemptReason : undefined,
        notes: attemptNotes,
      });
      if (res.success) {
        toast.success("Delivery attempt recorded");
        setShowAttemptModal(false);
        setAttemptNotes("");
        loadAllData();
      } else {
        toast.error(res.error || "Recording attempt failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Recording error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnShipmentId) {
      toast.error("Please select or enter shipment ID");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await createDeliveryReturnAction({
        shipmentId: returnShipmentId,
        reason: returnReason,
        notes: returnNotes,
      });
      if (res.success) {
        toast.success(`Return ticket #${res.data.returnNumber} created`);
        setShowReturnModal(false);
        setReturnNotes("");
        loadAllData();
      } else {
        toast.error(res.error || "Return initiation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Return creation error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeShipmentId) {
      toast.error("Please select or enter shipment ID");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await createDeliveryDisputeAction({
        shipmentId: disputeShipmentId,
        disputeType,
        initialNote: disputeNote,
      });
      if (res.success) {
        toast.success(`Dispute #${res.data.disputeNumber} opened`);
        setShowDisputeModal(false);
        setDisputeNote("");
        loadAllData();
      } else {
        toast.error(res.error || "Dispute creation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Dispute error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleManualIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualShipmentId || !manualNotes) {
      toast.error("Please fill in shipment ID and intervention notes");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await manualInterventionAction({
        shipmentId: manualShipmentId,
        actionType: manualActionType,
        targetStatus: manualTargetStatus,
        notes: manualNotes,
      });
      if (res.success) {
        toast.success("Manual intervention executed and logged to audit trail");
        setShowManualModal(false);
        setManualNotes("");
        loadAllData();
      } else {
        toast.error(res.error || "Manual intervention failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Intervention error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderId || !newRecipientName || !newRecipientPhone || !newCodAmount) {
      toast.error("Please fill in all mandatory shipment fields");
      return;
    }
    setSubmittingAction(true);
    try {
      const codCents = Math.floor(parseFloat(newCodAmount) * 100);
      const res = await createShipmentAction({
        orderId: newOrderId,
        orderNumber: newOrderNum || newOrderId,
        provider: newProvider,
        codAmount: codCents,
        recipient: {
          name: newRecipientName,
          phone: newRecipientPhone,
          address: newRecipientAddress,
          district: newRecipientDistrict,
          area: newRecipientArea,
        },
      });

      if (res.success) {
        toast.success(`Shipment created in draft! Number: ${res.data.shipmentNumber}`);
        setShowCreateModal(false);
        setNewOrderId("");
        setNewOrderNum("");
        setNewCodAmount("");
        setNewRecipientName("");
        setNewRecipientPhone("");
        setNewRecipientAddress("");
        loadAllData();
      } else {
        toast.error(res.error || "Shipment creation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Creation error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreatePickupAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPerson || !addrPhone || !addrStreet) {
      toast.error("Please fill in all mandatory address fields");
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await createPickupAddressAction({
        name: addrName,
        contactPerson: addrPerson,
        phone: addrPhone,
        district: addrDistrict,
        area: addrArea,
        address: addrStreet,
        isDefault: addrIsDefault,
      });

      if (res.success) {
        toast.success("Pickup address added to platform warehouse registry");
        setShowAddressModal(false);
        setAddrName("");
        setAddrPerson("");
        setAddrPhone("");
        setAddrStreet("");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to create address");
      }
    } catch (err: any) {
      toast.error(err.message || "Address creation error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const exportManifest = () => {
    if (shipmentsData.items.length === 0) {
      toast.error("No shipments to export");
      return;
    }
    const headers = ["ShipmentNum", "OrderNum", "Provider", "TrackingCode", "Recipient", "Phone", "COD (BDT)", "Status"];
    const rows = shipmentsData.items.map((s) => [
      s.shipmentNumber,
      s.orderNumber,
      s.provider,
      s.trackingCode,
      s.recipient?.name,
      s.recipient?.phone,
      (s.codAmount / 100).toFixed(2),
      s.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery_operations_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Delivery Operations Manifest exported to CSV");
  };

  const formatCurrency = (amount: number) => `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "in_transit":
      case "out_for_delivery":
        return <Badge className="bg-indigo-600 text-white">In Transit</Badge>;
      case "booked":
      case "picked_up":
        return <Badge variant="outline" className="border-indigo-500 text-indigo-400">Booked</Badge>;
      case "pending_booking":
      case "draft":
        return <Badge variant="warning">Pending Booking</Badge>;
      case "cancelled":
      case "returned":
      case "failed":
        return <Badge variant="destructive">{status.replace("_", " ")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 10 Metric Cards for Delivery Operations Dashboard
  const todayDeliveries = shipmentsData.items.filter((s) => s.status === "out_for_delivery" || s.status === "delivered").length;
  const outForDelivery = shipmentsData.items.filter((s) => s.status === "out_for_delivery").length;
  const successfulDeliveries = summary?.delivered || 0;
  const failedDeliveries = summary?.failedBooking || 0;
  const returnsCount = summary?.returned || 0;
  const rtsCount = opsData.rtsList.length;
  const partialDeliveries = summary?.partialDelivered || 0;
  const pendingInvestigations = opsData.disputes.filter((d) => d.status === "under_investigation").length;
  const disputesCount = opsData.disputes.length;
  const slaWarningsCount = opsData.slaWarnings.length;

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Enterprise Delivery Operations Center</h1>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-950/40 text-[10px]">
              LOGISTICS-HUB-001B
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Post-Booking Delivery Operations, Exception Management, Returns, RTS, Disputes, SLA Monitoring & COD Reconciliation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={exportManifest} size="sm" variant="outline" className="border-slate-800 text-xs bg-slate-900 gap-1.5">
            <Download className="h-3.5 w-3.5 text-indigo-400" /> Export Manifest
          </Button>
          <Button onClick={() => setShowReassignModal(true)} size="sm" variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-950/40 text-xs gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Reassign Courier
          </Button>
          <Button onClick={() => setShowAttemptModal(true)} size="sm" variant="outline" className="border-slate-800 text-xs bg-slate-900 gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> + Delivery Attempt
          </Button>
          <Button onClick={() => setShowReturnModal(true)} size="sm" variant="outline" className="border-rose-500/40 text-rose-300 bg-rose-950/40 text-xs gap-1.5">
            <Undo2 className="h-3.5 w-3.5" /> Initiate Return/RTS
          </Button>
          <Button onClick={() => setShowDisputeModal(true)} size="sm" variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-950/40 text-xs gap-1.5">
            <FileWarning className="h-3.5 w-3.5" /> + Open Dispute
          </Button>
          <Button onClick={() => setShowManualModal(true)} size="sm" variant="outline" className="border-slate-800 text-xs bg-slate-900 gap-1.5">
            <Settings className="h-3.5 w-3.5 text-sky-400" /> Manual Override
          </Button>
          <Button onClick={loadAllData} size="sm" variant="ghost" disabled={loading} className="text-slate-400 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Primary Navigation Tabs Slider */}
      <div className="relative flex items-center border-b border-slate-800 pb-2 group">
        <button
          onClick={() => scrollTabs("left")}
          className="absolute left-0 z-10 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-md backdrop-blur transition-all"
          title="Scroll Left"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={tabSliderRef}
          className="flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-none px-8 text-xs w-full"
        >
          <button
            onClick={() => setActiveTab("ops_dashboard")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "ops_dashboard" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Operations Dashboard
          </button>
          <button
            onClick={() => setActiveTab("failed_delivery")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "failed_delivery" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <XCircle className="h-3.5 w-3.5 text-rose-400" /> Failed Delivery Center ({failedDeliveries})
          </button>
          <button
            onClick={() => setActiveTab("return_rts")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "return_rts" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Undo2 className="h-3.5 w-3.5 text-amber-400" /> Return & RTS Center ({returnsCount + rtsCount})
          </button>
          <button
            onClick={() => setActiveTab("partial_delivery")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "partial_delivery" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-sky-400" /> Partial Delivery ({partialDeliveries})
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "disputes" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-purple-400" /> Dispute Center ({disputesCount})
          </button>
          <button
            onClick={() => setActiveTab("exception_queue")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "exception_queue" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" /> Exception Queue
          </button>
          <button
            onClick={() => setActiveTab("shipping_rules")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "shipping_rules" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" /> Rules & Zones
          </button>
          <button
            onClick={() => setActiveTab("cod_monitoring")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "cod_monitoring" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> COD Settlement
          </button>
          <button
            onClick={() => setActiveTab("shipments")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "shipments" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Package className="h-3.5 w-3.5 text-slate-300" /> All Shipments
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "health" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" /> Courier SLA & Health
          </button>
        </div>

        <button
          onClick={() => scrollTabs("right")}
          className="absolute right-0 z-10 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-md backdrop-blur transition-all"
          title="Scroll Right"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* TAB 1: OPERATIONS DASHBOARD */}
      {activeTab === "ops_dashboard" && (
        <div className="space-y-6">
          {/* 10 Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Today's Deliveries</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-white">{todayDeliveries}</p>
                  <Clock className="h-4 w-4 text-indigo-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Out For Delivery</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-sky-400">{outForDelivery}</p>
                  <Truck className="h-4 w-4 text-sky-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Successful Deliveries</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-emerald-400">{successfulDeliveries}</p>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Failed Deliveries</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-rose-400">{failedDeliveries}</p>
                  <XCircle className="h-4 w-4 text-rose-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Returns</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-amber-400">{returnsCount}</p>
                  <Undo2 className="h-4 w-4 text-amber-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">RTS (Return To Sender)</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-orange-400">{rtsCount}</p>
                  <RotateCcw className="h-4 w-4 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Partial Deliveries</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-purple-400">{partialDeliveries}</p>
                  <Scale className="h-4 w-4 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Pending Investigations</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-yellow-400">{pendingInvestigations}</p>
                  <Search className="h-4 w-4 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Disputes</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-rose-500">{disputesCount}</p>
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">SLA Warnings</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-amber-500">{slaWarningsCount}</p>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courier SLA Warnings Banner */}
          {opsData.slaWarnings.length > 0 && (
            <Card className="bg-amber-950/30 border-amber-500/30 text-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Live Courier SLA Warnings ({opsData.slaWarnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {opsData.slaWarnings.map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-amber-500/20">
                    <div>
                      <span className="font-semibold text-white">Shipment #{w.shipmentNumber}:</span>{" "}
                      <span className="text-amber-300">{w.warningType}</span> ({w.delayHours} hrs delay)
                    </div>
                    <Button
                      onClick={() => {
                        setReassignShipmentId(w.shipmentId);
                        setShowReassignModal(true);
                      }}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-500 text-[10px] h-7 px-2"
                    >
                      Reassign Courier
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Delivery Operations Matrix */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                <span>Active Delivery Operations Monitor</span>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[10px]">
                  Real-time Feed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs">Shipment #</TableHead>
                    <TableHead className="text-xs">Order #</TableHead>
                    <TableHead className="text-xs">Courier</TableHead>
                    <TableHead className="text-xs">Recipient</TableHead>
                    <TableHead className="text-xs">District/Area</TableHead>
                    <TableHead className="text-xs">COD Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Quick Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipmentsData.items.slice(0, 10).map((s) => (
                    <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs font-semibold text-indigo-400">{s.shipmentNumber}</TableCell>
                      <TableCell className="text-xs text-slate-300">{s.orderNumber}</TableCell>
                      <TableCell className="text-xs uppercase font-medium text-slate-200">{s.provider}</TableCell>
                      <TableCell className="text-xs text-slate-300">{s.recipient?.name}</TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {s.recipient?.district}, {s.recipient?.area}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-400">{formatCurrency(s.codAmount)}</TableCell>
                      <TableCell className="text-xs">{getStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-xs text-right space-x-1">
                        <Button
                          onClick={() => {
                            setAttemptShipmentId(s.id);
                            setShowAttemptModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] border-slate-700"
                        >
                          + Attempt
                        </Button>
                        <Button
                          onClick={() => {
                            setReassignShipmentId(s.id);
                            setShowReassignModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] border-amber-500/40 text-amber-300"
                        >
                          Reassign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: FAILED DELIVERY CENTER */}
      {activeTab === "failed_delivery" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-400" /> Failed Delivery Recovery Center
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Manage delivery failures, failure reasons, retry attempts, and courier reassignment.</p>
            </div>
            <Button onClick={() => setShowAttemptModal(true)} size="sm" className="bg-rose-600 hover:bg-rose-500 text-xs">
              + Record Failed Attempt
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Shipment #</TableHead>
                  <TableHead className="text-xs">Order #</TableHead>
                  <TableHead className="text-xs">Courier</TableHead>
                  <TableHead className="text-xs">Recipient Phone</TableHead>
                  <TableHead className="text-xs">Failure Reason</TableHead>
                  <TableHead className="text-xs">Retry Count</TableHead>
                  <TableHead className="text-xs text-right">Recovery Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipmentsData.items
                  .filter((s) => s.status === "failed" || s.retryCount > 0)
                  .map((s) => (
                    <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs font-semibold text-rose-400">{s.shipmentNumber}</TableCell>
                      <TableCell className="text-xs text-slate-300">{s.orderNumber}</TableCell>
                      <TableCell className="text-xs uppercase font-medium">{s.provider}</TableCell>
                      <TableCell className="text-xs text-slate-300">{s.recipient?.phone}</TableCell>
                      <TableCell className="text-xs text-amber-300 font-medium">{s.lastFailureReason || "Customer Unavailable"}</TableCell>
                      <TableCell className="text-xs font-bold text-white">{s.retryCount || 1}</TableCell>
                      <TableCell className="text-xs text-right space-x-1.5">
                        <Button
                          onClick={() => {
                            setAttemptShipmentId(s.id);
                            setAttemptStatus("rescheduled");
                            setShowAttemptModal(true);
                          }}
                          size="sm"
                          className="h-7 px-2.5 text-[10px] bg-emerald-600 hover:bg-emerald-500"
                        >
                          Retry Delivery
                        </Button>
                        <Button
                          onClick={() => {
                            setReassignShipmentId(s.id);
                            setShowReassignModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-[10px] border-amber-500/40 text-amber-300"
                        >
                          Reassign Courier
                        </Button>
                        <Button
                          onClick={() => {
                            setReturnShipmentId(s.id);
                            setShowReturnModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-[10px] border-rose-500/40 text-rose-300"
                        >
                          Initiate Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: RETURN & RTS CENTER */}
      {activeTab === "return_rts" && (
        <div className="space-y-6">
          {/* Returns Table */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Undo2 className="h-4 w-4 text-amber-400" /> Return Management Lifecycle
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Track return initiation, transit, reception, and completion.</p>
              </div>
              <Button onClick={() => setShowReturnModal(true)} size="sm" className="bg-amber-600 hover:bg-amber-500 text-xs">
                + Initiate New Return
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs">Return #</TableHead>
                    <TableHead className="text-xs">Shipment ID</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Return Charge</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Update Lifecycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opsData.returns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                        No active return requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    opsData.returns.map((r) => (
                      <TableRow key={r.id} className="border-slate-800 hover:bg-slate-800/40">
                        <TableCell className="text-xs font-semibold text-amber-400">{r.returnNumber}</TableCell>
                        <TableCell className="text-xs text-slate-300">{r.shipmentId}</TableCell>
                        <TableCell className="text-xs capitalize text-slate-200">{r.reason.replace("_", " ")}</TableCell>
                        <TableCell className="text-xs font-semibold text-rose-400">{formatCurrency(r.returnChargeCents)}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="warning">{r.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-right space-x-1">
                          <Button
                            onClick={async () => {
                              await updateReturnStatusAction({ returnId: r.id, status: "return_completed" });
                              toast.success("Return marked as completed");
                              loadAllData();
                            }}
                            size="sm"
                            className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500"
                          >
                            Mark Complete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* RTS Table */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-orange-400" /> Return To Sender (RTS) & Package Inspection
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Manage physical package inspection, condition grading, and stock return.</p>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs">RTS #</TableHead>
                    <TableHead className="text-xs">Shipment ID</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Condition</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opsData.rtsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                        No RTS records active.
                      </TableCell>
                    </TableRow>
                  ) : (
                    opsData.rtsList.map((r) => (
                      <TableRow key={r.id} className="border-slate-800 hover:bg-slate-800/40">
                        <TableCell className="text-xs font-semibold text-orange-400">{r.rtsNumber}</TableCell>
                        <TableCell className="text-xs text-slate-300">{r.shipmentId}</TableCell>
                        <TableCell className="text-xs text-slate-200">{r.reason}</TableCell>
                        <TableCell className="text-xs capitalize font-medium text-amber-300">{r.inspectionCondition || "Pending Inspection"}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                            {r.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-right space-x-1">
                          <Button
                            onClick={async () => {
                              await inspectRTSAction({ rtsId: r.id, condition: "intact", notes: "Inspected at warehouse" });
                              toast.success("Package marked as intact");
                              loadAllData();
                            }}
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[10px] border-emerald-500/40 text-emerald-300"
                          >
                            Inspect Intact
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: PARTIAL DELIVERY MANAGER */}
      {activeTab === "partial_delivery" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-sky-400" /> Partial Delivery & COD Adjustment Manager
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">Manage orders where customers accepted partial items and paid partial COD balance.</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Shipment #</TableHead>
                  <TableHead className="text-xs">Order #</TableHead>
                  <TableHead className="text-xs">Original COD</TableHead>
                  <TableHead className="text-xs">Collected COD</TableHead>
                  <TableHead className="text-xs">Remaining Balance</TableHead>
                  <TableHead className="text-xs text-right">Adjustment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipmentsData.items
                  .filter((s) => s.status === "partial_delivered")
                  .map((s) => (
                    <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs font-semibold text-purple-400">{s.shipmentNumber}</TableCell>
                      <TableCell className="text-xs text-slate-300">{s.orderNumber}</TableCell>
                      <TableCell className="text-xs font-semibold text-white">{formatCurrency(s.codAmount)}</TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-400">{formatCurrency(Math.floor(s.codAmount * 0.5))}</TableCell>
                      <TableCell className="text-xs font-semibold text-amber-400">{formatCurrency(Math.floor(s.codAmount * 0.5))}</TableCell>
                      <TableCell className="text-xs text-right">
                        <Button
                          onClick={async () => {
                            await recordPartialDeliveryAction({ shipmentId: s.id, partialCodCents: Math.floor(s.codAmount * 0.5), notes: "Manual adjustment" });
                            toast.success("Partial delivery COD adjusted");
                            loadAllData();
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] border-purple-500/40 text-purple-300"
                        >
                          Record Adjustment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: DISPUTES & ESCALATIONS */}
      {activeTab === "disputes" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-purple-400" /> Delivery Dispute Center & Escalations (Level 1–3)
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Investigate lost parcels, damaged shipments, COD differences, and escalation levels.</p>
            </div>
            <Button onClick={() => setShowDisputeModal(true)} size="sm" className="bg-purple-600 hover:bg-purple-500 text-xs">
              + Open New Dispute
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Dispute #</TableHead>
                  <TableHead className="text-xs">Shipment ID</TableHead>
                  <TableHead className="text-xs">Dispute Type</TableHead>
                  <TableHead className="text-xs">Assigned Staff</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Escalate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opsData.disputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                      No open delivery disputes recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  opsData.disputes.map((d) => (
                    <TableRow key={d.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs font-semibold text-purple-400">{d.disputeNumber}</TableCell>
                      <TableCell className="text-xs text-slate-300">{d.shipmentId}</TableCell>
                      <TableCell className="text-xs capitalize text-slate-200">{d.disputeType.replace("_", " ")}</TableCell>
                      <TableCell className="text-xs text-slate-300">{d.assignedStaffName || "Unassigned"}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="warning">{d.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right space-x-1">
                        <Button
                          onClick={async () => {
                            await escalateDisputeAction({
                              disputeId: d.id,
                              level: "level_2",
                              assignedRole: "Manager",
                              reason: "SLA response deadline passed",
                            });
                            toast.success("Dispute escalated to Level 2 Manager");
                            loadAllData();
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] border-rose-500/40 text-rose-300"
                        >
                          Escalate L2
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: EXCEPTION QUEUE */}
      {activeTab === "exception_queue" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-rose-400">Failed Deliveries Queue ({opsData.exceptions.failedDeliveries.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {opsData.exceptions.failedDeliveries.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-semibold text-white">{s.shipmentNumber}</p>
                    <p className="text-slate-400">{s.lastFailureReason || "Failed booking / attempt"}</p>
                  </div>
                  <Button
                    onClick={() => handleBookShipment(s.id)}
                    disabled={bookingInProgress[s.id]}
                    size="sm"
                    className="h-6 text-[10px] bg-indigo-600 hover:bg-indigo-500"
                  >
                    {bookingInProgress[s.id] ? "Booking..." : "Retry Book"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-amber-400">Delayed Shipments Queue ({opsData.exceptions.delayedShipments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {opsData.exceptions.delayedShipments.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-semibold text-white">{s.shipmentNumber}</p>
                    <p className="text-slate-400">Courier: {s.provider.toUpperCase()}</p>
                  </div>
                  <Button
                    onClick={() => handleSyncTracking(s.id)}
                    disabled={syncingInProgress[s.id]}
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px]"
                  >
                    {syncingInProgress[s.id] ? "Syncing..." : "Sync Live Status"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 7: SHIPPING RULES & ZONES */}
      {activeTab === "shipping_rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-emerald-400">Delivery Zones Registry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                <p className="font-semibold text-white">Zone Dhaka Inside City (ZONE-DHK-01)</p>
                <p className="text-slate-400">Division: Dhaka | District: Dhaka | Area: All | Category: Inside City</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                <p className="font-semibold text-white">Zone Outside City (ZONE-OUT-01)</p>
                <p className="text-slate-400">Division: All | District: Outside Dhaka | Category: Outside City</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-emerald-400">Courier Preference & Cost Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                <p className="font-semibold text-white">Rule: Preferred Dhaka Courier (Steadfast)</p>
                <p className="text-slate-400">Inside City Flat Rate: ৳60.00 | Max Weight: 2000g</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                <p className="font-semibold text-white">Rule: Preferred National Courier (Pathao / RedX)</p>
                <p className="text-slate-400">Outside City Rate: ৳120.00 | Extra Weight: ৳20/kg</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 8: COD MONITORING */}
      {activeTab === "cod_monitoring" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" /> COD Settlement & Reconciliation Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Expected COD Total</p>
                <p className="text-xl font-bold text-white mt-1">{formatCurrency(opsData.codSummary?.expectedCODCents || 0)}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Collected COD (Delivered)</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(opsData.codSummary?.collectedCODCents || 0)}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Pending In-Transit COD</p>
                <p className="text-xl font-bold text-amber-400 mt-1">{formatCurrency(opsData.codSummary?.pendingCODCents || 0)}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Settlement Ready Orders</p>
                <p className="text-xl font-bold text-sky-400 mt-1">{opsData.codSummary?.settlementReadyCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL: REASSIGN COURIER */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Reassign Courier Provider</h3>
            <form onSubmit={handleReassignCourier} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Target Shipment ID *</label>
                <Input
                  value={reassignShipmentId}
                  onChange={(e) => setReassignShipmentId(e.target.value)}
                  placeholder="e.g. 64b1f... or shipment ID"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">New Courier *</label>
                <select
                  value={reassignNewCourier}
                  onChange={(e) => setReassignNewCourier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                >
                  <option value="pathao">Pathao Express</option>
                  <option value="steadfast">Steadfast Courier</option>
                  <option value="redx">RedX Logistics</option>
                  <option value="paperfly">Paperfly Courier</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Reassignment Reason *</label>
                <Input
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Steadfast coverage limit in remote district"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowReassignModal(false)} variant="ghost" size="sm" className="text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAction} size="sm" className="bg-amber-600 hover:bg-amber-500">
                  Execute Reassignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD ATTEMPT */}
      {showAttemptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Delivery Attempt</h3>
            <form onSubmit={handleRecordAttempt} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Shipment ID *</label>
                <Input
                  value={attemptShipmentId}
                  onChange={(e) => setAttemptShipmentId(e.target.value)}
                  placeholder="Shipment ID"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Attempt Status *</label>
                <select
                  value={attemptStatus}
                  onChange={(e) => setAttemptStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                >
                  <option value="failed">Failed Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
              {attemptStatus === "failed" && (
                <div>
                  <label className="text-xs font-medium text-slate-300">Failure Reason *</label>
                  <select
                    value={attemptReason}
                    onChange={(e) => setAttemptReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                  >
                    <option value="customer_unavailable">Customer Unavailable</option>
                    <option value="phone_unreachable">Phone Unreachable</option>
                    <option value="address_incorrect">Address Incorrect</option>
                    <option value="customer_refused">Customer Refused</option>
                    <option value="area_restricted">Area Restricted</option>
                    <option value="damaged_parcel">Damaged Parcel</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-300">Agent Notes</label>
                <Input
                  value={attemptNotes}
                  onChange={(e) => setAttemptNotes(e.target.value)}
                  placeholder="Agent remarks"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAttemptModal(false)} variant="ghost" size="sm" className="text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAction} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
                  Record Attempt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RETURN */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Initiate Delivery Return / RTS</h3>
            <form onSubmit={handleCreateReturn} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Shipment ID *</label>
                <Input
                  value={returnShipmentId}
                  onChange={(e) => setReturnShipmentId(e.target.value)}
                  placeholder="Shipment ID"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Return Reason *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                >
                  <option value="customer_refused">Customer Refused</option>
                  <option value="damaged_product">Damaged Product</option>
                  <option value="wrong_product">Wrong Product</option>
                  <option value="delivery_failed">Delivery Failed Multiple Attempts</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Return Notes</label>
                <Input
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Return ticket notes"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowReturnModal(false)} variant="ghost" size="sm" className="text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAction} size="sm" className="bg-rose-600 hover:bg-rose-500">
                  Submit Return Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE DISPUTE */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Open Delivery Dispute</h3>
            <form onSubmit={handleCreateDispute} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Shipment ID *</label>
                <Input
                  value={disputeShipmentId}
                  onChange={(e) => setDisputeShipmentId(e.target.value)}
                  placeholder="Shipment ID"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Dispute Type *</label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                >
                  <option value="courier_lost_package">Courier Lost Package</option>
                  <option value="damaged_parcel">Damaged Parcel</option>
                  <option value="cod_difference">COD Difference</option>
                  <option value="customer_complaint">Customer Complaint</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Investigation Note</label>
                <Input
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  placeholder="Initial investigation details"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowDisputeModal(false)} variant="ghost" size="sm" className="text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAction} size="sm" className="bg-purple-600 hover:bg-purple-500">
                  Open Dispute
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL INTERVENTION */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Manual Intervention Override</h3>
            <form onSubmit={handleManualIntervention} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Shipment ID *</label>
                <Input
                  value={manualShipmentId}
                  onChange={(e) => setManualShipmentId(e.target.value)}
                  placeholder="Shipment ID"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Action Type *</label>
                <select
                  value={manualActionType}
                  onChange={(e) => setManualActionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                >
                  <option value="force_status">Force Status Update</option>
                  <option value="manual_delivery_confirm">Manual Delivery Confirmation</option>
                  <option value="manual_return_confirm">Manual Return Confirmation</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Audit Notes *</label>
                <Input
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Reason for manual override"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowManualModal(false)} variant="ghost" size="sm" className="text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAction} size="sm" className="bg-sky-600 hover:bg-sky-500">
                  Execute Override
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
