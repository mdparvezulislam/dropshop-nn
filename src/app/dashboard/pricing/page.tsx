"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Layers, DollarSign, Pencil, TrendingUp } from "lucide-react";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { Toolbar } from "@/shared/components/workspace/toolbar";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";

type Row = {
  id: string;
  productName: string;
  variantSku: string;
  baseCostPrice: number;
  sellingPrice: number;
  promotionalPrice?: number;
  wholesalePrice: number;
  profitMargin: number;
  currency: string;
  pricingRule: string;
  status: string;
};

const MOCK: Row[] = [
  {
    id: "1",
    productName: "iPhone 16 Pro Max",
    variantSku: "APL-IPH16PM-256-BLK",
    baseCostPrice: 89000,
    sellingPrice: 119900,
    promotionalPrice: 114900,
    wholesalePrice: 109900,
    profitMargin: 25.8,
    currency: "USD",
    pricingRule: "fixed",
    status: "active",
  },
  {
    id: "2",
    productName: "Galaxy S24 Ultra",
    variantSku: "SAM-S24U-512-TIT",
    baseCostPrice: 78000,
    sellingPrice: 109900,
    wholesalePrice: 99900,
    profitMargin: 29.0,
    currency: "USD",
    pricingRule: "supplier_based",
    status: "active",
  },
  {
    id: "3",
    productName: "MacBook Pro 14 M3",
    variantSku: "APL-MBP14M3-16-SLV",
    baseCostPrice: 145000,
    sellingPrice: 199900,
    promotionalPrice: 189900,
    wholesalePrice: 184900,
    profitMargin: 27.5,
    currency: "USD",
    pricingRule: "percentage",
    status: "inactive",
  },
];

export default function PricingPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const filtered = MOCK.filter((item) => {
    const q = search.toLowerCase();
    const match =
      item.productName.toLowerCase().includes(q) || item.variantSku.toLowerCase().includes(q);
    return match && (statusFilter === "all" || item.status === statusFilter);
  });

  const avgMargin =
    MOCK.length > 0 ? (MOCK.reduce((s, p) => s + p.profitMargin, 0) / MOCK.length).toFixed(1) : "0";

  const columns: DataTableColumn<Row>[] = [
    {
      id: "product",
      header: "Product / SKU",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.productName}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.variantSku}</div>
        </div>
      ),
    },
    {
      id: "cost",
      header: "Cost",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {formatCentsToCurrency(r.baseCostPrice, r.currency)}
        </span>
      ),
    },
    {
      id: "selling",
      header: "Selling",
      cell: (r) => (
        <div>
          <div className="font-semibold tabular-nums">
            {formatCentsToCurrency(r.promotionalPrice ?? r.sellingPrice, r.currency)}
          </div>
          {r.promotionalPrice ? (
            <div className="text-[11px] text-muted-foreground line-through tabular-nums">
              {formatCentsToCurrency(r.sellingPrice, r.currency)}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "margin",
      header: "Margin",
      hideOnMobile: true,
      cell: (r) => <span className="font-medium tabular-nums text-success">{r.profitMargin}%</span>,
    },
    {
      id: "rule",
      header: "Rule",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-xs capitalize text-muted-foreground">
          {r.pricingRule.replace(/_/g, " ")}
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
            href={`/dashboard/pricing/${r.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      header={{
        title: "Pricing",
        description: "Independent price book — costs, tiers, rules, and margins",
        actions: (
          <div className="flex gap-2">
            <Link href="/dashboard/pricing/bulk">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Bulk update
              </Button>
            </Link>
            <Link href="/dashboard/pricing/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add pricing
              </Button>
            </Link>
          </div>
        ),
      }}
      stats={
        <>
          <StatCard label="Priced SKUs" value={MOCK.length} icon={DollarSign} />
          <StatCard label="Avg margin" value={`${avgMargin}%`} accent="success" icon={TrendingUp} />
          <StatCard
            label="Active promos"
            value={MOCK.filter((p) => p.promotionalPrice).length}
            accent="warning"
          />
          <StatCard
            label="Active"
            value={MOCK.filter((p) => p.status === "active").length}
            accent="info"
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
                placeholder="Search product or SKU…"
                className="w-full sm:w-72"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
        onRowClick={(r) => router.push(`/dashboard/pricing/${r.id}`)}
      />
    </ListLayout>
  );
}
