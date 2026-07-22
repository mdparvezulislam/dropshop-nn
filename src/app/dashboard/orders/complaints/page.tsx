"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  listComplaintsAction,
  updateComplaintStatusAction,
  getComplaintStatsAction,
} from "@/features/order/actions/complaint-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, AlertTriangle, Clock, CheckCircle, ArrowUpRight, Search } from "lucide-react";

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low", normal: "Normal", high: "High", urgent: "Urgent",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Open", in_progress: "In Progress", resolved: "Resolved", escalated: "Escalated", closed: "Closed",
};
const TYPE_LABELS: Record<string, string> = {
  wrong_product: "Wrong Product", damaged_product: "Damaged Product", missing_item: "Missing Item",
  courier_delay: "Courier Delay", late_delivery: "Late Delivery", refund_issue: "Refund Issue",
  warranty_issue: "Warranty Issue", exchange_issue: "Exchange Issue", payment_issue: "Payment Issue", other: "Other",
};

export default function ComplaintsPage(): React.ReactElement {
  const [items, setItems] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");

  const load = async () => {
    setLoading(true);
    const [listRes, statsRes] = await Promise.all([
      listComplaintsAction(1, 50, statusFilter || undefined, priorityFilter || undefined),
      getComplaintStatsAction(),
    ]);
    if (listRes.success) setItems(listRes.data?.items ?? []);
    if (statsRes.success && statsRes.data) {
      setStats({
        total: statsRes.data.total,
        open: statsRes.data.byStatus.open ?? 0,
        in_progress: statsRes.data.byStatus.in_progress ?? 0,
        resolved: statsRes.data.byStatus.resolved ?? 0,
        escalated: statsRes.data.byStatus.escalated ?? 0,
      });
    }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, [statusFilter, priorityFilter]);

  const handleStatus = async (complaintId: string, status: string) => {
    const res = await updateComplaintStatusAction({ complaintId, status });
    if (res.success) { toast.success("স্ট্যাটাস আপডেট হয়েছে"); load(); }
    else toast.error(res.error || "ব্যর্থ");
  };

  const getVariant = (s: string) => {
    if (s === "resolved" || s === "closed") return "success" as const;
    if (s === "escalated") return "destructive" as const;
    if (s === "in_progress") return "warning" as const;
    return "default" as const;
  };

  const getPriorityVariant = (p: string) => {
    if (p === "urgent") return "destructive" as const;
    if (p === "high") return "warning" as const;
    return "default" as const;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">কমপ্লেইন্ট সেন্টার</h1>
            <p className="text-sm text-muted-foreground">Complaint Center</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-blue-400" /><span className="text-xs text-muted-foreground">Total</span></div>
            <p className="text-xl font-bold">{stats.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" /><span className="text-xs text-muted-foreground">Open</span></div>
            <p className="text-xl font-bold text-amber-400">{stats.open ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-sky-400" /><span className="text-xs text-muted-foreground">In Progress</span></div>
            <p className="text-xl font-bold text-sky-400">{stats.in_progress ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span className="text-xs text-muted-foreground">Resolved</span></div>
            <p className="text-xl font-bold text-emerald-400">{stats.resolved ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-400" /><span className="text-xs text-muted-foreground">Escalated</span></div>
            <p className="text-xl font-bold text-rose-400">{stats.escalated ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">কমপ্লেইন্ট #</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">অর্ডার</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">গ্রাহক</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">ধরন</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">প্রাধান্য</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্ট্যাটাস</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">দায়িত্বে</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">তারিখ</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">কোনো তথ্য নেই</td></tr>
              ) : items.map((item: any) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3 font-medium text-sm">{item.complaintNumber}</td>
                  <td className="p-3 text-sm">{item.orderNumber}</td>
                  <td className="p-3 text-sm">{item.customerName}</td>
                  <td className="p-3 text-sm">{TYPE_LABELS[item.type] ?? item.type}</td>
                  <td className="p-3"><Badge variant={getPriorityVariant(item.priority)}>{PRIORITY_LABELS[item.priority]}</Badge></td>
                  <td className="p-3"><Badge variant={getVariant(item.status)}>{STATUS_LABELS[item.status]}</Badge></td>
                  <td className="p-3 text-sm text-muted-foreground">{item.assignedToName ?? "-"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.status === "open" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatus(item.id, "in_progress")}>
                          Start
                        </Button>
                      )}
                      {item.status === "in_progress" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatus(item.id, "resolved")}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatus(item.id, "escalated")}>
                            Escalate
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
