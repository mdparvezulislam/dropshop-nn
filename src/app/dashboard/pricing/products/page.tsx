"use client";

import * as React from "react";
import { Package, Search, Lock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { listAllPricingForSearchAction } from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";

type Item = { id: string; productId: string; variantSku?: string; baseCostPrice: number; sellingPrice: number; wholesalePrice: number; resellerPrice: number; currency: string; pricingRule: string; status: string; hasManualOverride: boolean; };

export default function ProductPricingPage(): React.ReactElement {
  const [items, setItems] = React.useState<Item[]>([]);
  const [filtered, setFiltered] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    listAllPricingForSearchAction().then((res) => {
      if (res.success) { setItems((res.data ?? []) as Item[]); setFiltered((res.data ?? []) as Item[]); }
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter((i) => i.productId.toLowerCase().includes(q) || (i.variantSku?.toLowerCase() ?? "").includes(q)));
  }, [search, items]);

  const columns: DataTableColumn<Item>[] = [
    { id: "product", header: "Product / SKU", cell: (r) => (
      <div><div className="font-mono text-xs">{r.productId.slice(0, 16)}...</div>
      {r.variantSku && <div className="text-[10px] text-muted-foreground">{r.variantSku}</div>}</div>
    )},
    { id: "cost", header: "খরচ", cell: (r) => <span className="tabular-nums">{formatCentsToCurrency(r.baseCostPrice, r.currency)}</span> },
    { id: "retail", header: "Retail", cell: (r) => <span className="font-semibold">{formatCentsToCurrency(r.sellingPrice, r.currency)}</span> },
    { id: "wholesale", header: "Wholesale", hideOnMobile: true, cell: (r) => <span>{formatCentsToCurrency(r.wholesalePrice, r.currency)}</span> },
    { id: "reseller", header: "Reseller", hideOnMobile: true, cell: (r) => <span>{formatCentsToCurrency(r.resellerPrice, r.currency)}</span> },
    { id: "rule", header: "Rule", cell: (r) => (
      <div className="flex items-center gap-1">
        <span className="text-xs capitalize">{r.pricingRule.replace(/_/g, " ")}</span>
        {r.hasManualOverride && <Lock className="h-3 w-3 text-warning" />}
      </div>
    )},
    { id: "status", header: "", cell: (r) => <Badge variant={r.status === "active" ? "success" : "muted"} size="xs">{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Product Level Pricing" description="পণ্য স্তরের মূল্য নির্ধারণ — প্রতিটি পণ্যের জন্য ম্যানুয়াল ওভাররাইড" icon={Package} />
      <div className="max-w-md">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by Product ID or SKU..." />
      </div>
      <DataTable columns={columns} data={filtered} loading={loading}
        emptyTitle="No products" emptyDescription="Search for a product to view its pricing." />
    </div>
  );
}
