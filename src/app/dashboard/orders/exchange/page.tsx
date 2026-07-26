"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listExchangesAction,
  updateExchangeStatusAction,
} from "@/features/order/actions/exchange-actions";
import {
  getExchangeHumanLabel,
  type ExchangeStatus,
} from "@/features/order/domain/exchange-entity";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Truck, Package, XCircle } from "lucide-react";

export default function ExchangePage(): React.ReactElement {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    setLoading(true);
    const res = await listExchangesAction(1, 50);
    if (res.success) setItems(res.data?.items ?? []);
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleTransition = async (id: string, toStatus: ExchangeStatus) => {
    const res = await updateExchangeStatusAction({ exchangeId: id, toStatus });
    if (res.success) {
      toast.success("আপডেট হয়েছে");
      load();
    } else toast.error(res.error || "ব্যর্থ");
  };

  const getVariant = (status: string) => {
    if (["completed", "delivered"].includes(status)) return "success" as const;
    if (["rejected"].includes(status)) return "destructive" as const;
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
            <h1 className="text-2xl font-bold text-foreground">এক্সচেঞ্জ ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground">Exchange Management</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  এক্সচেঞ্জ #
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  অর্ডার
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">কারণ</th>
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
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    কোনো এক্সচেঞ্জ নেই
                  </td>
                </tr>
              ) : (
                items.map((e: any) => (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-3 font-medium">{e.exchangeNumber}</td>
                    <td className="p-3 text-sm">{e.orderNumber}</td>
                    <td className="p-3 text-sm max-w-[200px] truncate">{e.reason}</td>
                    <td className="p-3">
                      <Badge variant={getVariant(e.status)}>
                        {getExchangeHumanLabel(e.status)}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      {e.status === "requested" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransition(e.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTransition(e.id, "rejected")}
                            className="ml-1"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {e.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTransition(e.id, "pickup_scheduled")}
                        >
                          <Truck className="h-3.5 w-3.5 mr-1" /> Schedule Pickup
                        </Button>
                      )}
                      {e.status === "picked_up" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTransition(e.id, "replacement_shipped")}
                        >
                          <Package className="h-3.5 w-3.5 mr-1" /> Ship Replacement
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
    </div>
  );
}
