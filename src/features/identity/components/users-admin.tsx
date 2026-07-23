"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Search, Shield, Store, Building2, User as UserIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listUsersAdminAction,
  updateUserStatusAdminAction,
} from "../actions/admin-identity-actions";
import { adminManageUserMembershipsAction } from "../actions/admin-membership-actions";
import { forceLogoutUserAction as forceLogout } from "../actions/session-actions";

interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  memberships?: string[];
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

  // Edit Membership Modal State
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [selectedMemberships, setSelectedMemberships] = useState<("customer" | "reseller" | "wholesaler")[]>(["customer"]);
  const [savingMemberships, setSavingMemberships] = useState(false);

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

  const openMembershipModal = (user: SafeUser) => {
    setEditingUser(user);
    const m = (user.memberships || ["customer"]) as ("customer" | "reseller" | "wholesaler")[];
    setSelectedMemberships(m.length > 0 ? m : ["customer"]);
  };

  const toggleMembership = (type: "customer" | "reseller" | "wholesaler") => {
    setSelectedMemberships((prev) => {
      if (prev.includes(type)) {
        // Must keep at least customer
        const filtered = prev.filter((t) => t !== type);
        return filtered.length > 0 ? filtered : ["customer"];
      }
      return [...prev, type];
    });
  };

  const handleSaveMemberships = async () => {
    if (!editingUser) return;
    setSavingMemberships(true);

    const res = await adminManageUserMembershipsAction({
      targetUserId: editingUser.id,
      memberships: selectedMemberships,
    });

    if (res.success) {
      toast.success(`User memberships updated for ${editingUser.fullName}`);
      setEditingUser(null);
      load();
    } else {
      toast.error(res.error || "Failed to update memberships");
    }
    setSavingMemberships(false);
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
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">User & Membership Management</h1>
          <p className="text-sm text-muted-foreground">
            System Roles vs Business Memberships · {total} total accounts
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
          placeholder="Search name, email, phone…"
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
            items.map((u) => {
              const memberships = u.memberships && u.memberships.length > 0 ? u.memberships : ["customer"];
              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{u.fullName}</p>
                      <Badge variant="outline" className="capitalize bg-slate-100 text-slate-800">
                        Role: {u.role}
                      </Badge>
                      <Badge variant="outline" className={`capitalize ${statusColor(u.status)}`}>
                        {u.status}
                      </Badge>
                    </div>

                    {/* Business Membership Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] font-bold text-muted-foreground">Memberships:</span>
                      {memberships.map((m) => (
                        <span
                          key={m}
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                            m === "reseller"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : m === "wholesaler"
                              ? "bg-purple-100 text-purple-900 border-purple-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {u.email} · @{u.username} · {u.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-50"
                      onClick={() => openMembershipModal(u)}
                    >
                      <Shield className="h-3.5 w-3.5 mr-1 text-amber-600" /> Edit Memberships
                    </Button>

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
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* MULTI-SELECT MEMBERSHIP MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-6 text-foreground shadow-2xl">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Business Membership Controller
              </span>
              <h2 className="text-xl font-extrabold mt-1">
                {editingUser.fullName} এর মেম্বারশিপ সম্পাদনা
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                ব্যবহারকারীকে এক বা একাধিক মেম্বারশিপ সিলেক্ট করে প্রদান বা বাতিল করুন।
              </p>
            </div>

            {/* Checkbox Selector */}
            <div className="space-y-3">
              {[
                { type: "customer" as const, label: "Customer (খুচরা ক্রেতা)", desc: "সাধারণ ক্রেতা মেম্বারশিপ" },
                { type: "reseller" as const, label: "Reseller Partner (ড্রপশিপার)", desc: "রিসেলিং প্রাইসিং ও হাবে প্রবেশাধিকার" },
                { type: "wholesaler" as const, label: "Wholesaler (পাইকারি বিক্রেতা)", desc: "বি২বি বাল্ক ও টিয়ার প্রাইসিং" },
              ].map((item) => {
                const checked = selectedMemberships.includes(item.type);
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => toggleMembership(item.type)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      checked
                        ? "bg-amber-50/80 border-amber-400 text-amber-950 font-bold"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        checked ? "bg-amber-500 border-amber-600 text-white" : "border-muted-foreground"
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-black">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                বাতিল
              </Button>
              <Button
                size="sm"
                onClick={handleSaveMemberships}
                disabled={savingMemberships}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {savingMemberships ? "সংরক্ষণ হচ্ছে..." : "মেম্বারশিপ পরিবর্তন করুন"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
