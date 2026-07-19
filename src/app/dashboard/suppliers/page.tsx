"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Building2, Eye } from "lucide-react";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { Toolbar } from "@/shared/components/workspace/toolbar";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";

type Row = {
  id: string;
  code: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  district: string;
  status: string;
  performance: number;
};

const MOCK: Row[] = [
  {
    id: "1",
    code: "SPL-0001",
    businessName: "Vertex Logistics",
    contactPerson: "Akram Khan",
    email: "akram@vertex.com",
    phone: "+8801711223344",
    district: "Dhaka",
    status: "active",
    performance: 96,
  },
  {
    id: "2",
    code: "SPL-0002",
    businessName: "Amana Distributors",
    contactPerson: "Mominul Haque",
    email: "mominul@amana.com",
    phone: "+8801811556677",
    district: "Chittagong",
    status: "pending",
    performance: 88,
  },
  {
    id: "3",
    code: "SPL-0003",
    businessName: "Standard Trading",
    contactPerson: "Zahid Hasan",
    email: "zahid@standard.com",
    phone: "+8801911889900",
    district: "Sylhet",
    status: "suspended",
    performance: 75,
  },
];

export default function SuppliersPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const filtered = MOCK.filter((item) => {
    const q = search.toLowerCase();
    const match =
      item.businessName.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q);
    return match && (statusFilter === "all" || item.status === statusFilter);
  });

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
          <div className="text-sm">{r.contactPerson}</div>
          <div className="text-[11px] text-muted-foreground">{r.email}</div>
        </div>
      ),
    },
    {
      id: "district",
      header: "District",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.district}</span>,
    },
    {
      id: "perf",
      header: "Score",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums font-medium text-emerald-500">{r.performance}</span>
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
        <>
          <StatCard label="Partners" value={MOCK.length} icon={Building2} />
          <StatCard
            label="Active"
            value={MOCK.filter((s) => s.status === "active").length}
            accent="success"
          />
          <StatCard
            label="Pending"
            value={MOCK.filter((s) => s.status === "pending").length}
            accent="warning"
          />
          <StatCard
            label="Suspended"
            value={MOCK.filter((s) => s.status === "suspended").length}
            accent="danger"
          />
        </>
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </>
          }
        />
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        pageSize={10}
        totalCount={filtered.length}
        onPageChange={setPage}
        onRowClick={(r) => router.push(`/dashboard/suppliers/${r.id}`)}
      />
    </ListLayout>
  );
}
