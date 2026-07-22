"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { getCustomerAction } from "@/features/customer/actions/customer-actions";
import { listOrdersAction } from "@/features/order/actions/order-actions";
import { getReturnStatsAction } from "@/features/order/actions/return-actions";
import { getWarrantyStatsAction } from "@/features/order/actions/warranty-actions";
import { getExchangeStatsAction } from "@/features/order/actions/exchange-actions";
import { getComplaintStatsAction } from "@/features/order/actions/complaint-actions";
import { getOrderRisksAction } from "@/features/order/actions/risk-actions";
import { updateTagsAction } from "@/features/customer/actions/customer-actions";
import { toast } from "sonner";
import {
  ArrowLeft, RefreshCw, Phone, MapPin, Shield,
  ShoppingBag, CheckCircle, XCircle, Undo2,
  Tag, Clock, User, Mail, AlertTriangle,
  Plus, X,
} from "lucide-react";

export default function CustomerProfilePage(): React.ReactElement {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [risks, setRisks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"orders" | "timeline" | "risk">("orders");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, oRes] = await Promise.all([
        getCustomerAction(customerId),
        listOrdersAction({ page: 1, limit: 50, search: "" }),
      ]);

      if (cRes.success && cRes.data) {
        setCustomer(cRes.data);
        setTags(cRes.data.tags ?? []);

        const phone = cRes.data.phone;
        if (oRes.success && oRes.data?.items) {
          const customerOrders = oRes.data.items.filter(
            (o: any) => o.customer?.phone === phone,
          );
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
        // risk load failure is non-critical
      }
    } catch {
      toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  React.useEffect(() => { load(); }, [load]);

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

  const handleRemoveTag = async (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    const res = await updateTagsAction({ customerId, tags: updated });
    if (res.success) {
      setTags(updated);
      toast.success("ট্যাগ সরানো হয়েছে");
    } else {
      toast.error(res.error || "ট্যাগ আপডেট ব্যর্থ");
    }
  };

  const formatCurrency = (amount: number) =>
    `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": case "delivered": return "success" as const;
      case "pending": case "draft": return "warning" as const;
      case "cancelled": case "failed": return "destructive" as const;
      default: return "default" as const;
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "critical": return "destructive" as const;
      case "high": return "destructive" as const;
      case "medium": return "warning" as const;
      default: return "default" as const;
    }
  };

  // Build unified timeline from orders, customer timeline, and risks
  const unifiedTimeline = React.useMemo(() => {
    const entries: { date: Date; type: string; message: string; status?: string }[] = [];

    if (customer?.timeline) {
      for (const entry of customer.timeline) {
        entries.push({
          date: new Date(entry.timestamp),
          type: entry.eventType,
          message: entry.message,
        });
      }
    }

    for (const order of orders) {
      entries.push({
        date: new Date(order.createdAt),
        type: "order.created",
        message: `অর্ডার #${order.orderNumber} তৈরি করা হয়েছে`,
        status: order.status,
      });
    }

    for (const risk of risks) {
      entries.push({
        date: new Date(risk.createdAt),
        type: "risk.flagged",
        message: `রিস্ক ফ্ল্যাগ: ${risk.riskLevel} - ${risk.category} (${risk.reason})`,
      });
    }

    entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    return entries;
  }, [customer, orders, risks]);

  if (!loading && !customer) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <Link href="/dashboard/orders/customers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> গ্রাহক অপারেশনস
        </Link>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground mb-1">গ্রাহক পাওয়া যায়নি</h2>
            <p className="text-sm text-muted-foreground">Customer Not Found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders/customers" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">গ্রাহক প্রোফাইল</h1>
            <p className="text-sm text-muted-foreground">Customer Profile & Operations View</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">লোড হচ্ছে...</div>
      ) : (
        <>
          {/* Profile Card */}
          <Card className="border-border/50 bg-card">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{customer.name}</h2>
                      <Badge variant={customer.status === "active" ? "success" : customer.status === "blacklisted" ? "destructive" : "default"}>
                        {customer.status === "active" ? "সক্রিয়" : customer.status === "inactive" ? "নিষ্ক্রিয়" : "ব্ল্যাকলিস্টেড"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" /> {customer.email}
                      </div>
                    )}
                    {customer.addresses?.[0] && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {customer.addresses[0].district}
                        {customer.addresses[0].area && `, ${customer.addresses[0].area}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                    <ShoppingBag className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                    <p className="text-lg font-bold text-blue-400">{customer.statistics?.totalOrders ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">মোট অর্ডার</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                    <CheckCircle className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                    <p className="text-lg font-bold text-emerald-400">{customer.statistics?.completedOrders ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">সফল</p>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-500/10 text-center">
                    <XCircle className="h-4 w-4 mx-auto mb-1 text-rose-400" />
                    <p className="text-lg font-bold text-rose-400">{customer.statistics?.cancelledOrders ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">বাতিল</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                    <Undo2 className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                    <p className="text-lg font-bold text-amber-400">{customer.statistics?.totalOrders ? (customer.statistics.cancelledOrders / customer.statistics.totalOrders * 100).toFixed(0) : 0}%</p>
                    <p className="text-[10px] text-muted-foreground">ক্যান্সেল রেট</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" /> ট্যাগসমূহ <span className="text-muted-foreground font-normal">Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="নতুন ট্যাগ..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="h-8 text-sm max-w-[200px]"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                />
                <Button size="sm" variant="outline" onClick={handleAddTag}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Risk Flags */}
          {risks.length > 0 && (
            <Card className="border-border/50 bg-card border-rose-500/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-400">
                  <Shield className="h-4 w-4" /> রিস্ক ফ্ল্যাগ <span className="text-muted-foreground font-normal">Risk Flags</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {risks.map((risk: any) => (
                  <div key={risk.id} className="flex items-center justify-between p-2 rounded-lg bg-rose-500/5">
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeVariant(risk.riskLevel)}>{risk.riskLevel}</Badge>
                      <span className="text-sm text-muted-foreground">{risk.category}</span>
                      <span className="text-xs text-muted-foreground">{risk.reason}</span>
                    </div>
                    {risk.resolved && <Badge variant="success">রিজলভড</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border/50">
            {[
              { key: "orders" as const, label: "অর্ডার সমূহ", labelEn: "Orders" },
              { key: "timeline" as const, label: "টাইমলাইন", labelEn: "Timeline" },
              { key: "risk" as const, label: "রিস্ক", labelEn: "Risk" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <Card className="border-border/50 bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="p-3 text-left text-xs font-semibold text-muted-foreground">অর্ডার</th>
                      <th className="p-3 text-left text-xs font-semibold text-muted-foreground">পণ্য</th>
                      <th className="p-3 text-right text-xs font-semibold text-muted-foreground">মোট</th>
                      <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্ট্যাটাস</th>
                      <th className="p-3 text-right text-xs font-semibold text-muted-foreground">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        কোনো অর্ডার পাওয়া যায়নি
                      </td></tr>
                    ) : orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="p-3">
                          <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-foreground hover:text-primary text-sm">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="p-3 max-w-[180px] truncate text-sm text-muted-foreground">
                          {order.items?.map((i: any) => i.productName).join(", ") || "—"}
                        </td>
                        <td className="p-3 text-right text-sm font-semibold text-foreground">
                          {formatCurrency(order.pricing?.grandTotal ?? 0)}
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                        </td>
                        <td className="p-3 text-right text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                {unifiedTimeline.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    কোনো ইভেন্ট পাওয়া যায়নি
                  </div>
                ) : (
                  <div className="space-y-0">
                    {unifiedTimeline.map((entry, idx) => (
                      <div key={idx} className="relative pl-6 pb-5 border-l border-border/50 last:pb-0">
                        <div className="absolute left-[-4.5px] top-1 h-2 w-2 rounded-full bg-primary/50" />
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-foreground">{entry.message}</p>
                            {entry.status && (
                              <Badge variant={getStatusVariant(entry.status)} className="mt-1 text-[10px]">
                                {entry.status}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {entry.date.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Risk Tab */}
          {activeTab === "risk" && (
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                {risks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50 text-emerald-400" />
                    <p>কোনো রিস্ক ফ্ল্যাগ নেই</p>
                    <p className="text-xs">No risk flags detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {risks.map((risk: any) => (
                      <div key={risk.id} className="p-4 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getRiskBadgeVariant(risk.riskLevel)}>
                              {risk.riskLevel}
                            </Badge>
                            <span className="text-sm font-medium">{risk.category}</span>
                          </div>
                          {risk.resolved && <Badge variant="success">রিজলভড</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{risk.reason}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>কনফিডেন্স: {risk.confidence}%</span>
                          <span>•</span>
                          <span>ডিটেক্টেড: {risk.detectedBy}</span>
                          {risk.resolvedAt && (
                            <>
                              <span>•</span>
                              <span>রিজলভড: {new Date(risk.resolvedAt).toLocaleDateString("bn-BD")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
