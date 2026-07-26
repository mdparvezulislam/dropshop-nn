"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getOrderAction,
  updateOrderStatusAction,
  assignCourierAction,
  addOrderNoteAction,
  cancelOrderAction,
} from "@/features/order/actions/order-actions";
import { getOrderNotesAction, createOrderNoteAction } from "@/features/order/actions/note-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  DollarSign,
  Truck,
  FileText,
  MessageSquare,
  Activity,
  BarChart3,
  Package,
  Phone,
  Mail,
  MapPinned,
  CreditCard,
  BadgeCheck,
  Ban,
  AlertTriangle,
  Printer,
  Download,
} from "lucide-react";
import {
  getHumanLabel,
  getAllowedTransitions,
  type OrderStatus,
} from "@/features/order/domain/state-machine";

type TabId =
  | "customer"
  | "products"
  | "timeline"
  | "payment"
  | "courier"
  | "invoice"
  | "notes"
  | "activity"
  | "profit";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: "customer", label: "গ্রাহক", icon: User },
  { id: "products", label: "পণ্য", icon: Package },
  { id: "timeline", label: "টাইমলাইন", icon: Clock },
  { id: "payment", label: "পেমেন্ট", icon: DollarSign },
  { id: "courier", label: "কুরিয়ার", icon: Truck },
  { id: "invoice", label: "ইনভয়েস", icon: FileText },
  { id: "notes", label: "নোট", icon: MessageSquare },
  { id: "activity", label: "অ্যাক্টিভিটি", icon: Activity },
  { id: "profit", label: "লাভ", icon: BarChart3 },
];

