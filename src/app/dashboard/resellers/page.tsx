"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Store, Eye, Ban, CheckCircle, Building2, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  listResellersAction,
  updateResellerStatusAction,
} from "@/features/reseller/actions/reseller-actions";
import { ListLayout } from "@/components/workspace/list-layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { SearchBox } from "@/components/workspace/search-box";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Row = {
  id: string;
  code: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  district: string;
  status: string;
  productCount: number;
};

export default function ResellersListPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);
  const pageSize = 10;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listResellersAction({
        page,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });
      if (res.success && res.data) {
        const d = res.data as any;
        const items: Row[] = (d.items ?? []).map((r: any) => ({
          id: r.id,
          code: r.code ?? "",
          businessName: r.businessName ?? "",
          ownerName: r.ownerName ?? "",
          email: r.email ?? "",
          phone: r.phone ?? "",
          district: r.address?.district ?? r.district ?? "",
          status: r.status ?? "pending",
          productCount: r.productCount ?? r.productsCount ?? 0,
        }));
        setRows(items);
        setTotalCount(d.totalCount ?? items.length);
      }
    } catch {
      toast.error("Failed to load resellers");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id: string, status: "active" | "suspended" | "archived") => {
    setMutatingId(id);
    try {
      const res = await updateResellerStatusAction(id, status);
      if (res.success) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        toast.success(`Reseller ${status}`);
      } else {
        toast.error(res.error || "Status update failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setMutatingId(null);
    }
  };

  const columns: DataTableColumn<Row>[] = [
    {
      id: "name",
      header: "Reseller",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.businessName}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.code}</div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      hideOnMobile: true,
      cell: (r) => (
        <div>
          <div className="text-sm">{r.ownerName}</div>
          <div className="text-[11px] text-muted-foreground">{r.email}</div>
        </div>
      ),
    },
    {
      id: "district",
      header: "District",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.district || "—"}</span>,
    },
    {
      id: "products",
      header: "Products",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.productCount}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/dashboard/resellers/${r.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {r.status !== "active" ? (
            <button
              type="button"
              disabled={mutatingId === r.id}
              onClick={() => handleStatus(r.id, "active")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-success hover:bg-success/10"
              title="Activate"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={mutatingId === r.id}
              onClick={() => handleStatus(r.id, "suspended")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive/80 hover:bg-destructive/10"
              title="Suspend"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = React.useMemo(() => {
    return {
      total: totalCount,
      active: rows.filter((r) => r.status === "active").length,
      pending: rows.filter((r) => r.status === "pending").length,
      suspended: rows.filter((r) => r.status === "suspended" || r.status === "blocked").length,
    };
  }, [rows, totalCount]);

  return (
    <ListLayout
      header={{
        title: "Resellers",
        description: "Onboard resellers and manage their private product catalogs",
        actions: (
          <Link href="/dashboard/resellers/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Onboard reseller
            </Button>
          </Link>
        ),
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Partners" value={stats.total} icon={Store} />
            <StatCard label="Active" value={stats.active} icon={Users} accent="success" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} accent="warning" />
            <StatCard label="Suspended" value={stats.suspended} icon={Ban} accent="danger" />
          </>
        )
      }
      toolbar={
        <Toolbar
          left={
            <>
              <SearchBox
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search name, code, email…"
                className="w-full sm:w-72"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
                <option value="archived">Archived</option>
              </select>
            </>
          }
        />
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        selectable
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowClick={(r) => router.push(`/dashboard/resellers/${r.id}`)}
        emptyTitle="No resellers"
        emptyDescription="Onboard your first reseller to start building private catalogs."
      />
    </ListLayout>
  );
}
