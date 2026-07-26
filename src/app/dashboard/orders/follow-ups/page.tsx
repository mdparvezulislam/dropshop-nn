"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listFollowUpsAction,
  updateFollowUpStatusAction,
  createFollowUpAction,
  getFollowUpStatsAction,
} from "@/features/order/actions/follow-up-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle,
  SkipForward,
  AlertTriangle,
  Plus,
} from "lucide-react";

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};
const TYPE_LABELS: Record<string, string> = {
  call: "Call",
  message: "Message",
  delivery_reminder: "Delivery Reminder",
  payment_reminder: "Payment Reminder",
  custom: "Custom",
};

export default function FollowUpsPage(): React.ReactElement {
  const [items, setItems] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    orderId: "",
    title: "",
    dueDate: "",
    priority: "normal",
    type: "call",
    customerName: "",
    customerPhone: "",
  });

  const load = async () => {
    setLoading(true);
    const [listRes, statsRes] = await Promise.all([
      listFollowUpsAction(1, 50, statusFilter || undefined, priorityFilter || undefined),
      getFollowUpStatsAction(),
    ]);
    if (listRes.success) setItems(listRes.data?.items ?? []);
    if (statsRes.success && statsRes.data) {
      setStats({
        total: statsRes.data.total,
        pending: statsRes.data.byStatus.pending ?? 0,
        completed: statsRes.data.byStatus.completed ?? 0,
        overdue: statsRes.data.overdueCount ?? 0,
      });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, [statusFilter, priorityFilter]);

  const handleStatus = async (followUpId: string, status: string) => {
    const res = await updateFollowUpStatusAction({ followUpId, status });
    if (res.success) {
      toast.success("আপডেট হয়েছে");
      load();
    } else toast.error(res.error || "ব্যর্থ");
  };

  const handleCreate = async () => {
    const res = await createFollowUpAction(form);
    if (res.success) {
      toast.success("ফলো-আপ তৈরি হয়েছে");
      setShowForm(false);
      setForm({
        orderId: "",
        title: "",
        dueDate: "",
        priority: "normal",
        type: "call",
        customerName: "",
        customerPhone: "",
      });
      load();
    } else toast.error(res.error || "ব্যর্থ");
  };

  const isOverdue = (item: any) => item.status === "pending" && new Date(item.dueDate) < new Date();

  const getVariant = (s: string) => {
    if (s === "completed") return "success" as const;
    if (s === "skipped" || s === "cancelled") return "secondary" as const;
    return "default" as const;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ফলো-আপ সেন্টার</h1>
            <p className="text-sm text-muted-foreground">Follow-up Center</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
          <Button variant="ghost" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-xl font-bold">{stats.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-xl font-bold text-amber-400">{stats.pending ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{stats.completed ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-xs text-muted-foreground">Overdue</span>
            </div>
            <p className="text-xl font-bold text-rose-400">{stats.overdue ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">নতুন ফলো-আপ / New Follow-up</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Order ID"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              />
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
              <Input
                placeholder="Customer Name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
              <Input
                placeholder="Customer Phone"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              />
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground"
              >
                <option value="call">Call</option>
                <option value="message">Message</option>
                <option value="delivery_reminder">Delivery Reminder</option>
                <option value="payment_reminder">Payment Reminder</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <Button onClick={handleCreate} className="mt-2">
              Create
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground"
        >
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
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  শিরোনাম
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  অর্ডার
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">ধরন</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  প্রাধান্য
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  শেষ তারিখ
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  স্ট্যাটাস
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  দায়িত্বে
                </th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    কোনো তথ্য নেই
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/30 hover:bg-muted/20 ${isOverdue(item) ? "bg-rose-500/5" : ""}`}
                  >
                    <td className="p-3 text-sm font-medium">{item.title}</td>
                    <td className="p-3 text-sm">{item.orderNumber}</td>
                    <td className="p-3 text-sm">{TYPE_LABELS[item.type] ?? item.type}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          item.priority === "urgent"
                            ? "destructive"
                            : item.priority === "high"
                              ? "warning"
                              : "default"
                        }
                      >
                        {PRIORITY_LABELS[item.priority]}
                      </Badge>
                    </td>
                    <td
                      className={`p-3 text-sm ${isOverdue(item) ? "text-rose-400 font-semibold" : "text-muted-foreground"}`}
                    >
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Badge variant={getVariant(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {item.assignedToName ?? "-"}
                    </td>
                    <td className="p-3 text-right">
                      {item.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatus(item.id, "completed")}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStatus(item.id, "skipped")}
                          >
                            <SkipForward className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
