"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPendingApprovalsAction } from "../actions/business-profile-actions";
import { approveBusinessAction, rejectBusinessAction } from "../actions/verification-actions";

interface PendingProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  primaryPhone?: string;
  role: string;
  status: string;
  verificationStatus?: string;
  createdAt: Date;
  address?: { fullAddress?: string; district?: string };
}

export function ApprovalsQueue(): React.ReactElement {
  const [items, setItems] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getPendingApprovalsAction();
    if (res.success && res.data) {
      setItems(res.data as PendingProfile[]);
    } else {
      setItems([]);
      if (!res.success) toast.error((res as { error?: string }).error ?? "Failed to load");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string): Promise<void> => {
    setBusyId(id);
    const res = await approveBusinessAction(id);
    setBusyId(null);
    if (res.success) {
      toast.success("Business approved");
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      toast.error((res as { error?: string }).error ?? "Approve failed");
    }
  };

  const reject = async (id: string): Promise<void> => {
    const reason = window.prompt("Rejection reason (optional)") ?? undefined;
    setBusyId(id);
    const res = await rejectBusinessAction(id, reason);
    setBusyId(null);
    if (res.success) {
      toast.success("Business rejected");
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      toast.error((res as { error?: string }).error ?? "Reject failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Approval Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review reseller, wholesale, and supplier business applications.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y divide-border/40 p-0">
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Queue is clear — no pending applications.
            </p>
          ) : (
            items.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{p.businessName}</p>
                    <Badge variant="outline" className="capitalize">
                      {p.role}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-amber-600">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.ownerName} · {p.email}
                    {p.primaryPhone ? ` · ${p.primaryPhone}` : ""}
                  </p>
                  {p.address?.fullAddress || p.address?.district ? (
                    <p className="text-[11px] text-muted-foreground/80">
                      {p.address.fullAddress || p.address.district}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-rose-600"
                    disabled={busyId === p.id}
                    onClick={() => reject(p.id)}
                  >
                    {busyId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1"
                    disabled={busyId === p.id}
                    onClick={() => approve(p.id)}
                  >
                    {busyId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
