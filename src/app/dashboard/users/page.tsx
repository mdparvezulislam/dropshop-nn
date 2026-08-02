"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  listUsersAdminAction,
  updateUserStatusAdminAction,
  updateUserRolesAdminAction,
} from "@/features/identity/actions/admin-identity-actions";
import { forceLogoutUserAction } from "@/features/identity/actions/session-actions";
import { toast } from "sonner";
import {
  Users,
  Search,
  RefreshCw,
  Ban,
  CheckCircle2,
  Shield,
  UserCog,
  X,
  Check,
  UserCheck,
  LogOut,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";

const AVAILABLE_ROLES = [
  { id: "customer", label: "Customer", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  { id: "reseller", label: "Reseller", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { id: "wholesaler", label: "Wholesaler", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  { id: "staff", label: "Staff", color: "bg-slate-500/10 text-slate-600 border-slate-500/30" },
  { id: "manager", label: "Manager", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" },
  { id: "admin", label: "Admin", color: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
  { id: "super_admin", label: "Super Admin", color: "bg-rose-500/20 text-rose-700 border-rose-500/40" },
];

type TabKey = "all" | "staff" | "partners" | "customers";

export default function UsersDirectoryPage(): React.ReactElement {
  const [users, setUsers] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<TabKey>("all");
  const [page, setPage] = React.useState(1);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);

  // Role Editor Modal
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [isSavingRoles, setIsSavingRoles] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    let roleQuery: string | undefined = undefined;
    if (activeTab === "staff") roleQuery = "staff";
    if (activeTab === "partners") roleQuery = "reseller";
    if (activeTab === "customers") roleQuery = "customer";

    const res = await listUsersAdminAction({
      page,
      limit: 20,
      search: search || undefined,
      role: roleQuery,
    });
    if (res.success && res.data) {
      setUsers(res.data.items as any[]);
      setTotal(res.data.totalCount);
    } else {
      toast.error(res.error ?? "Failed to load users");
    }
    setLoading(false);
  }, [search, activeTab, page]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (userId: string, newStatus: "active" | "suspended") => {
    setMutatingId(userId);
    try {
      const res = await updateUserStatusAdminAction({ userId, status: newStatus });
      if (res.success) {
        toast.success(`User status updated to ${newStatus}`);
        loadData();
      } else {
        toast.error(res.error || "Status update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setMutatingId(null);
    }
  };

  const handleForceLogout = async (userId: string) => {
    setMutatingId(userId);
    try {
      const res = await forceLogoutUserAction(userId);
      if (res.success) {
        toast.success("User forced logged out!");
      } else {
        toast.error((res as any).error || "Logout failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setMutatingId(null);
    }
  };

  const handleOpenRoleEditor = (user: any) => {
    setEditingUser(user);
    setSelectedRoles(Array.isArray(user.roles) ? user.roles : [user.role || "customer"]);
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    setIsSavingRoles(true);
    try {
      const res = await updateUserRolesAdminAction({
        userId: editingUser.id || editingUser._id,
        roles: selectedRoles,
      });
      if (res.success) {
        toast.success("User roles updated successfully!");
        setEditingUser(null);
        loadData();
      } else {
        toast.error(res.error || "Role update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Save roles error");
    } finally {
      setIsSavingRoles(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              User & Staff Directory
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              IDENTITY & ROLES
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage user accounts, view names & contact details, assign roles, and control access.
          </p>
        </div>

        <Button
          onClick={loadData}
          size="sm"
          variant="outline"
          disabled={loading}
          className="h-9 text-xs font-bold gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Users
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "all"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" /> All Accounts ({total})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("staff");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "staff"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Shield className="h-4 w-4" /> Staff & Admins
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("partners");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "partners"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4" /> Resellers & Partners
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs rounded-xl border-border bg-card"
          />
        </div>
      </div>

      {/* Main Users List */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground gap-2">
          <Spinner size="sm" /> Loading users...
        </div>
      ) : users.length === 0 ? (
        <Card className="rounded-3xl border-border p-8 text-center space-y-3">
          <Users className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-extrabold text-foreground">No Users Found</h3>
          <p className="text-xs text-muted-foreground">No accounts match the current filter query.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u: any) => {
              const uId = u.id || u._id;
              const name = u.name || u.displayName || u.fullName || u.username || "User Account";
              const email = u.email || "No Email Recorded";
              const phone = u.phone || u.phoneNumber || "";
              const formattedPhoneForWhatsapp = phone ? phone.replace(/[^0-9]/g, "").replace(/^0/, "880") : "";
              const uRoles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || "customer"];
              const isSuspended = u.status === "suspended" || u.status === "blocked";
              const initials = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div key={uId} className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-2xs">
                  {/* Top Name & Status Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-extrabold text-sm flex items-center justify-center shrink-0">
                        {initials || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-foreground text-sm truncate">{name}</h3>
                        <span className="text-[10px] font-mono text-muted-foreground block truncate">ID: {uId.slice(-8)}</span>
                      </div>
                    </div>
                    <StatusChip label={u.status || "active"} tone={statusToneFromValue(u.status || "active")} />
                  </div>

                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block font-medium uppercase">Email Address</span>
                      <p className="font-mono text-[11px] text-foreground truncate">{email}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block font-medium uppercase">Phone Contact</span>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[11px] text-foreground font-bold">{phone || "N/A"}</p>
                        {phone && (
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${phone}`}
                              className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                              title="Call User"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                            <a
                              href={`https://wa.me/${formattedPhoneForWhatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                              title="WhatsApp User"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roles & Permissions Badges */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground block font-medium uppercase mr-1">Roles:</span>
                      {uRoles.map((r: string) => {
                        const rMeta = AVAILABLE_ROLES.find((item) => item.id === r);
                        return (
                          <Badge
                            key={r}
                            variant="outline"
                            className={`text-[10px] font-bold ${rMeta?.color || "bg-slate-100 text-slate-800"}`}
                          >
                            {rMeta?.label || r}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Action Strip */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-1.5 flex-wrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenRoleEditor(u)}
                      className="h-8 text-xs font-bold gap-1 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      <UserCog className="h-3.5 w-3.5" /> Edit Roles
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Force Logout Session"
                        disabled={mutatingId === uId}
                        onClick={() => handleForceLogout(uId)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                      </Button>

                      {isSuspended ? (
                        <Button
                          size="sm"
                          disabled={mutatingId === uId}
                          onClick={() => handleStatusChange(uId, "active")}
                          className="h-8 px-3 text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mutatingId === uId}
                          onClick={() => handleStatusChange(uId, "suspended")}
                          className="h-8 px-2.5 text-xs font-bold border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50"
                        >
                          <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Editor Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Edit User Roles</h3>
                <p className="text-xs text-muted-foreground">{editingUser.name || editingUser.displayName} ({editingUser.email || editingUser.phone})</p>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Select System Roles</p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_ROLES.map((r) => {
                  const isChecked = selectedRoles.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        isChecked
                          ? "bg-amber-500/10 border-amber-500/50 text-foreground"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, r.id]);
                          } else {
                            setSelectedRoles(selectedRoles.filter((item) => item !== r.id));
                          }
                        }}
                        className="rounded border-input text-amber-500"
                      />
                      {r.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRoles}
                disabled={isSavingRoles}
                className="h-9 px-4 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-1"
              >
                <Check className="h-4 w-4" /> Save Roles
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
