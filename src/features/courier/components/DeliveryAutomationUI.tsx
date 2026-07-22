"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import {
  getAutomationDashboardAction,
  triggerManualAutomationSyncAction,
  runAdaptivePollingWorkerAction,
  restartAutomationAction,
} from "../actions/delivery-automation-actions";
import { toast } from "sonner";
import {
  Activity,
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Truck,
  Building,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sliders,
  Eye,
  Play,
  Database,
  Layers,
} from "lucide-react";

export function DeliveryAutomationUI(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<"automations" | "polling" | "logs">("automations");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Drawer / Modal for selected timeline
  const [selectedAutomation, setSelectedAutomation] = React.useState<any>(null);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [pollingBusy, setPollingBusy] = React.useState(false);

  // Tab Slider ref
  const tabSliderRef = React.useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: "left" | "right") => {
    if (tabSliderRef.current) {
      tabSliderRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAutomationDashboardAction();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.error || "Failed to load delivery automation dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Error loading automation dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleManualSync = async (shipmentId: string) => {
    setSyncingId(shipmentId);
    try {
      const res = await triggerManualAutomationSyncAction({ shipmentId });
      if (res.success) {
        toast.success("Shipment tracking & delivery automation synchronized!");
        loadAllData();
      } else {
        toast.error(res.error || "Sync failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Sync error");
    } finally {
      setSyncingId(null);
    }
  };

  const handleRunPollingNow = async () => {
    setPollingBusy(true);
    try {
      const res = await runAdaptivePollingWorkerAction();
      if (res.success) {
        toast.success(`Adaptive Polling Worker completed: ${res.processedCount} shipments synchronized`);
        loadAllData();
      } else {
        toast.error(res.error || "Polling worker failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Polling error");
    } finally {
      setPollingBusy(false);
    }
  };

  const handleRestartAutomation = async (shipmentId: string) => {
    try {
      const res = await restartAutomationAction({ shipmentId });
      if (res.success) {
        toast.success("Delivery automation restarted for shipment");
        loadAllData();
      } else {
        toast.error(res.error || "Restart failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Restart error");
    }
  };

  const automationsList = data?.automations || [];
  const filteredAutomations = automationsList.filter(
    (a: any) =>
      a.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentStatus.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Delivery Automation & Courier Orchestration</h1>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-950/40 text-[10px]">
              LOGISTICS-HUB-001C
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automatic Post-Booking Lifecycle Engine, Rider & Hub Synchronization, Hybrid Webhook+Polling Worker & Event Automation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking, rider, hub..."
              className="pl-8 text-xs bg-slate-900 border-slate-800"
            />
          </div>
          <Button onClick={handleRunPollingNow} disabled={pollingBusy} size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-xs gap-1.5">
            <Play className={`h-3.5 w-3.5 ${pollingBusy ? "animate-spin" : ""}`} /> Run 5-Min Sync Now
          </Button>
          <Button onClick={loadAllData} size="sm" variant="ghost" disabled={loading} className="text-slate-400 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI & Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Active Automations</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-cyan-400">{data?.metrics?.activeShipmentsCount || 0}</p>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Adaptive Polling Worker</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-emerald-400">5-MIN HYBRID ACTIVE</p>
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Webhook Engine</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-sky-400">PRIORITY ACTIVE</p>
              <CheckCircle2 className="h-4 w-4 text-sky-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Avg Sync Latency</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-amber-300">{data?.metrics?.avgSyncTimeMs || 420} ms</p>
              <Clock className="h-4 w-4 text-amber-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Sub-Tabs Slider */}
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
            onClick={() => setActiveTab("automations")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "automations" ? "bg-cyan-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Truck className="h-3.5 w-3.5" /> Shipment Automations ({automationsList.length})
          </button>
          <button
            onClick={() => setActiveTab("polling")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "polling" ? "bg-cyan-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-yellow-400" /> Hybrid Polling Worker
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

      {/* TAB 1: SHIPMENT AUTOMATIONS LIST */}
      {activeTab === "automations" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Automated Delivery Lifecycle Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Shipment # / Code</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs">Current Status</TableHead>
                  <TableHead className="text-xs">Rider Information</TableHead>
                  <TableHead className="text-xs">Hub Movements</TableHead>
                  <TableHead className="text-xs">Polling Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAutomations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No active delivery automations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAutomations.map((a: any) => (
                    <TableRow key={a.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs">
                        <p className="font-bold text-white">{a.shipmentNumber}</p>
                        <p className="font-mono text-[10px] text-cyan-400">{a.trackingCode}</p>
                      </TableCell>
                      <TableCell className="text-xs uppercase font-semibold text-indigo-400">{a.provider}</TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant={
                            a.currentStatus === "delivered"
                              ? "success"
                              : a.currentStatus === "out_for_delivery"
                              ? "warning"
                              : a.currentStatus === "returned"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {a.currentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {a.rider?.name ? (
                          <div>
                            <p className="font-medium text-white">{a.rider.name}</p>
                            <p className="font-mono text-[10px] text-slate-400">{a.rider.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">{a.currentHub || "N/A"}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={a.pollingStatus === "active" ? "success" : "outline"} className="capitalize">
                          {a.pollingStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right space-x-1">
                        <Button
                          onClick={() => setSelectedAutomation(a)}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-slate-700"
                        >
                          <Eye className="h-3 w-3 mr-1 text-sky-400" /> Timeline
                        </Button>
                        <Button
                          onClick={() => handleManualSync(a.shipmentId)}
                          disabled={syncingId === a.shipmentId}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-slate-700"
                        >
                          <RefreshCw className={`h-3 w-3 ${syncingId === a.shipmentId ? "animate-spin" : ""}`} />
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

      {/* TAB 2: POLLING WORKER CONTROLS */}
      {activeTab === "polling" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Hybrid Webhook & Adaptive Polling Worker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Polling Worker Frequency:</span>
                <Badge variant="success">Adaptive 5 Minutes</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Queries active non-terminal shipments from Pathao and Steadfast APIs automatically as a fallback when courier webhooks are delayed.
              </p>
            </div>

            <Button onClick={handleRunPollingNow} disabled={pollingBusy} className="bg-cyan-600 hover:bg-cyan-500 text-xs">
              Execute Manual Polling Sync Iteration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TIMELINE MODAL DRAWER */}
      {selectedAutomation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Shipment Timeline [{selectedAutomation.shipmentNumber}]</h3>
                <p className="text-xs font-mono text-cyan-400">{selectedAutomation.trackingCode}</p>
              </div>
              <Button onClick={() => setSelectedAutomation(null)} size="sm" variant="ghost" className="text-slate-400">
                Close
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Rider Name:</span>{" "}
                  <span className="font-semibold text-white">{selectedAutomation.rider?.name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Rider Phone:</span>{" "}
                  <span className="font-mono text-slate-300">{selectedAutomation.rider?.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Current Hub:</span>{" "}
                  <span className="font-semibold text-indigo-400">{selectedAutomation.currentHub || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400">COD Settlement:</span>{" "}
                  <Badge variant={selectedAutomation.codSettlementPrepared ? "success" : "outline"}>
                    {selectedAutomation.codSettlementPrepared ? "PREPARED" : "PENDING"}
                  </Badge>
                </div>
              </div>

              <h4 className="font-bold text-white pt-2">Chronological Tracking Events</h4>
              <div className="space-y-2">
                {(selectedAutomation.timeline || []).map((t: any, idx: number) => (
                  <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{t.description}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(t.timestamp).toLocaleString()} • Location: {t.location || t.hub || "Transit"}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryAutomationUI;
