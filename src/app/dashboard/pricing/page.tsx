"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, DollarSign, TrendingUp, Shield, Percent, Clock,
  AlertTriangle, Layers, FileText, Calculator, History,
  CheckCircle, Tags, ShoppingBag, Zap, Search, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  searchProductPricingAction,
  listGlobalRulesAction,
  listPendingApprovalsAction,
  listPricingProfilesAction,
  listCampaignsAction,
} from "@/features/pricing/actions/pricing-engine-actions";
import ProductPricingPanel, { type ProductPricingData } from "@/features/pricing/components/sections/ProductPricingPanel";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";
import { SectionHeader } from "@/components/workspace/section-header";
import { StatCard } from "@/components/workspace/stat-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type Row = {
  id: string; productName: string; variantSku: string;
  baseCostPrice: number; sellingPrice: number; promotionalPrice?: number;
  wholesalePrice: number; profitMargin: number; currency: string;
  pricingRule: string; status: string;
};

export default function PricingIntelligenceHub(): React.ReactElement {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<ProductPricingData[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductPricingData | null>(null);
  const [showResults, setShowResults] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [stats, setStats] = React.useState({ activeRules: 0, draftRules: 0, profiles: 0, campaigns: 0, pendingApprovals: 0, manualOverrides: 0 });
  const pageSize = 10;

  const loadStats = React.useCallback(async () => {
    setLoading(true);
    try {
      const [pricingRes, rulesRes, approvalsRes, profilesRes, campaignsRes] = await Promise.all([
        import("@/features/pricing/actions/pricing-actions").then((m) => m.listPricingAction({ page: 1, limit: pageSize })),
        listGlobalRulesAction(),
        listPendingApprovalsAction(),
        listPricingProfilesAction(),
        listCampaignsAction(),
      ]);

      if (pricingRes.success && pricingRes.data) {
        const d = pricingRes.data as any;
        const items: Row[] = (d.items ?? []).map((p: any) => ({
          id: p.id, productName: p.productName ?? p.productId?.title ?? "",
          variantSku: p.variantSku ?? "", baseCostPrice: p.baseCostPrice ?? 0,
          sellingPrice: p.sellingPrice ?? 0, promotionalPrice: p.promotionalPrice,
          wholesalePrice: p.wholesalePrice ?? 0, profitMargin: p.profitMargin ?? 0,
          currency: p.currency ?? "BDT", pricingRule: p.pricingRule ?? "fixed", status: p.status ?? "inactive",
        }));
        setRows(items);
        setTotalCount(d.totalCount ?? items.length);
      }

      const rules = rulesRes.success ? (rulesRes.data ?? []) as any[] : [];
      const profiles = profilesRes.success ? (profilesRes.data ?? []) as any[] : [];
      const campaigns = campaignsRes.success ? (campaignsRes.data ?? []) as any[] : [];
      const approvals = approvalsRes.success ? (approvalsRes.data ?? []) as any[] : [];

      setStats({
        activeRules: rules.filter((r: any) => r.isActive).length,
        draftRules: rules.filter((r: any) => !r.isActive).length,
        profiles: profiles.length,
        campaigns: campaigns.length,
        pendingApprovals: approvals.length,
        manualOverrides: rows.filter((r) => r.pricingRule === "fixed").length,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { loadStats(); }, [loadStats]);

  const handleSearch = React.useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    try {
      const res = await searchProductPricingAction(q);
      if (res.success) {
        setSearchResults(res.data ?? []);
        setShowResults(true);
      }
    } catch { /* silent */ }
    finally { setSearching(false); }
  }, []);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectProduct = (p: ProductPricingData) => {
    setSelectedProduct(p);
    setShowResults(false);
    setSearchQuery(p.name);
  };

  const clearSelection = () => {
    setSelectedProduct(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const avgMargin = rows.length > 0 ? (rows.reduce((s, p) => s + p.profitMargin, 0) / rows.length).toFixed(1) : "0.0";

  const columns: DataTableColumn<Row>[] = [
    { id: "product", header: "Product", cell: (r) => (
      <div><div className="font-medium">{r.productName}</div>
      <div className="text-[11px] font-mono text-muted-foreground">{r.variantSku}</div></div>
    )},
    { id: "cost", header: "খরচ", hideOnMobile: true, cell: (r) => (
      <span className="tabular-nums text-muted-foreground">{formatCentsToCurrency(r.baseCostPrice, r.currency)}</span>
    )},
    { id: "selling", header: "বিক্রয়", cell: (r) => (
      <div><div className="font-semibold tabular-nums">{formatCentsToCurrency(r.promotionalPrice ?? r.sellingPrice, r.currency)}</div>
      {r.promotionalPrice ? <div className="text-[11px] text-muted-foreground line-through">{formatCentsToCurrency(r.sellingPrice, r.currency)}</div> : null}</div>
    )},
    { id: "margin", header: "মার্জিন", hideOnMobile: true, cell: (r) => (
      <span className={cn("font-medium tabular-nums", r.profitMargin > 20 ? "text-success" : r.profitMargin > 5 ? "text-warning" : "text-destructive")}>{r.profitMargin}%</span>
    )},
    { id: "rule", header: "Rule", hideOnMobile: true, cell: (r) => (
      <span className="text-xs capitalize text-muted-foreground">{r.pricingRule.replace(/_/g, " ")}</span>
    )},
    { id: "actions", header: "", cell: (r) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => handleSearch(r.productName)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <Search className="h-4 w-4" />
        </button>
      </div>
    )},
  ];

  const quickLinks = [
    { label: "Global Rules", href: "/dashboard/pricing/rules", icon: Shield, color: "text-primary" },
    { label: "Category Pricing", href: "/dashboard/pricing/rules/categories", icon: Tags, color: "text-info" },
    { label: "Brand Pricing", href: "/dashboard/pricing/rules/brands", icon: ShoppingBag, color: "text-success" },
    { label: "Supplier Pricing", href: "/dashboard/pricing/rules/suppliers", icon: Building2, color: "text-warning" },
    { label: "Pricing Profiles", href: "/dashboard/pricing/profiles", icon: Layers, color: "text-violet-500" },
    { label: "Simulator", href: "/dashboard/pricing/simulator", icon: Calculator, color: "text-emerald-500" },
    { label: "Campaigns", href: "/dashboard/pricing/campaigns", icon: Percent, color: "text-rose-500" },
    { label: "Schedule", href: "/dashboard/pricing/schedule", icon: Clock, color: "text-cyan-500" },
    { label: "Approvals", href: "/dashboard/pricing/approvals", icon: CheckCircle, color: "text-indigo-500" },
    { label: "History", href: "/dashboard/pricing/history", icon: History, color: "text-slate-500" },
    { label: "Bulk Tools", href: "/dashboard/pricing/bulk-tools", icon: Layers, color: "text-orange-500" },
    { label: "Import/Export", href: "/dashboard/pricing/import-export", icon: FileText, color: "text-sky-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight truncate">Pricing Intelligence Hub</h1>
              <p className="text-xs text-muted-foreground">মূল্য নির্ধারণ কেন্দ্র</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
            </span>
            <Link href="/dashboard/pricing/rules"><Button variant="outline" size="sm"><Shield className="h-3.5 w-3.5" /> Rules</Button></Link>
            <Link href="/dashboard/pricing/simulator"><Button variant="outline" size="sm"><Calculator className="h-3.5 w-3.5" /> Simulator</Button></Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search by product name, SKU, or barcode... পণ্য খুঁজুন"
            className="h-12 pl-10 pr-10 text-base rounded-xl border-2 focus-visible:border-primary"
          />
          {searchQuery && (
            <button onClick={clearSelection} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          {searching && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-30 max-h-80 overflow-y-auto shadow-xl border-primary/20">
            <CardContent className="p-1">
              {searchResults.map((p) => (
                <button key={p.productId} onClick={() => selectProduct(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left">
                  <div className="h-10 w-10 rounded-md bg-muted overflow-hidden shrink-0">
                    {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 m-2.5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="flex gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono">{p.sku}</span>
                      {p.brandName && <span>{p.brandName}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">{formatCentsToCurrency(p.sellingPrice, p.currency)}</div>
                    <div className={cn("text-[11px]", p.profitMargin > 20 ? "text-success" : "text-muted-foreground")}>{p.profitMargin.toFixed(1)}%</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {showResults && searchQuery && !searching && searchResults.length === 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-30 shadow-xl">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No products found for &quot;{searchQuery}&quot;
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Product Panel */}
      {selectedProduct && (
        <ProductPricingPanel product={selectedProduct} onRecalculate={(pid) => handleSearch(searchQuery)} />
      )}

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Rules" value={stats.activeRules} icon={Shield} accent="primary" />
        <StatCard label="Profiles" value={stats.profiles} icon={Layers} accent="info" />
        <StatCard label="Campaigns" value={stats.campaigns} icon={Percent} accent="warning" />
        <StatCard label="Manual Override" value={stats.manualOverrides} icon={Zap} accent="danger" />
        <StatCard label="Pending Approval" value={stats.pendingApprovals} icon={CheckCircle} accent="warning" />
        <StatCard label="Avg Margin" value={`${avgMargin}%`} icon={TrendingUp} accent="success" />
      </div>

      {/* Quick Links */}
      <SectionHeader title="Pricing Modules" description="মূল্য নির্ধারণ মডিউল" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-card border border-border", link.color)}>
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Pricing Table */}
      <SectionHeader title="Recent Pricing Activity" description="সাম্প্রতিক মূল্য কার্যকলাপ" />
      <DataTable
        columns={columns} data={rows} loading={loading}
        page={page} pageSize={pageSize} totalCount={totalCount}
        onPageChange={setPage}
        onRowClick={(r) => handleSearch(r.productName)}
        emptyTitle="No pricing records"
        emptyDescription="Add pricing to your products to see them here."
      />
    </div>
  );
}

function Building2(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.29 7 12 12l8.71-5"/><path d="M12 22V12"/></svg>;
}
