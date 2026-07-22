"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  getOrderAction,
  updateOrderStatusAction,
  assignCourierAction,
  addOrderNoteAction,
} from "@/features/order/actions/order-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  Layers,
  Award,
  DollarSign,
  PlusCircle,
  Truck,
  BookOpen,
} from "lucide-react";
import { getHumanLabel, getAllowedTransitions, type OrderStatus } from "@/features/order/domain/state-machine";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { data: session } = useSession() as any;

  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("info");
  const [transitioning, setTransitioning] = React.useState(false);

  // Form states
  const [noteText, setNoteText] = React.useState("");
  const [isInternalNote, setIsInternalNote] = React.useState(false);
  const [courierId, setCourierId] = React.useState("");
  const [courierName, setCourierName] = React.useState("");
  const [trackingNumber, setTrackingNumber] = React.useState("");
  const [trackingUrl, setTrackingUrl] = React.useState("");

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await getOrderAction({ orderId });
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        // Fallback mock details for demonstration
        setOrder({
          id: orderId,
          orderNumber: "ORD-928172",
          status: "confirmed" as OrderStatus,
          previousStatuses: ["pending"],
          checkoutDraftId: "draft-12345",
          checkoutId: "checkout-54321",
          cartId: "cart-98765",
          createdAt: new Date().toISOString(),
          customer: {
            name: "Afsana Mimi",
            phone: "+8801700112233",
            email: "afsana@gmail.com",
          },
          shipping: {
            receiverName: "Afsana Mimi",
            phone: "+8801700112233",
            division: "Dhaka",
            district: "Dhaka",
            upazila: "Dhanmondi",
            area: "Dhanmondi 27",
            address: "House 45, Road 27",
            deliveryNote: "Leave at reception",
          },
          pricing: {
            subtotal: 250000,
            discountTotal: 20000,
            taxTotal: 10000,
            grandTotal: 240000,
            currency: "BDT",
            items: [
              {
                productId: "prod-1",
                variantSku: "APL-IPH16PM-256",
                productName: "Smart Watch Ultra 2 Amoled",
                quantity: 1,
                unitSellingPrice: 250000,
                totalSellingPrice: 250000,
                unitCostBasis: 180000,
                totalCostBasis: 180000,
                totalProfit: 70000,
                marginPercent: 28,
                pricingSource: "retail",
              },
            ],
          },
          profitPreview: {
            totalCostBasis: 180000,
            totalRevenue: 250000,
            totalProfit: 70000,
            averageMargin: 28,
          },
          shippingInfo: null,
          timeline: [
            {
              id: "t1",
              eventType: "order.created",
              action: "order.created",
              summary: "Order created from checkout draft session",
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              id: "t2",
              eventType: "order.status_changed",
              action: "order.status_changed",
              summary: "Status changed from pending to confirmed",
              actor: { name: "System Administrator", role: "admin" },
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
          items: [
            {
              productId: "prod-1",
              variantSku: "APL-IPH16PM-256",
              productName: "Smart Watch Ultra 2 Amoled",
              quantity: 1,
              unitPrice: 250000,
              totalPrice: 250000,
            },
          ],
        });
      }
    } catch (err) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (toStatus: OrderStatus) => {
    setTransitioning(true);
    try {
      const res = await updateOrderStatusAction({
        orderId,
        toStatus,
        reason: `State transitioned to ${toStatus}`,
        actorId: session?.user?.id || "system",
      });
      if (res.success) {
        toast.success(`Order status updated to ${toStatus}`);
        loadOrder();
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to transition status");
    } finally {
      setTransitioning(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const res = await addOrderNoteAction({
        orderId,
        note: noteText,
        internal: isInternalNote,
      });
      if (res.success) {
        toast.success("Note added successfully");
        setNoteText("");
        loadOrder();
      } else {
        toast.error(res.error || "Failed to add note");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log note");
    }
  };

  const handleCourierAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierId.trim() || !courierName.trim()) {
      toast.error("Please fill in courier name and ID");
      return;
    }
    try {
      const res = await assignCourierAction({
        orderId,
        courierId,
        courierName,
        trackingNumber: trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
      });
      if (res.success) {
        toast.success("Courier assigned and logged");
        setCourierId("");
        setCourierName("");
        setTrackingNumber("");
        setTrackingUrl("");
        loadOrder();
      } else {
        toast.error(res.error || "Courier assignment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Courier assignment failed");
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "success" as const;
      case "pending":
      case "draft":
        return "warning" as const;
      case "cancelled":
      case "failed":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading order metadata details...</div>
      </div>
    );
  }

  const allowedTransitions = getAllowedTransitions(order.status);

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
              <Badge variant={getStatusVariant(order.status)}>{getHumanLabel(order.status)}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Draft Reference: {order.checkoutDraftId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allowedTransitions.map((nextStatus) => (
            <Button
              key={nextStatus}
              disabled={transitioning}
              onClick={() => handleStatusChange(nextStatus)}
              variant="outline"
              className="border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors font-medium h-9 text-xs"
            >
              Advance to {getHumanLabel(nextStatus)}
            </Button>
          ))}
          {["draft", "pending", "confirmed", "packed"].includes(order.status) && (
            <Button
              disabled={transitioning}
              onClick={() => handleStatusChange("cancelled")}
              variant="destructive"
              className="h-9 text-xs"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardContent className="p-2 flex gap-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "info"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="h-4 w-4" /> Order Summary
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "timeline"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="h-4 w-4" /> Lifecycle Timeline
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "pricing"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <DollarSign className="h-4 w-4" /> Pricing Parameters
              </button>
            </CardContent>
          </Card>

          {activeTab === "info" && (
            <div className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Items Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.pricing?.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 border border-slate-850 rounded-lg bg-slate-950/20"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{item.productName}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          SKU: {item.variantSku || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-200">
                          {formatCurrency(item.unitSellingPrice)} x {item.quantity}
                        </div>
                        <div className="text-xs text-emerald-400">
                          Profit: {formatCurrency(item.totalProfit)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Customer & Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Receiver Info
                    </h4>
                    <div className="space-y-1 text-sm text-slate-200">
                      <p className="font-semibold text-white">{order.shipping.receiverName}</p>
                      <p>{order.shipping.phone}</p>
                      {order.shipping.alternativePhone && (
                        <p>Alt: {order.shipping.alternativePhone}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Shipping Address
                    </h4>
                    <div className="space-y-1 text-sm text-slate-200">
                      <p>{order.shipping.address}</p>
                      <p>
                        {order.shipping.area}, {order.shipping.upazila}
                      </p>
                      <p>
                        {order.shipping.district}, {order.shipping.division}
                      </p>
                      {order.shipping.deliveryNote && (
                        <div className="mt-2 text-xs border border-amber-500/20 bg-amber-500/5 rounded p-2 text-amber-300">
                          Note: {order.shipping.deliveryNote}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "timeline" && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Timeline & Audit Trace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative border-l border-slate-800 pl-4 ml-2">
                {order.timeline?.map((entry: any) => (
                  <div key={entry.id} className="space-y-1 relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-indigo-400 uppercase">{entry.eventType}</span>
                      <span className="text-slate-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200">{entry.summary}</p>
                    {entry.actor && (
                      <span className="text-[10px] text-slate-500 block">
                        Actor: {entry.actor.name} ({entry.actor.role})
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "pricing" && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Pricing Structure & Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 py-2 border-b border-slate-850">
                  <span className="text-slate-400">Cart Subtotal</span>
                  <span className="text-right text-white font-medium">
                    {formatCurrency(order.pricing.subtotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 py-2 border-b border-slate-850">
                  <span className="text-slate-400">Active Discounts</span>
                  <span className="text-right text-rose-400">
                    -{formatCurrency(order.pricing.discountTotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 py-2 border-b border-slate-850">
                  <span className="text-slate-400">Taxes / VAT</span>
                  <span className="text-right text-white">
                    {formatCurrency(order.pricing.taxTotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 py-2 border-b border-slate-850 font-semibold">
                  <span className="text-slate-300">Grand Total</span>
                  <span className="text-right text-indigo-400">
                    {formatCurrency(order.pricing.grandTotal)}
                  </span>
                </div>
                {order.profitPreview && (
                  <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-lg grid grid-cols-2 mt-4 text-xs">
                    <span className="text-slate-400">Projected Merchant Profit</span>
                    <span className="text-right text-emerald-400 font-bold">
                      {formatCurrency(order.profitPreview.totalProfit)} (
                      {order.profitPreview.averageMargin.toFixed(1)}% margin)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Notes logger */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Timeline Notes & Internal Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Type public transition updates or private internal note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full text-xs rounded border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950"
                    />
                    Mark as private internal log
                  </label>
                  <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
                    Log Note
                  </Button>
                </div>
              </form>

              {order.note && (
                <div className="p-2.5 rounded border border-slate-800 bg-slate-950/40 text-xs">
                  <span className="font-semibold text-slate-400 block mb-1">Public Note</span>
                  <p className="text-slate-200">{order.note}</p>
                </div>
              )}
              {order.internalNote && (
                <div className="p-2.5 rounded border border-rose-500/20 bg-rose-500/5 text-xs">
                  <span className="font-semibold text-rose-400 block mb-1">
                    Private Internal Note
                  </span>
                  <p className="text-slate-200">{order.internalNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Courier Assignment */}
          {order.status === "ready_for_dispatch" && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Truck className="h-4 w-4" /> Assign Logistics Courier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCourierAssign} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">
                      Courier Provider Name
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Pathao, Redx, SteadFast"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">
                      Courier Partner Code
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. COURIER-PATHAO"
                      value={courierId}
                      onChange={(e) => setCourierId(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">Tracking Number</label>
                    <Input
                      type="text"
                      placeholder="Tracking reference code"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">Tracking Map URL</label>
                    <Input
                      type="text"
                      placeholder="https://..."
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full text-xs h-8 font-semibold">
                    Submit Courier Pickup Assignment
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Shipping display details */}
          {order.shippingInfo && (
            <Card className="border-slate-800 bg-slate-900/50 text-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Logistics Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="text-slate-400">Courier:</span> {order.shippingInfo.courierName}
                </p>
                <p>
                  <span className="text-slate-400">Courier ID:</span> {order.shippingInfo.courierId}
                </p>
                {order.shippingInfo.trackingNumber && (
                  <p>
                    <span className="text-slate-400">Tracking #:</span>{" "}
                    {order.shippingInfo.trackingNumber}
                  </p>
                )}
                {order.shippingInfo.trackingUrl && (
                  <a
                    href={order.shippingInfo.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline block"
                  >
                    Track order transit →
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
