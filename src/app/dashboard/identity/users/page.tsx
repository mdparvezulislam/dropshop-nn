"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listUsersAdminAction, updateUserStatusAdminAction } from "@/features/identity/actions/admin-identity-actions";
import { bulkUpdateUserStatusAction } from "@/features/identity/actions/identity-center-actions";
import { forceLogoutUserAction } from "@/features/identity/actions/session-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Search, Eye, Ban, CheckCircle, Monitor, Download } from "lucide-react";

export default function UserDirectoryPage(): React.ReactElement {
  const [users, setUsers] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listUsersAdminAction({
      page,
      limit: 25,
      search: search || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
    });
    if (res.success && res.data) {
      setUsers(res.data.items as any[]);
      setTotal(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } else { toast.error(res.error ?? "Failed to load"); }
    setLoading(false);
  }, [search, roleFilter, statusFilter, page]);

  React.useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  const handleStatus = async (userId: string, status: "active" | "pending" | "suspended") => {
    const res = await updateUserStatusAdminAction({ userId, status });
    if (res.success) { toast.success(`ব্যবহারকারী ${status} হয়েছে`); load(); }
    else toast.error(res.error ?? "আপডেট ব্যর্থ");
  };

  const handleForceLogout = async (userId: string) => {
    const res = await forceLogoutUserAction(userId);
    if (res.success) { toast.success(`সেশন বাতিল করা হয়েছে`); load(); }
    else toast.error("ব্যর্থ");
  };

  const handleBulkAction = async (status: "active" | "suspended") => {
    if (selectedIds.size === 0) { toast.error("অন্তত একজন নির্বাচন করুন"); return; }
    const res = await bulkUpdateUserStatusAction(Array.from(selectedIds), status);
    if (res.success) { toast.success(`${res.data?.processed} জন আপডেট হয়েছে`); setSelectedIds(new Set()); load(); }
    else toast.error(res.error ?? "ব্যর্থ");
  };

  const handleExport = async () => {
    const { exportUsersCsvAction } = await import("@/features/identity/actions/identity-center-actions");
    const res = await exportUsersCsvAction(roleFilter || undefined);
    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "users-export.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success("এক্সপোর্ট সম্পন্ন");
    } else toast.error(res.error ?? "এক্সপোর্ট ব্যর্থ");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u.id)));
  };

  const statusVariant = (s: string) => {
    if (s === "active") return "success" as const;
    if (s === "suspended") return "destructive" as const;
    return "warning" as const;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/identity" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ব্যবহারকারী ডিরেক্টরি</h1>
            <p className="text-sm text-muted-foreground">{total} জন ব্যবহারকারী</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>
          <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="নাম, ইমেইল, ফোন খুঁজুন..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm">
            <option value="">সব রোল</option>
            <option value="customer">Customer</option>
            <option value="reseller">Reseller</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="support">Support</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm">
            <option value="">সব স্ট্যাটাস</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="border-primary/30 bg-accent/50">
          <CardContent className="p-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{selectedIds.size} জন নির্বাচিত</span>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("active")}><CheckCircle className="h-3.5 w-3.5 mr-1" /> Activate</Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("suspended")}><Ban className="h-3.5 w-3.5 mr-1" /> Suspend</Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 w-8">
                  <input type="checkbox" checked={selectedIds.size === users.length && users.length > 0}
                    onChange={toggleSelectAll} className="rounded border-border" />
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">নাম</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">রোল</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্ট্যাটাস</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">শেষ লগইন</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">কোনো ব্যবহারকারী নেই</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.has(u.id)}
                      onChange={() => toggleSelect(u.id)} className="rounded border-border" />
                  </td>
                  <td className="p-3">
                    <Link href={`/dashboard/identity/users/${u.id}`} className="text-sm font-medium hover:text-primary">
                      {u.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.phone}</p>
                  </td>
                  <td className="p-3"><Badge variant="outline" className="text-[10px] capitalize">{u.role}</Badge></td>
                  <td className="p-3"><Badge variant={statusVariant(u.status)} className="text-[10px]">{u.status}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/identity/users/${u.id}`}>
                        <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"><Eye className="h-4 w-4" /></button>
                      </Link>
                      {u.status !== "active" && (
                        <button onClick={() => handleStatus(u.id, "active")} className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10"><CheckCircle className="h-4 w-4" /></button>
                      )}
                      {u.status !== "suspended" && (
                        <button onClick={() => handleStatus(u.id, "suspended")} className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10"><Ban className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => handleForceLogout(u.id)} className="p-1.5 rounded-md text-muted-foreground hover:bg-accent"><Monitor className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">পৃষ্ঠা {page} / {totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>পূর্ববর্তী</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>পরবর্তী</Button>
          </div>
        </div>
      )}
    </div>
  );
}
