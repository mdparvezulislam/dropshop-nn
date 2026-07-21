"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  listUsersAdminAction,
  updateUserStatusAdminAction,
} from "../actions/admin-identity-actions";
import { forceLogoutUserAction as forceLogout } from "../actions/session-actions";

interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  status: string;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

export function UsersAdmin(): React.ReactElement {
  const [items, setItems] = useState<SafeUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listUsersAdminAction({
      page: 1,
      limit: 50,
      search: search || undefined,
    });
    if (res.success && res.data) {
      setItems(res.data.items as SafeUser[]);
      setTotal(res.data.totalCount);
    } else {
      toast.error(res.error ?? "Failed to load users");
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const setStatus = async (userId: string, status: "active" | "pending" | "suspended") => {
    if (status === "suspended" && !window.confirm("Suspend this user?")) return;
    setBusyId(userId);
    const res = await updateUserStatusAdminAction({ userId, status });
    setBusyId(null);
    if (res.success) {
      toast.success(`User marked ${status}`);
      load();
    } else toast.error(res.error ?? "Update failed");
  };

  const logout = async (userId: string) => {
    if (!window.confirm("Force logout all sessions for this user?")) return;
    setBusyId(userId);
    const res = await forceLogout(userId);
    setBusyId(null);
    if (res.success) toast.success(`Revoked ${res.data?.revokedCount ?? 0} session(s)`);
    else toast.error((res as { error?: string }).error ?? "Failed");
  };

  const statusColor = (s: string) =>
    s === "active"
      ? "text-emerald-600 border-emerald-500/30"
      : s === "suspended"
        ? "text-rose-600 border-rose-500/30"
        : "text-amber-600 border-amber-500/30";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Users</h1>
          <p className="text-sm text-muted-foreground">
            Platform accounts · {total} total · Identity Engine
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, username…"
          className="pl-8"
        />
      </div>

      <Card>
        <CardContent className="divide-y divide-border/40 p-0">
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No users found.</p>
          ) : (
            items.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{u.fullName}</p>
                    <Badge variant="outline" className="capitalize">
                      {u.role}
                    </Badge>
                    <Badge variant="outline" className={`capitalize ${statusColor(u.status)}`}>
                      {u.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {u.email} · @{u.username} · {u.phone}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {u.status !== "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === u.id}
                      onClick={() => setStatus(u.id, "active")}
                    >
                      Activate
                    </Button>
                  )}
                  {u.status !== "suspended" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600"
                      disabled={busyId === u.id}
                      onClick={() => setStatus(u.id, "suspended")}
                    >
                      Suspend
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === u.id}
                    onClick={() => logout(u.id)}
                  >
                    Force logout
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
