"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { listAllActiveSessionsAdminAction } from "../actions/admin-identity-actions";
import { forceLogoutUserAction } from "../actions/session-actions";

interface SessionRow {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
}

export function SessionsAdmin(): React.ReactElement {
  const [items, setItems] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listAllActiveSessionsAdminAction();
    if (res.success && res.data) setItems(res.data as SessionRow[]);
    else {
      setItems([]);
      if (!res.success) toast.error(res.error ?? "Failed to load sessions");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const forceLogout = async (userId: string): Promise<void> => {
    if (!window.confirm("Revoke all sessions for this user?")) return;
    const res = await forceLogoutUserAction(userId);
    if (res.success) {
      toast.success(`Revoked ${res.data?.revokedCount ?? 0} session(s)`);
      load();
    } else toast.error((res as { error?: string }).error ?? "Failed");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Active platform sessions · force logout for security ops
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
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
              No active sessions recorded.
            </p>
          ) : (
            items.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">User {s.userId.slice(0, 12)}…</p>
                  <p className="text-xs text-muted-foreground">
                    {s.ipAddress} · {s.userAgent.slice(0, 60)}
                    {s.userAgent.length > 60 ? "…" : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Started {new Date(s.createdAt).toLocaleString()} · expires{" "}
                    {new Date(s.expiresAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-rose-600"
                  onClick={() => forceLogout(s.userId)}
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                  Force logout
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
