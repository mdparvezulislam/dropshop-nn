"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Building2, Eye, Store, Users, Clock, Ban } from "lucide-react";
import { ListLayout } from "@/components/workspace/list-layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { SearchBox } from "@/components/workspace/search-box";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { listSuppliersAction } from "@/features/supplier/actions/supplier-actions";

type Row = {
  id: string;
  code: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  district: string;
  category: string;
  status: string;
  performance: number;
};

export default function SuppliersPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    listSuppliersAction({ search, status: statusFilter, page, limit: 10 }).then((res) => {
      if (res.success && res.data) {
        const mapped: Row[] = res.data.items.map((s: any) => ({
          id: s.id || s._id,
          code: s.code,
          businessName: s.businessName,
          ownerName: s.ownerName,
          email: s.email,
          phone: s.phone,
          district: s.address?.district ?? "",
          category: s.supplierCategory ?? "",
          status: s.status ?? "pending",
          performance: s.performance?.performanceScore ?? 0,
        }));
        setRows(mapped);
        setTotalCount(res.data.totalCount);
      } else {
        setRows([]);
        setTotalCount(0);
      }
      setLoading(false);
    });
  }, [search, statusFilter, page]);

  const stats = React.useMemo(() => {
    const all = rows;
    return {
      total: totalCount,
      active: all.filter((r) => r.status === "active").length,
      pending: all.filter((r) => r.status === "pending").length,
      suspended: all.filter((r) => r.status === "suspended").length,
    };
  }, [rows, totalCount]);

  const columns: DataTableColumn<Row>[] = [
    {
      id: "name",
      header: "Supplier",
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
      id: "perf",
      header: "Score",
      hideOnMobile: true,
      cell: (r) => (
        <span
          className={`tabular-nums font-medium ${
            r.performance >= 80
              ? "text-emerald-500"
              : r.performance >= 40
                ? "text-amber-500"
                : "text-red-500"
          }`}
        >
          {r.performance}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/dashboard/suppliers/${r.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  const pageSize = 10;

  return (
    <ListLayout
      header={{
        title: "Suppliers",
        description: "Onboard, monitor, and govern supplier partners",
        actions: (
          <Link href="/dashboard/suppliers/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Onboard supplier
            </Button>
          </Link>
        ),
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading stats…
          </div>
        ) : (
          <>
            <StatCard label="Partners" value={stats.total} icon={Building2} />
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
                onChange={setSearch}
                placeholder="Search suppliers…"
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
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
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowClick={(r) => router.push(`/dashboard/suppliers/${r.id}`)}
      />
    </ListLayout>
  );
}
