"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import {
  listShipmentsAction,
  requestPickupAction,
  transitionStatusAction,
} from "@/features/courier/actions/courier-actions";
import { toast } from "sonner";
import { Truck, Navigation, CheckCircle2, AlertTriangle, RefreshCw, Settings, DollarSign } from "lucide-react";

export default function AdminCourierPage() {
  const { data: session } = useSession() as any;

  const [activeTab, setActiveTab] = React.useState<"shipments" | "pickups" | "rates" | "settings">("shipments");
  const [shipments, setShipments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listShipmentsAction();
      if (res.success && res.data) {
        setShipments(res.data);
      } else {
        toast.error("Failed to load platform shipments registry");
      }
    } catch (err) {
      toast.error("API error loading courier data logs");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleRequestPickup = async (shipmentId: string) => {
    try {
      const res = await requestPickupAction({ shipmentId });
      if (res.success) {
        toast.success("Courier pickup schedule request processed by adapter");
        loadData();
      } else {
        toast.error(res.error || "Fulfillment request rejected");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  const handleStatusTransition = async (shipmentId: string, toStatus: string) => {
    const msg = statusMessage[shipmentId] || `Status updated to ${toStatus} via admin console`;
    if (!msg.trim()) {
      toast.error("Please add an audit timeline update log message");
      return;
    }

    try {
      const res = await transitionStatusAction({
        shipmentId,
        toStatus,
        message: msg,
      });

      if (res.success) {
        toast.success(`Shipment transitioned to ${toStatus}`);
        setStatusMessage({ ...statusMessage, [shipmentId]: "" });
        loadData();
      } else {
        toast.error(res.error || "Fulfillment transition rejected");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "success" as const;
      case "pickup_requested":
      case "in_transit":
      case "out_for_delivery":
        return "warning" as const;
      case "returned":
      case "failed":
      case "cancelled":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  // Mock rates registry
  const BASE_RATES = [
    { zone: "Inside Dhaka City", key: "inside_city", rate: 6000, cod: "0%" },
    { zone: "Dhaka Sub-Cities", key: "sub_city", rate: 10000, cod: "1%" },
    { zone: "Outside Dhaka Division", key: "outside_city", rate: 12000, cod: "1%" },
    { zone: "Remote Bangladesh Area", key: "remote_area", rate: 15000, cod: "1%" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Logistics & Fulfillment Center</h1>
          <p className="text-sm text-slate-400">Dispatch shipments, schedule pickups, and configure courier integrations</p>
        </div>
        <Button onClick={loadData} disabled={loading} className="bg-slate-900 border-slate-800 text-xs">
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reload logs
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> Total Shipments
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-indigo-400">{shipments.length} parcels</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" /> Out / In Transit
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">
              {shipments.filter((s) => ["in_transit", "out_for_delivery", "picked_up"].includes(s.status)).length} parcels
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Successful Delivery
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">
              {shipments.filter((s) => s.status === "delivered").length} parcels
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Returns / Failed
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-400">
              {shipments.filter((s) => s.status === "returned" || s.status === "failed").length} parcels
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("shipments")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "shipments" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Fulfillment Shipments ({shipments.length})
          </button>
          <button
            onClick={() => setActiveTab("pickups")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "pickups" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Pickup Requests Queue ({shipments.filter((s) => s.status === "created").length})
          </button>
          <button
            onClick={() => setActiveTab("rates")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "rates" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Logistics Charges & Rates
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors shrink-0 ${
              activeTab === "settings" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Partner Provider Settings
          </button>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "shipments" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Tracking Code / Ref</TableHead>
                  <TableHead className="text-slate-400">Order Number</TableHead>
                  <TableHead className="text-slate-400">Provider</TableHead>
                  <TableHead className="text-slate-400">Weight</TableHead>
                  <TableHead className="text-slate-400">Delivery Fee</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Actions / Sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-slate-500 text-xs">
                      No active shipments found
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map((s) => (
                    <TableRow key={s.id} className="border-slate-800">
                      <TableCell className="font-mono text-xs text-indigo-400">
                        {s.trackingCode}
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Ref: {s.courierReference}</span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-200">{s.orderNumber}</TableCell>
                      <TableCell className="capitalize text-slate-300 font-semibold">{s.provider}</TableCell>
                      <TableCell className="text-xs text-slate-400">{s.parcelWeight}g</TableCell>
                      <TableCell className="font-semibold text-white">{formatCurrency(s.deliveryCharge)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(s.status)}>{s.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {["picked_up", "in_transit", "out_for_delivery", "hub_received"].includes(s.status) && (
                          <div className="flex items-center gap-1.5">
                            <Input
                              placeholder="Timeline note"
                              value={statusMessage[s.id] || ""}
                              onChange={(e) => setStatusMessage({ ...statusMessage, [s.id]: e.target.value })}
                              className="h-7 w-32 bg-slate-950 border-slate-800 text-[10px] text-white pl-2"
                            />
                            <Button
                              onClick={() => handleStatusTransition(s.id, "delivered")}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-xs h-7"
                            >
                              Deliver
                            </Button>
                            <Button
                              onClick={() => handleStatusTransition(s.id, "returned")}
                              variant="destructive"
                              size="sm"
                              className="text-xs h-7"
                            >
                              Return
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "pickups" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Shipment Number</TableHead>
                  <TableHead className="text-slate-400">Order Ref</TableHead>
                  <TableHead className="text-slate-400">Destination Zone</TableHead>
                  <TableHead className="text-slate-400">COD Value</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.filter((s) => s.status === "created").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-slate-500 text-xs">
                      No pickups scheduled or required
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments
                    .filter((s) => s.status === "created")
                    .map((s) => (
                      <TableRow key={s.id} className="border-slate-800">
                        <TableCell className="font-mono text-xs text-slate-300">{s.shipmentNumber}</TableCell>
                        <TableCell className="text-xs text-slate-400">{s.orderNumber}</TableCell>
                        <TableCell className="capitalize text-slate-300">{s.deliveryZone.replace("_", " ")}</TableCell>
                        <TableCell className="font-semibold text-white">{formatCurrency(s.codAmount)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleRequestPickup(s.id)}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-xs h-7"
                          >
                            Schedule Pickup
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "rates" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Delivery Zone</TableHead>
                  <TableHead className="text-slate-400">Base Weight Cap</TableHead>
                  <TableHead className="text-slate-400">Base Rate</TableHead>
                  <TableHead className="text-slate-400">COD Collected Charge</TableHead>
                  <TableHead className="text-slate-400">Excess Weight Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BASE_RATES.map((r) => (
                  <TableRow key={r.key} className="border-slate-800">
                    <TableCell className="font-semibold text-slate-200">{r.zone}</TableCell>
                    <TableCell className="text-xs text-slate-400">1000g (1kg)</TableCell>
                    <TableCell className="font-mono text-emerald-400">{formatCurrency(r.rate)}</TableCell>
                    <TableCell className="text-xs text-slate-300 font-mono">{r.cod}</TableCell>
                    <TableCell className="text-xs text-slate-400">৳20.00 per extra 500g</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === "settings" && (
            <div className="p-6 space-y-6 max-w-xl">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <Settings className="h-4 w-4" /> Integrated Logistics Carrier Providers
                </h3>
                <p className="text-xs text-slate-500">Configure client credentials, webhooks security, and active flags</p>
              </div>

              <div className="space-y-4">
                {["SteadFast Logistics", "Pathao Courier", "RedX Delivery", "eCourier BD", "Paperfly"].map((name) => (
                  <div key={name} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold block text-slate-200">{name}</span>
                      <span className="text-[10px] text-slate-500">Signature Verification: Active</span>
                    </div>
                    <Badge variant="success">Active (Mock Sandbox)</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
