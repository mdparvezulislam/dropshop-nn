"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getCustomerAction,
  updateTagsAction,
  addNoteAction,
  addAddressAction,
} from "@/features/customer/actions/customer-actions";
import { listOrdersAction } from "@/features/order/actions/order-actions";
import { getOrderRisksAction } from "@/features/order/actions/risk-actions";
import { formatAmount } from "@/features/order/utils/payment-utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Undo2,
  Tag,
  Clock,
  User,
  AlertTriangle,
  Plus,
  X,
  Crown,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  ExternalLink,
  MapPinned,
  Send,
  Award,
} from "lucide-react";

type ProfileTab = "overview" | "orders" | "addresses" | "notes" | "loyalty" | "risk";

export default function CustomerProfilePage(): React.ReactElement {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [risks, setRisks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState("");
  const [noteInput, setNoteInput] = React.useState("");
  const [submittingNote, setSubmittingNote] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<ProfileTab>("overview");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, oRes] = await Promise.all([
        getCustomerAction(customerId),
        listOrdersAction({ page: 1, limit: 100, search: "" }),
      ]);

      if (cRes.success && cRes.data) {
        setCustomer(cRes.data);
        setTags(cRes.data.tags ?? []);

        const phone = cRes.data.phone;
        if (oRes.success && oRes.data?.items) {
          const customerOrders = oRes.data.items.filter((o: any) => o.customer?.phone === phone);
          setOrders(customerOrders);
        }
      } else {
        toast.error(cRes.error || "গ্রাহক পাওয়া যায়নি");
      }

      try {
        const rRes = await getOrderRisksAction(customerId);
        if (rRes.success && rRes.data) {
          setRisks(rRes.data);
        }
      } catch {
        // risk load failure non-critical
      }
    } catch {
      toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const updated = [...tags, newTag.trim()];
    const res = await updateTagsAction({ customerId, tags: updated });
    if (res.success) {
      setTags(updated);
      setNewTag("");
      toast.success("ট্যাগ যোগ করা হয়েছে");
    } else {
      toast.error(res.error || "ট্যাগ আপডেট ব্যর্থ");
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    const res = await updateTagsAction({ customerId, tags: updated });
    if (res.success) {
      setTags(updated);
      toast.success("ট্যাগ মুছে ফেলা হয়েছে");
    } else {
      toast.error(res.error || "ট্যাগ মুছে ফেলা ব্যর্থ");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await addNoteAction({
        customerId,
        note: noteInput.trim(),
        isPrivate: false,
      });
      if (res.success) {
        toast.success("নোট সফলভাবে যুক্ত করা হয়েছে!");
        setNoteInput("");
        load();
      } else {
        toast.error(res.error || "নোট সেভ করা যায়নি");
      }
    } catch {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 text-foreground space-y-4">
        <Link href="/dashboard/orders/customers">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> গ্রাহক তালিকায় ফিরুন
          </Button>
        </Link>
        <p className="text-muted-foreground font-bold">গ্রাহকের তথ্য পাওয়া যায়নি।</p>
      </div>
    );
  }

  // Calculate Metrics
  const stats = customer.statistics || {};
  const totalSpendTaka = Math.round((stats.totalSpend || 0) / 100);
  const totalOrders = orders.length || stats.totalOrders || 0;
  const completedOrders = orders.filter((o) => ["delivered", "completed"].includes(o.status)).length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const returnedOrders = orders.filter((o) => ["returned", "refunded"].includes(o.status)).length;
  const aovTaka = totalOrders > 0 ? Math.round(totalSpendTaka / totalOrders) : 0;
  const formattedPhone = (customer.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "880");
  const isVip = tags.includes("VIP") || totalSpendTaka > 20000;

  // Membership Tier
  const membershipTier = totalSpendTaka > 50000 ? "Platinum VIP" : totalSpendTaka > 20000 ? "Gold" : totalSpendTaka > 5000 ? "Silver" : "Regular";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6 pb-24">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders/customers">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-heading tracking-tight text-foreground">
                {customer.name}
              </h1>
              {isVip && (
                <Badge variant="warning" className="gap-1 font-extrabold">
                  <Crown className="h-3 w-3 fill-amber-500 text-amber-600" /> {membershipTier}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Customer ID: #{customerId.slice(-6)} • Source: {customer.source || "Website"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customer.phone && (
            <a
              href={`https://wa.me/${formattedPhone}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" className="h-10 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl">
                <MessageCircle className="h-4 w-4" /> WhatsApp Chat
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" onClick={load} className="h-10 font-bold gap-1.5 rounded-xl">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* 360° Profile Top Header Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 font-black text-xl uppercase font-heading border border-amber-500/20 shadow-inner">
                {customer.name ? customer.name.slice(0, 2) : "CU"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-blue-500" /> {customer.phone}
                  </span>
                </div>
                {customer.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {customer.email}
                  </p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Member Since: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-2xl border border-border/60">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Lifetime Spend</span>
                <p className="text-lg font-black font-mono text-emerald-600">৳ {formatAmount(totalSpendTaka)}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-bold">Total Orders</span>
                <p className="text-lg font-black font-mono text-foreground">{totalOrders}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-bold">Completed</span>
                <p className="text-lg font-black font-mono text-blue-600">{completedOrders}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-bold">Avg Order Value</span>
                <p className="text-lg font-black font-mono text-purple-600">৳ {formatAmount(aovTaka)}</p>
              </div>
            </div>
          </div>

          {/* Tags Editor Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-amber-500" /> Tags:
            </span>
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 pr-1 font-semibold text-xs">
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-500 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            <div className="flex items-center gap-1 ml-auto">
              <Input
                placeholder="Add tag (e.g. Regular, VIP)..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                className="h-8 text-xs w-44 rounded-lg"
              />
              <Button size="sm" variant="outline" onClick={handleAddTag} className="h-8 text-xs font-bold px-2.5">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 360° Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80">
        {[
          { key: "overview", label: "Overview & Insights", icon: TrendingUp },
          { key: "orders", label: `Order History (${orders.length})`, icon: ShoppingBag },
          { key: "addresses", label: "Addresses & Delivery", icon: MapPin },
          { key: "notes", label: "Communication & Notes", icon: MessageCircle },
          { key: "loyalty", label: "Loyalty & Rewards", icon: Award },
          { key: "risk", label: "Risk & Fraud Check", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as ProfileTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-card text-muted-foreground border border-border hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Purchasing Behavior Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Total Orders Placed</span>
                <span className="font-bold font-mono text-foreground">{totalOrders}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Completed Deliveries</span>
                <span className="font-bold font-mono text-emerald-600">{completedOrders}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Cancelled Orders</span>
                <span className="font-bold font-mono text-rose-600">{cancelledOrders}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Returned Orders</span>
                <span className="font-bold font-mono text-red-600">{returnedOrders}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Average Order Value (AOV)</span>
                <span className="font-bold font-mono text-purple-600">৳ {formatAmount(aovTaka)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground font-semibold">Preferred Payment Method</span>
                <span className="font-bold text-foreground">Cash on Delivery (COD)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" /> Customer Loyalty Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                <Crown className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="font-black text-lg font-heading text-foreground">{membershipTier} Tier Member</p>
                <p className="text-muted-foreground text-xs">
                  Lifetime Value Spend: <strong className="text-emerald-600">৳ {formatAmount(totalSpendTaka)}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Tier Progress (Target: ৳50,000 for Platinum)</span>
                  <span className="font-mono text-amber-600 font-bold">{Math.min(100, Math.round((totalSpendTaka / 50000) * 100))}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((totalSpendTaka / 50000) * 100))}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Orders History */}
      {activeTab === "orders" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Order History ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">কোনো অর্ডার হিস্ট্রি পাওয়া যায়নি।</p>
            ) : (
              orders.map((o) => {
                const orderId = o.id || o._id;
                const orderNumber = o.orderNumber || `#${orderId.slice(-6)}`;
                const grandTotal = o.pricing?.grandTotal || o.total || 0;
                const grandTotalTaka = Math.round(grandTotal / 100);

                return (
                  <div key={orderId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/orders?search=${orderNumber}`} className="font-black text-amber-600 hover:underline">
                          {orderNumber}
                        </Link>
                        <Badge variant="outline" size="xs" className="uppercase font-bold">
                          {o.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="font-black font-mono text-sm text-foreground">৳ {formatAmount(grandTotalTaka)}</p>
                        <p className="text-[10px] text-muted-foreground">Items: {o.items?.length || 1}</p>
                      </div>
                      <Link href={`/dashboard/orders?search=${orderNumber}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-bold">
                          View Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Addresses */}
      {activeTab === "addresses" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" /> Saved Delivery Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!customer.addresses || customer.addresses.length === 0) ? (
              <div className="p-4 rounded-2xl border border-border bg-muted/20 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">Primary Registered Address</p>
                <p>{customer.address || "No address on file"}</p>
              </div>
            ) : (
              customer.addresses.map((addr: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-border bg-muted/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground uppercase">{addr.label || "Delivery Address"}</span>
                    {addr.isDefault && <Badge variant="success" size="xs">Default</Badge>}
                  </div>
                  <p className="text-muted-foreground">{addr.street || addr.address}, {addr.city || addr.district}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(addr.street || addr.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-amber-600 hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    Open in Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Notes & Communications */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" /> Add Staff Internal Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-3 text-xs">
                <Textarea
                  placeholder="Enter staff note or call conversation summary..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="min-h-[90px] text-xs"
                />
                <Button type="submit" size="sm" disabled={submittingNote || !noteInput.trim()} className="font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Save Staff Note
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Staff Notes History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {(!customer.notes || customer.notes.length === 0) ? (
                <p className="text-muted-foreground italic text-center py-4">কোনো পূর্বের নোট পাওয়া যায়নি।</p>
              ) : (
                customer.notes.map((n: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                    <p className="text-foreground">{n.text || n.note}</p>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Loyalty */}
      {activeTab === "loyalty" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" /> Loyalty & Membership Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Loyalty Points Balance</span>
                <p className="text-2xl font-black font-mono text-amber-500 mt-1">{Math.round(totalSpendTaka / 100)} Points</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Discount Privilege</span>
                <p className="text-2xl font-black font-mono text-emerald-600 mt-1">{isVip ? "10% VIP OFF" : "Standard"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 6: Risk */}
      {activeTab === "risk" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Risk & Fraud Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Customer Trust Score</p>
                <p className="text-muted-foreground text-[11px]">Calculated from delivery success ratio & cancellation rate</p>
              </div>
              <Badge variant={cancelledOrders >= 3 ? "destructive" : "success"} className="text-sm px-3 py-1 font-bold">
                {cancelledOrders >= 3 ? "High Risk" : "Verified Customer"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
