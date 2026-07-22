"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { listCodAction, reconcileCodAction, settleCodAction, getCodStatsAction } from "@/features/order/actions/cod-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Search, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function CodCenterPage(): React.ReactElement {
  const [items, setItems] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const load = async () => {
    setLoading(true);
    const [listRes, statsRes] = await Promise.all([
      listCodAction(1, 50),
      getCodStatsAction(),
    ]);
    if (listRes.success) setItems(listRes.data?.items ?? []);
    if (statsRes.success && statsRes.data) {
      const s = statsRes.data;
      setStats({
        total: Object.values(s.byStatus).reduce((a, b) => a + b, 0),
        pending: s.byStatus.pending ?? 0,
        settled: s.byStatus.settled ?? 0,
        partial: s.byStatus.partial ?? 0,
        disputed: s.byStatus.disputed ?? 0,
        mismatched: s.totalMismatched,
      });
    }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleReconcile = async (codId: string, expected: number) => {
    const res = await reconcileCodAction({ codId, receivedAmount: expected });
    if (res.success) { toast.success("COD reconciled"); load(); }
    else toast.error(res.error);
  };

  const handleSettle = async (codId: string) => {
    const res = await settleCodAction({ codId });
    if (res.success) { toast.success("COD settled"); load(); }
    else toast.error(res.error);
  };

  const formatCurrency = (amount: number) =>
    `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const filtered = items.filter((i) =>
    !search || i.orderNumber?.includes(search) || i.trackingNumber?.includes(search) || i.courierName?.includes(search)
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">COD রিকনসিলিয়েশন</h1>
            <p className="text-sm text-muted-foreground">COD Reconciliation Center</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-blue-400" /><span className="text-xs text-muted-foreground">Total</span></div>
            <p className="text-xl font-bold">{stats.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" /><span className="text-xs text-muted-foreground">Pending</span></div>
            <p className="text-xl font-bold text-amber-400">{stats.pending ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span className="text-xs text-muted-foreground">Settled</span></div>
            <p className="text-xl font-bold text-emerald-400">{stats.settled ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-400" /><span className="text-xs text-muted-foreground">Mismatched</span></div>
            <p className="text-xl font-bold text-rose-400">{stats.mismatched ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search order, tracking, courier..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">Order</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">Courier</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">Tracking</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">Expected</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">Received</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">Difference</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">No COD records found</td></tr>
              ) : filtered.map((item: any) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3 text-sm font-medium">{item.orderNumber}</td>
                  <td className="p-3 text-sm">{item.courierName}</td>
                  <td className="p-3 text-sm font-mono">{item.trackingNumber}</td>
                  <td className="p-3 text-right text-sm">{formatCurrency(item.expectedAmount)}</td>
                  <td className="p-3 text-right text-sm">{formatCurrency(item.receivedAmount)}</td>
                  <td className={`p-3 text-right text-sm font-medium ${item.difference !== 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {formatCurrency(item.difference)}
                  </td>
                  <td className="p-3">
                    <Badge variant={item.settlementStatus === "settled" ? "success" : item.settlementStatus === "partial" ? "warning" : "default"}>
                      {item.settlementStatus}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    {item.settlementStatus === "pending" && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleReconcile(item.id, item.expectedAmount)}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Receive
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSettle(item.id)}>
                          Settle
                        </Button>
                      </div>
                    )}
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
