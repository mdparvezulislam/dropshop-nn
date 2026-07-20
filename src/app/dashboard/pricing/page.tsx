"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Layers, DollarSign, Pencil, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { listPricingAction } from "@/features/pricing/actions/pricing-actions";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { Toolbar } from "@/shared/components/workspace/toolbar";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

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

export default function PricingPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPricingAction({
        page,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      if (res.success && res.data) {
        const d = res.data as any;
        const items: Row[] = (d.items ?? []).map((p: any) => ({
          id: p.id,
          productName: p.productName ?? p.productId?.title ?? "",
          variantSku: p.variantSku ?? "",
          baseCostPrice: p.baseCostPrice ?? 0,
          sellingPrice: p.sellingPrice ?? 0,
          promotionalPrice: p.promotionalPrice,
          wholesalePrice: p.wholesalePrice ?? 0,
          profitMargin: p.profitMargin ?? 0,
          currency: p.currency ?? "USD",
          pricingRule: p.pricingRule ?? "fixed",
          status: p.status ?? "inactive",
        }));
        setRows(items);
        setTotalCount(d.totalCount ?? items.length);
      }
    } catch {
      toast.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) || r.variantSku.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const avgMargin =
    rows.length > 0
      ? (rows.reduce((s, p) => s + p.profitMargin, 0) / rows.length).toFixed(1)
      : "0";

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
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Priced SKUs" value={totalCount} icon={DollarSign} />
            <StatCard label="Avg margin" value={`${avgMargin}%`} accent="success" icon={TrendingUp} />
            <StatCard
              label="Active promos"
              value={rows.filter((p) => p.promotionalPrice).length}
              accent="warning"
            />
            <StatCard
              label="Active"
              value={rows.filter((p) => p.status === "active").length}
              accent="info"
            />
          </>
        )
      }
      toolbar={
        <Toolbar
          left={
            <>
              <SearchBox
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search product or SKU…"
                className="w-full sm:w-72"
              />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowClick={(r) => router.push(`/dashboard/pricing/${r.id}`)}
        emptyTitle="No pricing records"
        emptyDescription="Add pricing to your products to see them here."
      />
    </ListLayout>
  );
}
