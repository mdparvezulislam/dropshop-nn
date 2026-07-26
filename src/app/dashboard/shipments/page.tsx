"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { listShipmentsAction } from "@/features/courier/actions/courier-actions";
import { toast } from "sonner";
import { Truck, MapPin, CheckCircle2, ClipboardList, Shield, RefreshCw } from "lucide-react";

export default function ResellerShipmentsPage() {
  const { data: session } = useSession() as any;

  const [shipments, setShipments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"list" | "rates">("list");
  const [selectedShipment, setSelectedShipment] = React.useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listShipmentsAction();
      if (res.success && res.data) {
        setShipments(res.data);
      } else {
        toast.error("Failed to load shipments registry");
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

  const BASE_RATES = [
    { zone: "Inside Dhaka City", rate: 6000, cod: "0%" },
    { zone: "Dhaka Sub-Cities", rate: 10000, cod: "1%" },
    { zone: "Outside Dhaka Division", rate: 12000, cod: "1%" },
    { zone: "Remote Bangladesh Area", rate: 15000, cod: "1%" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Shipment Deliveries & Invoicing
          </h1>
          <p className="text-sm text-slate-400">
            Track shipments statuses, transit timelines, and delivery fees
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          className="bg-slate-900 border-slate-800 text-xs"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh tracking
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardContent className="p-2 flex gap-2">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Shipments ({shipments.length})
              </button>
              <button
                onClick={() => setActiveTab("rates")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "rates"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Logistics Charge Tables
              </button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
            {activeTab === "list" && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Tracking Code / Ref</TableHead>
                      <TableHead className="text-slate-400">Order Number</TableHead>
                      <TableHead className="text-slate-400">Carrier</TableHead>
                      <TableHead className="text-slate-400">Delivery Fee</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                          No shipments created yet for confirmed orders
                        </TableCell>
                      </TableRow>
                    ) : (
                      shipments.map((s) => (
                        <TableRow key={s.id} className="border-slate-800">
                          <TableCell className="font-mono text-xs text-indigo-400">
                            {s.trackingCode}
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                              Ref: {s.courierReference}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">{s.orderNumber}</TableCell>
                          <TableCell className="capitalize text-slate-200">{s.provider}</TableCell>
                          <TableCell className="font-semibold text-white">
                            {formatCurrency(s.deliveryCharge)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(s.status)}>{s.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => setSelectedShipment(s)}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-500 text-xs h-7"
                            >
                              Timeline
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === "rates" && (
              <div className="overflow-x-auto">
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
                    {BASE_RATES.map((r, idx) => (
                      <TableRow key={idx} className="border-slate-800">
                        <TableCell className="font-semibold text-slate-200">{r.zone}</TableCell>
                        <TableCell className="text-xs text-slate-400">1000g (1kg)</TableCell>
                        <TableCell className="font-mono text-emerald-400">
                          {formatCurrency(r.rate)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-300 font-mono">{r.cod}</TableCell>
                        <TableCell className="text-xs text-slate-400">
                          ৳20.00 per extra 500g
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="border-slate-800 bg-slate-900/50 min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4" /> Live Tracking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedShipment ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500">
                  <Truck className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-xs">Select a shipment to track transit history logs</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs text-slate-400 uppercase block font-mono">
                      Consignment
                    </span>
                    <span className="text-sm font-bold text-indigo-400 font-mono">
                      {selectedShipment.trackingCode}
                    </span>
                    <Badge variant={getStatusVariant(selectedShipment.status)} className="mt-1">
                      {selectedShipment.status}
                    </Badge>
                  </div>

                  <div className="relative border-l border-slate-800 ml-2.5 pl-4 space-y-4 pt-1">
                    {selectedShipment.history.map((h: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21.5px] top-1 h-3 w-3 rounded-full border border-slate-950 bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 block capitalize">
                          {h.status.replace("_", " ")}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">{h.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
