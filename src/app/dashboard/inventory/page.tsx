"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Warehouse, AlertTriangle, History, SlidersHorizontal, Package } from "lucide-react";
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
  availableStock: number;
  reservedStock: number;
  incomingStock: number;
  reorderLevel: number;
  availability: string;
};

const MOCK: Row[] = [
  {
    id: "1",
    productName: "iPhone 16 Pro Max",
    variantSku: "APL-IPH16PM-256-BLK",
    availableStock: 42,
    reservedStock: 8,
    incomingStock: 20,
    reorderLevel: 15,
    availability: "in_stock",
  },
  {
    id: "2",
    productName: "Galaxy S24 Ultra",
    variantSku: "SAM-S24U-512-TIT",
    availableStock: 7,
    reservedStock: 2,
    incomingStock: 50,
    reorderLevel: 12,
    availability: "low_stock",
  },
  {
    id: "3",
    productName: "MacBook Pro 14 M3",
    variantSku: "APL-MBP14M3-16-SLV",
    availableStock: 0,
    reservedStock: 0,
    incomingStock: 12,
    reorderLevel: 8,
    availability: "backorder",
  },
  {
    id: "4",
    productName: "AirPods Pro 2",
    variantSku: "APL-APP2-USB-C",
    availableStock: 0,
    reservedStock: 0,
    incomingStock: 0,
    reorderLevel: 25,
    availability: "out_of_stock",
  },
];

export default function InventoryPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [availability, setAvailability] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const filtered = MOCK.filter((item) => {
    const q = search.toLowerCase();
    const match =
      item.productName.toLowerCase().includes(q) || item.variantSku.toLowerCase().includes(q);
    return match && (availability === "all" || item.availability === availability);
  });

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
      id: "available",
      header: "Available",
      cell: (r) => <span className="font-semibold tabular-nums">{r.availableStock}</span>,
    },
    {
      id: "reserved",
      header: "Reserved",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.reservedStock}</span>,
    },
    {
      id: "incoming",
      header: "Incoming",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-info">{r.incomingStock}</span>,
    },
    {
      id: "reorder",
      header: "Reorder",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.reorderLevel}</span>,
    },
    {
      id: "availability",
      header: "Availability",
      cell: (r) => <StatusChip label={r.availability} tone={statusToneFromValue(r.availability)} />,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="text-right">
          <Link
            href={`/dashboard/inventory/adjust?id=${r.id}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Adjust
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      header={{
        title: "Inventory",
        description: "Stock levels, reservations, and warehouse-ready control",
        actions: (
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/inventory/low-stock">
              <Button variant="outline" size="sm" className="gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Low stock
              </Button>
            </Link>
            <Link href="/dashboard/inventory/history">
              <Button variant="outline" size="sm" className="gap-1.5">
                <History className="h-3.5 w-3.5" /> History
              </Button>
            </Link>
            <Link href="/dashboard/inventory/adjust">
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
              </Button>
            </Link>
            <Link href="/dashboard/inventory/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add stock
              </Button>
            </Link>
          </div>
        ),
      }}
      stats={
        <>
          <StatCard label="SKUs" value={MOCK.length} icon={Package} />
          <StatCard
            label="In stock"
            value={MOCK.filter((i) => i.availability === "in_stock").length}
            accent="success"
            icon={Warehouse}
          />
          <StatCard
            label="Low stock"
            value={MOCK.filter((i) => i.availability === "low_stock").length}
            accent="warning"
          />
          <StatCard
            label="Out of stock"
            value={
              MOCK.filter((i) =>
                ["out_of_stock", "backorder", "pre_order"].includes(i.availability),
              ).length
            }
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
                placeholder="Search product or SKU…"
                className="w-full sm:w-72"
              />
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">All availability</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="backorder">Backorder</option>
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
      />
    </ListLayout>
  );
}