export default function OrderDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = React.useState<any>(null);
  const [notes, setNotes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabId>("customer");
  const [transitioning, setTransitioning] = React.useState(false);

  const [noteText, setNoteText] = React.useState("");
  const [noteType, setNoteType] = React.useState<"internal" | "customer" | "courier">("internal");
  const [courierName, setCourierName] = React.useState("");
  const [courierId, setCourierId] = React.useState("");
  const [trackingNumber, setTrackingNumber] = React.useState("");

  const loadOrder = React.useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, notesRes] = await Promise.all([
        getOrderAction({ orderId }),
        getOrderNotesAction(orderId),
      ]);
      if (orderRes.success && orderRes.data) setOrder(orderRes.data);
      else {
        toast.error("অর্ডার পাওয়া যায়নি");
        router.push("/dashboard/orders");
      }
      if (notesRes.success) setNotes(notesRes.data ?? []);
    } catch {
      toast.error("অর্ডার লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  React.useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (toStatus: OrderStatus) => {
    setTransitioning(true);
    try {
      const res = await updateOrderStatusAction({
        orderId,
        toStatus,
        reason: `Transition to ${toStatus}`,
      });
      if (res.success) {
        toast.success(`স্ট্যাটাস আপডেট: ${getHumanLabel(toStatus)}`);
        loadOrder();
      } else toast.error(res.error || "স্ট্যাটাস আপডেট ব্যর্থ");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTransitioning(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const res = await createOrderNoteAction({
        orderId,
        type: noteType,
        content: noteText,
        isPinned: false,
      });
      if (res.success) {
        toast.success("নোট যোগ করা হয়েছে");
        setNoteText("");
        loadOrder();
      } else toast.error(res.error || "নোট যোগ ব্যর্থ");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCourierAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim() || !courierId.trim()) {
      toast.error("কুরিয়ারের নাম এবং আইডি দিন");
      return;
    }
    try {
      const res = await assignCourierAction({
        orderId,
        courierId,
        courierName,
        trackingNumber: trackingNumber || undefined,
      });
      if (res.success) {
        toast.success("কুরিয়ার অ্যাসাইন করা হয়েছে");
        setCourierName("");
        setCourierId("");
        setTrackingNumber("");
        loadOrder();
      } else toast.error(res.error || "কুরিয়ার অ্যাসাইন ব্যর্থ");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await cancelOrderAction({
        orderId,
        reason: "Cancelled from order detail",
        cancelledBy: "admin",
      });
      if (res.success) {
        toast.success("অর্ডার বাতিল করা হয়েছে");
        loadOrder();
      } else toast.error(res.error);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatCurrency = (amount: number) =>
    `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

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
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">অর্ডার লোড হচ্ছে...</div>
      </div>
    );
  }

  const allowedTransitions = getAllowedTransitions(order.status as OrderStatus);
  const isCancellable = ["draft", "pending", "confirmed", "packed", "failed"].includes(
    order.status,
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{order.orderNumber}</h1>
              <Badge variant={getStatusVariant(order.status)}>{getHumanLabel(order.status)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {order.type === "reseller"
                ? "রিসেলার"
                : order.type === "wholesaler"
                  ? "হোলসেল"
                  : "রিটেইল"}{" "}
              অর্ডার
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
              size="sm"
              className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {getHumanLabel(nextStatus)}
            </Button>
          ))}
          {isCancellable && (
            <Button disabled={transitioning} onClick={handleCancel} variant="destructive" size="sm">
              <Ban className="h-4 w-4 mr-1" /> বাতিল
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-2 flex gap-1 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Tab */}
          {activeTab === "customer" && (
            <div className="space-y-5">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> গ্রাহকের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">নাম</p>
                    <p className="text-sm font-medium">{order.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ফোন</p>
                    <p className="text-sm">{order.customer?.phone}</p>
                  </div>
                  {order.customer?.email && (
                    <div>
                      <p className="text-xs text-muted-foreground">ইমেইল</p>
                      <p className="text-sm">{order.customer.email}</p>
                    </div>
                  )}
                  {order.customer?.alternativePhone && (
                    <div>
                      <p className="text-xs text-muted-foreground">বিকল্প ফোন</p>
                      <p className="text-sm">{order.customer.alternativePhone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> ডেলিভারি ঠিকানা
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">প্রাপক</p>
                    <p className="text-sm font-medium">{order.shipping?.receiverName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ফোন</p>
                    <p className="text-sm">{order.shipping?.phone}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">ঠিকানা</p>
                    <p className="text-sm">
                      {order.shipping?.address}, {order.shipping?.area}, {order.shipping?.upazila}
                    </p>
                    <p className="text-sm">
                      {order.shipping?.district}, {order.shipping?.division}
                    </p>
                  </div>
                  {order.shipping?.deliveryNote && (
                    <div className="sm:col-span-2 p-2 rounded bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400">
                      <AlertTriangle className="h-3 w-3 inline mr-1" /> নোট:{" "}
                      {order.shipping.deliveryNote}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">পণ্যের তালিকা</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(order.pricing?.items ?? order.items ?? []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        SKU: {item.variantSku || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground">
                        {formatCurrency(item.unitSellingPrice ?? item.unitPrice)} x {item.quantity}
                      </p>
                      <p className="text-xs text-emerald-400">
                        লাভ: {formatCurrency(item.totalProfit ?? 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">টাইমলাইন ও অডিট</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 relative border-l-2 border-primary/30 pl-5 ml-2">
                {(order.timeline ?? []).map((entry: any) => (
                  <div key={entry.id} className="space-y-1 relative">
                    <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-primary uppercase tracking-wider">
                        {entry.eventType}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString("bn-BD")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{entry.summary}</p>
                    {entry.actor && (
                      <p className="text-[10px] text-muted-foreground">
                        {entry.actor.name} ({entry.actor.role})
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">পেমেন্ট বিবরণ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">সাবটোটাল</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(order.pricing?.subtotal ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">ডিসকাউন্ট</p>
                    <p className="font-semibold text-rose-400">
                      -{formatCurrency(order.pricing?.discountTotal ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">ট্যাক্স</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(order.pricing?.taxTotal ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary">গ্র্যান্ড টোটাল</p>
                    <p className="font-semibold text-primary text-lg">
                      {formatCurrency(order.pricing?.grandTotal ?? 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courier Tab */}
          {activeTab === "courier" && (
            <div className="space-y-5">
              {order.status === "ready_for_dispatch" && (
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4" /> কুরিয়ার অ্যাসাইন
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCourierAssign} className="space-y-3">
                      <Input
                        placeholder="কুরিয়ারের নাম (যেমন: Pathao)"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        required
                        className="h-9 text-sm"
                      />
                      <Input
                        placeholder="কুরিয়ার আইডি"
                        value={courierId}
                        onChange={(e) => setCourierId(e.target.value)}
                        required
                        className="h-9 text-sm"
                      />
                      <Input
                        placeholder="ট্র্যাকিং নম্বর (ঐচ্ছিক)"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Button type="submit" className="w-full">
                        কুরিয়ার অ্যাসাইন করুন
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              {order.shippingInfo && (
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">লজিস্টিক্স তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">কুরিয়ার</span>
                      <span>{order.shippingInfo.courierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">কুরিয়ার আইডি</span>
                      <span>{order.shippingInfo.courierId}</span>
                    </div>
                    {order.shippingInfo.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ট্র্যাকিং #</span>
                        <span className="font-mono">{order.shippingInfo.trackingNumber}</span>
                      </div>
                    )}
                    {order.shippingInfo.trackingUrl && (
                      <a
                        href={order.shippingInfo.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline text-xs block mt-2"
                      >
                        ট্র্যাক করুন →
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Invoice Tab */}
          {activeTab === "invoice" && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> ইনভয়েস
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-lg border border-border/50 bg-muted/10">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold">INVOICE</h3>
                    <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground">গ্রাহক</p>
                      <p className="font-medium">{order.customer?.name}</p>
                      <p className="text-xs">{order.customer?.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">তারিখ</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <table className="w-full text-sm mb-4">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2">পণ্য</th>
                        <th className="text-center py-2">পরিমাণ</th>
                        <th className="text-right py-2">মূল্য</th>
                        <th className="text-right py-2">মোট</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.pricing?.items ?? []).map((item: any, i: number) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="py-2">{item.productName}</td>
                          <td className="text-center py-2">{item.quantity}</td>
                          <td className="text-right py-2">
                            {formatCurrency(item.unitSellingPrice)}
                          </td>
                          <td className="text-right py-2 font-medium">
                            {formatCurrency(item.totalSellingPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right space-y-1 text-sm border-t border-border pt-3">
                    <p>
                      মোট:{" "}
                      <span className="font-bold">
                        {formatCurrency(order.pricing?.grandTotal ?? 0)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1" /> প্রিন্ট
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> ডাউনলোড
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-5">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">নোট যোগ করুন</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="নোট লিখুন..."
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as any)}
                        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        <option value="internal">অভ্যন্তরীণ</option>
                        <option value="customer">গ্রাহক</option>
                        <option value="courier">কুরিয়ার</option>
                      </select>
                      <Button type="submit" size="sm">
                        সংরক্ষণ করুন
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              {notes.length > 0 && (
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">পূর্বের নোট</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notes.map((note: any) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-lg border text-sm ${
                          note.type === "internal"
                            ? "border-rose-500/20 bg-rose-500/5"
                            : note.type === "courier"
                              ? "border-violet-500/20 bg-violet-500/5"
                              : "border-blue-500/20 bg-blue-500/5"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {note.type === "internal"
                              ? "অভ্যন্তরীণ"
                              : note.type === "courier"
                                ? "কুরিয়ার"
                                : "গ্রাহক"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(note.createdAt).toLocaleString("bn-BD")}
                          </span>
                        </div>
                        <p className="text-foreground">{note.content}</p>
                        {note.actorName && (
                          <p className="text-[10px] text-muted-foreground mt-1">{note.actorName}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" /> অ্যাক্টিভিটি লগ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(order.timeline ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    কোনো অ্যাক্টিভিটি পাওয়া যায়নি
                  </p>
                ) : (
                  <div className="space-y-3">
                    {[...(order.timeline ?? [])].reverse().map((entry: any, idx: number) => (
                      <div
                        key={entry.id || idx}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 text-sm"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <span className="font-medium text-foreground">{entry.summary}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(entry.timestamp).toLocaleString("bn-BD")}
                            </span>
                          </div>
                          {entry.actor && (
                            <p className="text-xs text-muted-foreground">
                              {entry.actor.name} ({entry.actor.role})
                            </p>
                          )}
                          {entry.changes?.length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {entry.changes.map((c: any, i: number) => (
                                <span key={i} className="mr-2">
                                  {c.field}: {String(c.oldValue ?? "")} → {String(c.newValue ?? "")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profit Tab */}
          {activeTab === "profit" && order.profitPreview && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> লাভের বিবরণ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">মোট আয়</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(order.profitPreview.totalRevenue ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">মোট খরচ</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(order.profitPreview.totalCostBasis ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400">মোট লাভ</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(order.profitPreview.totalProfit ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-400/70">
                    {order.profitPreview.averageMargin?.toFixed(1)}% মার্জিন
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">দ্রুত অ্যাকশন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/orders/${orderId}/edit`}>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <MapPinned className="h-4 w-4 mr-2" /> শিপিং এডিট
                </Button>
              </Link>
              <Link href={`/dashboard/orders/print?orderId=${orderId}`}>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Printer className="h-4 w-4 mr-2" /> ইনভয়েস প্রিন্ট
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">অর্ডার তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">অর্ডার নং</span>
                <span className="font-mono">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ধরন</span>
                <span>{order.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">সোর্স</span>
                <span>{order.source || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">স্ট্যাটাস</span>
                <Badge variant={getStatusVariant(order.status)} className="text-[10px]">
                  {getHumanLabel(order.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notes Quick Add */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">দ্রুত নোট</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="নোট..."
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none focus:border-primary"
                />
                <Button type="submit" size="sm" className="w-full">
                  যোগ করুন
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
