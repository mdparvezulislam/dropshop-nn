"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building,
  CheckCircle2,
  Ban,
  Eye,
  RefreshCw,
  Search,
  Users,
  Clock,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type WholesaleRow = {
  id: string;
  code: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  district: string;
  status: string;
};

type TabKey = "all" | "pending" | "active";

export default function WholesalePartnersPage(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<TabKey>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<WholesaleRow[]>([]);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);
  const pageSize = 12;

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch wholesale partners or reseller partners with role = wholesaler
      const { listResellersAction } = await import("@/features/reseller/actions/reseller-actions");
      const res = await listResellersAction({
        page,
        limit: pageSize,
        search: search || undefined,
      });
      if (res.success && res.data) {
        const d = res.data as any;
        const items: WholesaleRow[] = (d.items ?? []).map((r: any) => ({
          id: r.id || r._id,
          code: r.code ?? `WS-${(r.id || r._id || "").slice(-6).toUpperCase()}`,
          businessName: r.businessName || r.name || "Wholesale Mart",
          ownerName: r.ownerName || r.contactPerson || "Owner Name",
          email: r.email ?? "",
          phone: r.phone ?? "",
          district: r.address?.district ?? r.district ?? "Dhaka",
          status: r.status ?? "pending",
        }));
        setRows(items);
      }
    } catch {
      toast.error("Failed to load wholesale applications");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, newStatus: "active" | "suspended") => {
    setMutatingId(id);
    try {
      const { updateResellerStatusAction } = await import("@/features/reseller/actions/reseller-actions");
      const res = await updateResellerStatusAction(id, newStatus);
      if (res.success) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
        toast.success(`Wholesale partner ${newStatus === "active" ? "approved" : "cancelled"}!`);
      } else {
        toast.error(res.error || "Status update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    } finally {
      setMutatingId(null);
    }
  };

  const filteredRows = React.useMemo(() => {
    if (activeTab === "all") return rows;
    return rows.filter((r) => r.status === activeTab);
  }, [rows, activeTab]);

  const columns: DataTableColumn<WholesaleRow>[] = [
    {
      id: "name",
      header: "Wholesale Business",
      cell: (r) => (
        <div>
          <div className="font-extrabold text-foreground">{r.businessName}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.code}</div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact Person",
      hideOnMobile: true,
      cell: (r) => (
        <div>
          <div className="text-xs font-bold text-foreground">{r.ownerName}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.phone || r.email}</div>
        </div>
      ),
    },
    {
      id: "district",
      header: "District",
      hideOnMobile: true,
      cell: (r) => <span className="text-xs font-medium text-muted-foreground">{r.district}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {r.status !== "active" ? (
            <Button
              size="sm"
              disabled={mutatingId === r.id}
              onClick={() => handleStatusChange(r.id, "active")}
              className="h-8 px-3 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={mutatingId === r.id}
              onClick={() => handleStatusChange(r.id, "suspended")}
              className="h-8 px-2 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              Wholesale Partner Approvals
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              B2B WHOLESALE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review wholesale business registration applications, check credentials, and approve or cancel wholesale accounts.
          </p>
        </div>

        <Button
          onClick={loadData}
          size="sm"
          variant="outline"
          disabled={loading}
          className="h-9 text-xs font-bold gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "all"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Building className="h-4 w-4" /> All Applications
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "pending"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" /> Pending Review
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "active"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> Approved
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search wholesale business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-border bg-card"
          />
        </div>
      </div>

      {/* Body List */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground gap-2">
          <Spinner size="sm" /> Loading wholesale applications...
        </div>
      ) : filteredRows.length === 0 ? (
        <Card className="rounded-3xl border-border p-8 text-center space-y-3">
          <Building className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-extrabold text-foreground">No Wholesale Partners Found</h3>
          <p className="text-xs text-muted-foreground">No records match the selected view.</p>
        </Card>
      ) : (
        <>
          {/* Mobile Item Cards (< md) */}
          <div className="block md:hidden space-y-3">
            {filteredRows.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div>
                    <h3 className="font-extrabold text-foreground text-sm">{r.businessName}</h3>
                    <p className="text-[11px] font-mono text-muted-foreground">{r.code}</p>
                  </div>
                  <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase">Contact Person</span>
                    <strong className="text-foreground font-bold">{r.ownerName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase">Phone / Email</span>
                    <span className="text-foreground font-mono text-[11px]">{r.phone || r.email || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-border/40 gap-2">
                  {r.status !== "active" ? (
                    <Button
                      size="sm"
                      disabled={mutatingId === r.id}
                      onClick={() => handleStatusChange(r.id, "active")}
                      className="h-8 px-4 text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve Wholesale
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mutatingId === r.id}
                      onClick={() => handleStatusChange(r.id, "suspended")}
                      className="h-8 px-3 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Ban className="h-3.5 w-3.5 mr-1" /> Cancel Partner
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden bg-card">
            <DataTable
              columns={columns}
              data={filteredRows}
              loading={loading}
              selectable={false}
              page={page}
              pageSize={pageSize}
              totalCount={filteredRows.length}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
