"use client";

import * as React from "react";
import { toast } from "sonner";
import { Users, Phone, Mail, MapPin } from "lucide-react";
import { listCustomersAction } from "@/features/customer/actions/customer-actions";
import { ListLayout } from "@/components/workspace/list-layout";
import { SearchBox } from "@/components/workspace/search-box";
import { Toolbar } from "@/components/workspace/toolbar";
import { StatCard } from "@/components/workspace/stat-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Spinner } from "@/components/ui/spinner";

type Row = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notesCount: number;
  createdAt: string;
};

export default function WholesaleCustomersPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCustomersAction(search || undefined);
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : [];
        setRows(items.map((c: any) => ({
          id: c.id ?? c._id,
          name: c.name ?? "—",
          phone: c.phone ?? "—",
          email: c.email ?? "—",
          address: c.addresses?.[0]?.fullAddress ?? c.addresses?.[0]?.address ?? "—",
          notesCount: c.notes?.length ?? 0,
          createdAt: c.createdAt,
        })));
      }
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => { load(); }, [load]);

  const columns: DataTableColumn<Row>[] = [
    {
      id: "name",
      header: "Contact",
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
      id: "address",
      header: "Address",
      hideOnMobile: true,
      cell: (r) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[200px]">{r.address}</span>
        </div>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.notesCount}</span>,
    },
    {
      id: "since",
      header: "Since",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span>
      ),
    },
  ];

  return (
    <ListLayout
      header={{
        title: "Customers",
        description: "Your business contacts and saved addresses",
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Total Contacts" value={rows.length} icon={Users} />
            <StatCard label="With Addresses" value={rows.filter((r) => r.address !== "—").length} icon={MapPin} accent="info" />
            <StatCard label="With Notes" value={rows.filter((r) => r.notesCount > 0).length} accent="default" />
          </>
        )
      }
      toolbar={
        <Toolbar
          left={
            <SearchBox
              value={search}
              onChange={(v) => { setSearch(v); }}
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
        emptyTitle="No customers yet"
        emptyDescription="Customers will appear here when you save business contacts."
      />
    </ListLayout>
  );
}
