"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { listUsersAdminAction, updateUserStatusAdminAction } from "@/features/identity/actions/admin-identity-actions";
import { forceLogoutUserAction } from "@/features/identity/actions/session-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Search, Ban, CheckCircle, Monitor, UserCheck } from "lucide-react";

const STAFF_ROLES = ["admin", "super_admin", "manager", "support"];

export default function StaffPage(): React.ReactElement {
  const [items, setItems] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        (roleFilter ? [roleFilter] : STAFF_ROLES).map((r) =>
          listUsersAdminAction({ page: 1, limit: 50, role: r, search: search || undefined }),
        ),
      );
      const all = results.flatMap((res) => res.success ? res.data?.items ?? [] : []);
      setItems(all);
      setTotal(all.length);
    } catch { toast.error("লোড ব্যর্থ"); }
    setLoading(false);
  }, [search, roleFilter]);

  React.useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  const handleStatus = async (userId: string, status: "active" | "suspended") => {
    const res = await updateUserStatusAdminAction({ userId, status });
    if (res.success) { toast.success(`আপডেট হয়েছে`); load(); }
    else toast.error(res.error ?? "ব্যর্থ");
  };

  const handleLogout = async (userId: string) => {
    const res = await forceLogoutUserAction(userId);
    if (res.success) toast.success("সেশন বাতিল হয়েছে");
    else toast.error("ব্যর্থ");
  };

  const active = items.filter((u) => u.status === "active").length;
  const suspended = items.filter((u) => u.status === "suspended").length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/identity" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">স্টাফ ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground">Staff Management · {total} জন</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <Card className="border-border/50 bg-card/50"><CardContent className="p-3"><UserCheck className="h-4 w-4 text-blue-400 mb-1" /><p className="text-xs text-muted-foreground">Total Staff</p><p className="text-lg font-bold">{total}</p></CardContent></Card>
        <Card className="border-border/50 bg-card/50"><CardContent className="p-3"><CheckCircle className="h-4 w-4 text-emerald-400 mb-1" /><p className="text-xs text-muted-foreground">Active</p><p className="text-lg font-bold text-emerald-400">{active}</p></CardContent></Card>
        <Card className="border-border/50 bg-card/50"><CardContent className="p-3"><Ban className="h-4 w-4 text-rose-400 mb-1" /><p className="text-xs text-muted-foreground">Suspended</p><p className="text-lg font-bold text-rose-400">{suspended}</p></CardContent></Card>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-3 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="নাম, ইমেইল খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
            <option value="">All Staff</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="support">Support</option>
          </select>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">নাম</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">রোল</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্ট্যাটাস</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">শেষ লগইন</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr> :
               items.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">কোনো স্টাফ নেই</td></tr> :
               items.map((u) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3">
                    <Link href={`/dashboard/identity/users/${u.id}`} className="text-sm font-medium hover:text-primary">{u.fullName}</Link>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="p-3"><Badge variant="outline" className="text-[10px] capitalize">{u.role}</Badge></td>
                  <td className="p-3"><Badge variant={u.status === "active" ? "success" : "destructive"} className="text-[10px]">{u.status}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      {u.status !== "active" && <button onClick={() => handleStatus(u.id, "active")} className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10"><CheckCircle className="h-4 w-4" /></button>}
                      {u.status !== "suspended" && <button onClick={() => handleStatus(u.id, "suspended")} className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10"><Ban className="h-4 w-4" /></button>}
                      <button onClick={() => handleLogout(u.id)} className="p-1.5 rounded-md text-muted-foreground hover:bg-accent"><Monitor className="h-4 w-4" /></button>
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
