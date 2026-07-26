"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listCallLogsAction,
  createCallLogAction,
  getCallLogStatsAction,
} from "@/features/order/actions/call-log-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Phone,
  CalendarDays,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";

const OUTCOME_LABELS: Record<string, string> = {
  reached: "Reached",
  not_reached: "Not Reached",
  busy: "Busy",
  switched_off: "Switched Off",
  wrong_number: "Wrong Number",
  call_back_later: "Call Back Later",
  completed: "Completed",
};

export default function CallsPage(): React.ReactElement {
  const [items, setItems] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [outcomeFilter, setOutcomeFilter] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    orderId: "",
    customerName: "",
    customerPhone: "",
    staffName: "",
    duration: 0,
    outcome: "reached",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [listRes, statsRes] = await Promise.all([
      listCallLogsAction(1, 50, undefined, outcomeFilter || undefined),
      getCallLogStatsAction(),
    ]);
    if (listRes.success) setItems(listRes.data?.items ?? []);
    if (statsRes.success && statsRes.data) {
      setStats({
        total: statsRes.data.total,
        today: statsRes.data.todayCount ?? 0,
        reached: statsRes.data.byOutcome.reached ?? 0,
        not_reached:
          (statsRes.data.byOutcome.not_reached ?? 0) +
          (statsRes.data.byOutcome.busy ?? 0) +
          (statsRes.data.byOutcome.switched_off ?? 0) +
          (statsRes.data.byOutcome.wrong_number ?? 0),
      });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, [outcomeFilter]);

  const handleCreate = async () => {
    const res = await createCallLogAction({
      ...form,
      staffId: "system",
      duration: Number(form.duration),
    });
    if (res.success) {
      toast.success("কল লগ সংরক্ষিত");
      setShowForm(false);
      setForm({
        orderId: "",
        customerName: "",
        customerPhone: "",
        staffName: "",
        duration: 0,
        outcome: "reached",
        notes: "",
      });
      load();
    } else toast.error(res.error || "ব্যর্থ");
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
            <h1 className="text-2xl font-bold text-foreground">কল লগ</h1>
            <p className="text-sm text-muted-foreground">Call Log</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> New Call
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
              <Phone className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-xl font-bold">{stats.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-xl font-bold text-amber-400">{stats.today ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Reached</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{stats.reached ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-400" />
              <span className="text-xs text-muted-foreground">Not Reached</span>
            </div>
            <p className="text-xl font-bold text-rose-400">{stats.not_reached ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">নতুন কল লগ / New Call Log</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Order ID"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
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
              <Input
                placeholder="Staff Name"
                value={form.staffName}
                onChange={(e) => setForm({ ...form, staffName: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Duration (sec)"
                value={form.duration || ""}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              />
              <select
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground"
              >
                {Object.entries(OUTCOME_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="sm:col-span-2"
              />
            </div>
            <Button onClick={handleCreate} className="mt-2">
              Save
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground"
        >
          <option value="">All Outcomes</option>
          {Object.entries(OUTCOME_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  অর্ডার
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  গ্রাহক
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্টাফ</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">সময়</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">ফলাফল</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">নোট</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">তারিখ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    কোনো তথ্য নেই
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-3 text-sm font-medium">{item.orderNumber}</td>
                    <td className="p-3 text-sm">
                      {item.customerName}
                      <br />
                      <span className="text-xs text-muted-foreground">{item.customerPhone}</span>
                    </td>
                    <td className="p-3 text-sm">{item.staffName}</td>
                    <td className="p-3 text-right text-sm">{item.duration}s</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          item.outcome === "reached" || item.outcome === "completed"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {OUTCOME_LABELS[item.outcome] ?? item.outcome}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">
                      {item.notes ?? "-"}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(item.callTime ?? item.createdAt).toLocaleString()}
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
