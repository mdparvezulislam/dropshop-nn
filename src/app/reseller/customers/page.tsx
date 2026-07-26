"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Phone, Eye, Mail } from "lucide-react";
import { toast } from "sonner";
import { listCustomersAction } from "@/features/customer/actions/customer-actions";
import { ListLayout } from "@/components/workspace/list-layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { SearchBox } from "@/components/workspace/search-box";
import { StatCard } from "@/components/workspace/stat-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Row = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notesCount: number;
  addressesCount: number;
  createdAt: string;
};

export default function ResellerCustomersPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCustomersAction(search || undefined);
      if (res.success && res.data) {
        const items: Row[] = (Array.isArray(res.data) ? res.data : []).map((c: any) => ({
          id: c.id ?? c._id,
          name: c.name ?? "—",
          phone: c.phone ?? "—",
          email: c.email ?? "—",
          notesCount: c.notes?.length ?? 0,
          addressesCount: c.addresses?.length ?? 0,
          createdAt: c.createdAt,
        }));
        setRows(items);
      }
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<Row>[] = [
    {
      id: "name",
      header: "Customer",
      cell: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.name}</div>
          <div className="text-[11px] text-muted-foreground">{r.email}</div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (r) => <span className="font-mono text-sm text-muted-foreground">{r.phone}</span>,
    },
    {
      id: "notes",
      header: "Notes",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.notesCount}</span>,
    },
    {
      id: "created",
      header: "Since",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => router.push(`/reseller/customers/${r.id}`)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      header={{
        title: "My Customers",
        description: "Manage your customer relationships",
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Total Customers" value={rows.length} icon={Users} />
            <StatCard
              label="With Notes"
              value={rows.filter((r) => r.notesCount > 0).length}
              accent="info"
            />
          </>
        )
      }
      toolbar={
        <Toolbar
          left={
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
              }}
              placeholder="Search customers…"
              className="w-full sm:w-72"
            />
          }
        />
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        onRowClick={(r) => router.push(`/reseller/customers/${r.id}`)}
        emptyTitle="No customers yet"
        emptyDescription="Customers will appear here when you create orders."
      />
    </ListLayout>
  );
}
