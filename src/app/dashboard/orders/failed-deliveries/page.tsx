"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listUnresolvedDeliveriesAction,
  resolveFailedDeliveryAction,
  getFailedDeliveryStatsAction,
} from "@/features/order/actions/failed-delivery-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  PackageX,
  CheckCircle,
  AlertTriangle,
  Search,
  ChevronRight,
} from "lucide-react";

const NEXT_ACTION_LABELS: Record<string, string> = {
  redelivery: "Redelivery",
  cancel: "Cancel",
  change_address: "Change Address",
  change_phone: "Change Phone",
  assign_courier: "Assign Courier",
  customer_confirmation: "Customer Confirmation",
  return_to_warehouse: "Return to Warehouse",
};

export default function FailedDeliveriesPage(): React.ReactElement {
  const [items, setItems] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [courierFilter, setCourierFilter] = React.useState("");
  const [resolveDialog, setResolveDialog] = React.useState<{
    open: boolean;
    id: string;
    nextAction: string;
    notes: string;
  }>({ open: false, id: "", nextAction: "redelivery", notes: "" });

  const load = async () => {
    setLoading(true);
    const [listRes, statsRes] = await Promise.all([
      listUnresolvedDeliveriesAction(1, 50),
      getFailedDeliveryStatsAction(),
    ]);
    if (listRes.success) setItems(listRes.data?.items ?? []);
    if (statsRes.success && statsRes.data) {
      setStats({
        total: statsRes.data.total,
        unresolved: statsRes.data.unresolvedCount ?? 0,
        resolved: statsRes.data.total - (statsRes.data.unresolvedCount ?? 0),
      });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleResolve = async () => {
    const res = await resolveFailedDeliveryAction({
      failedDeliveryId: resolveDialog.id,
      nextAction: resolveDialog.nextAction,
      notes: resolveDialog.notes || undefined,
    });
    if (res.success) {
      toast.success("সমাধান করা হয়েছে");
      setResolveDialog({ open: false, id: "", nextAction: "redelivery", notes: "" });
      load();
    } else toast.error(res.error || "ব্যর্থ");
  };

  const getVariant = (s: string) =>
    s === "resolved" ? ("success" as const) : ("warning" as const);

  const filtered = items.filter(
    (i) => !courierFilter || i.courierName?.toLowerCase().includes(courierFilter.toLowerCase()),
  );

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
            <h1 className="text-2xl font-bold text-foreground">ব্যর্থ ডেলিভারি</h1>
            <p className="text-sm text-muted-foreground">Failed Delivery Center</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PackageX className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-xl font-bold">{stats.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Unresolved</span>
            </div>
            <p className="text-xl font-bold text-amber-400">{stats.unresolved ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Resolved</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{stats.resolved ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ফিল্টার কুরিয়ার..."
          value={courierFilter}
          onChange={(e) => setCourierFilter(e.target.value)}
          className="pl-9 h-9"
        />
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
                  কুরিয়ার
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  ট্র্যাকিং
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">কারণ</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">
                  চেষ্টা
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  পরবর্তী পদক্ষেপ
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  স্ট্যাটাস
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    কোনো তথ্য নেই
                  </td>
                </tr>
              ) : (
                filtered.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-3 text-sm font-medium">{item.orderNumber}</td>
                    <td className="p-3 text-sm">{item.courierName}</td>
                    <td className="p-3 text-sm font-mono">{item.trackingNumber}</td>
                    <td className="p-3 text-sm max-w-[160px] truncate">{item.reason}</td>
                    <td className="p-3 text-right text-sm">{item.attemptCount}</td>
                    <td className="p-3 text-sm">
                      {NEXT_ACTION_LABELS[item.nextAction] ?? item.nextAction}
                    </td>
                    <td className="p-3">
                      <Badge variant={getVariant(item.resolved ? "resolved" : "unresolved")}>
                        {item.resolved ? "Resolved" : "Unresolved"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      {!item.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setResolveDialog({
                              open: true,
                              id: item.id,
                              nextAction: item.nextAction || "redelivery",
                              notes: "",
                            })
                          }
                        >
                          <ChevronRight className="h-3.5 w-3.5 mr-1" /> Resolve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog
        open={resolveDialog.open}
        onOpenChange={(o) => setResolveDialog({ ...resolveDialog, open: o })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>সমাধান / Resolve Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs text-muted-foreground">Next Action</label>
            <select
              value={resolveDialog.nextAction}
              onChange={(e) => setResolveDialog({ ...resolveDialog, nextAction: e.target.value })}
              className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm"
            >
              {Object.entries(NEXT_ACTION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Input
              placeholder="Notes (optional)"
              value={resolveDialog.notes}
              onChange={(e) => setResolveDialog({ ...resolveDialog, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setResolveDialog({ open: false, id: "", nextAction: "redelivery", notes: "" })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleResolve}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
