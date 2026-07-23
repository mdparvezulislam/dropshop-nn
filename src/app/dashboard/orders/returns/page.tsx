"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listReturnsAction, updateReturnStatusAction } from "@/features/order/actions/return-actions";
import { getReturnHumanLabel, type ReturnStatus } from "@/features/order/domain/return-entity";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Undo2, ShieldCheck, XCircle, Search } from "lucide-react";

export default function ReturnsPage(): React.ReactElement {
  const [returns, setReturns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    setLoading(true);
    const res = await listReturnsAction(1, 50);
    if (res.success) setReturns(res.data?.items ?? []);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleTransition = async (returnId: string, toStatus: ReturnStatus) => {
    const res = await updateReturnStatusAction({ returnId, toStatus });
    if (res.success) { toast.success("স্ট্যাটাস আপডেট হয়েছে"); load(); }
    else toast.error(res.error || "ব্যর্থ");
  };

  const getVariant = (status: string) => {
    if (["completed", "refunded"].includes(status)) return "success" as const;
    if (["rejected"].includes(status)) return "destructive" as const;
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
            <h1 className="text-2xl font-bold text-foreground">রিটার্ন ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground">Return Management</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">রিটার্ন #</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">অর্ডার</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">কারণ</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">পণ্য</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্ট্যাটাস</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">তারিখ</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">কোনো রিটার্ন নেই</td></tr>
              ) : returns.map((r: any) => (
                <tr key={r.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3 font-medium">{r.returnNumber}</td>
                  <td className="p-3 text-sm">{r.orderNumber}</td>
                  <td className="p-3 text-sm max-w-[200px] truncate">{r.reason}</td>
                  <td className="p-3 text-sm">{r.items?.length ?? 0}টি</td>
                  <td className="p-3">
                    <Badge variant={getVariant(r.status)}>{getReturnHumanLabel(r.status)}</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === "requested" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleTransition(r.id, "approved")}>
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleTransition(r.id, "rejected")}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {r.status === "inspecting" && (
                        <Button size="sm" variant="outline" onClick={() => handleTransition(r.id, "approved_for_refund")}>
                          <Undo2 className="h-3.5 w-3.5 mr-1" /> Approve Refund
                        </Button>
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
