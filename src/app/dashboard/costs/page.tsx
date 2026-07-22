"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  DollarSign, Search, X, TrendingUp, ArrowUp, ArrowDown,
  Clock, Shield, FileText, Download, Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  searchProductCostAction,
  getCurrentCostAction,
  getCostTimelineAction,
  getCostAnalyticsAction,
  compareCostVersionsAction,
} from "@/features/cost/actions/cost-actions";
import CostPanel, { type CostPanelProduct } from "@/features/cost/components/sections/CostPanel";
import CostTimeline, { type TimelineEntry } from "@/features/cost/components/sections/CostTimeline";
import CostCompare, { type CompareVersion } from "@/features/cost/components/sections/CostCompare";
import CostQuickUpdate from "@/features/cost/components/sections/CostQuickUpdate";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { Spinner } from "@/shared/components/ui/spinner";
import { Badge } from "@/shared/components/ui/badge";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";
import { cn } from "@/shared/utils/cn";

export default function CostIntelligenceCenter(): React.ReactElement {
  const searchParams = useSearchParams();
  const updateParam = searchParams.get("update");
  const historyParam = searchParams.get("history");
  const compareParam = searchParams.get("compare");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [showResults, setShowResults] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const [selectedProduct, setSelectedProduct] = React.useState<CostPanelProduct | null>(null);
  const [showUpdate, setShowUpdate] = React.useState(false);
  const [versions, setVersions] = React.useState<TimelineEntry[]>([]);
  const [showTimeline, setShowTimeline] = React.useState(false);

  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  const [compareResult, setCompareResult] = React.useState<any>(null);

  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getCostAnalyticsAction().then((res) => {
      if (res.success) setAnalytics(res.data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (updateParam) { selectProductById(updateParam); setShowUpdate(true); }
    else if (historyParam) { selectProductById(historyParam); setShowTimeline(true); }
    else if (compareParam) { selectProductById(compareParam); setCompareIds([]); }
  }, [updateParam, historyParam, compareParam]);

  const selectProductById = async (id: string) => {
    try {
      const res = await getCurrentCostAction(id);
      if (res.success && res.data) {
        const cost = res.data;
        setSelectedProduct({
          productId: id,
          name: "",
          sku: "",
          currentCost: cost.costPrice,
          currentLandedCost: cost.landedCost,
          currentVersion: cost.versionNumber,
          supplierName: cost.supplier?.supplierName,
          lastUpdated: cost.createdAt?.toString(),
          currency: cost.currency,
        });
      }
    } catch { /* silent */ }
  };

  const handleSearch = React.useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    try {
      const res = await searchProductCostAction(q);
      if (res.success) { setSearchResults(res.data ?? []); setShowResults(true); }
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

  const selectProduct = async (p: any) => {
    setSelectedProduct({
      productId: p.productId,
      name: p.name,
      sku: p.sku,
      image: p.image,
      currentCost: p.currentCost,
      currentLandedCost: p.currentLandedCost,
      currentVersion: p.currentVersion,
      supplierName: p.supplierName,
      lastUpdated: p.lastUpdated,
      currency: p.currency,
    });
    setShowResults(false);
    setSearchQuery(p.name);
    setShowUpdate(false);
    setShowTimeline(false);
    setCompareResult(null);
    setVersions([]);
  };

  const loadTimeline = async (productId: string) => {
    const res = await getCostTimelineAction(productId);
    if (res.success) setVersions((res.data ?? []).map((v: any) => ({
      ...v,
      effectiveDate: v.effectiveDate?.toString() ?? new Date().toISOString(),
      createdAt: v.createdAt?.toString() ?? new Date().toISOString(),
    })));
  };

  const handleViewTimeline = async () => {
    if (!selectedProduct) return;
    setShowTimeline(!showTimeline);
    if (!showTimeline) await loadTimeline(selectedProduct.productId);
  };

  const handleCompare = async (idA: string, idB: string) => {
    try {
      const res = await compareCostVersionsAction(idA, idB);
      if (res.success) setCompareResult(res.data);
    } catch { toast.error("Compare failed"); }
  };

  const clearSelection = () => {
    setSelectedProduct(null);
    setSearchQuery("");
    setShowResults(false);
    setShowUpdate(false);
    setShowTimeline(false);
    setCompareResult(null);
  };

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
              <h1 className="text-lg font-bold tracking-tight truncate">Cost Intelligence Center</h1>
              <p className="text-xs text-muted-foreground">খরচ বুদ্ধিমত্তা কেন্দ্র</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
            </span>
            <Button variant="outline" size="sm" disabled><Download className="h-3.5 w-3.5" /> Export</Button>
            <Button variant="outline" size="sm" disabled><FileText className="h-3.5 w-3.5" /> Reports</Button>
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
            placeholder="পণ্যের নাম, SKU অথবা Barcode লিখে খুঁজুন"
            className="h-12 pl-10 pr-10 text-base rounded-xl border-2 focus-visible:border-primary"
          />
          {searchQuery && (
            <button onClick={clearSelection} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          {searching && <div className="absolute right-10 top-1/2 -translate-y-1/2"><Spinner size="sm" /></div>}
        </div>

        {showResults && searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-30 max-h-80 overflow-y-auto shadow-xl border-primary/20">
            <CardContent className="p-1">
              {searchResults.map((p: any) => (
                <button key={p.productId} onClick={() => selectProduct(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left">
                  <div className="h-10 w-10 rounded-md bg-muted overflow-hidden shrink-0">
                    {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 m-2.5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="flex gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono">{p.sku}</span>
                      {p.supplierName && <span>{p.supplierName}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">{formatCentsToCurrency(p.currentCost, p.currency)}</div>
                    <div className="text-[11px] text-muted-foreground">v{p.currentVersion}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current Cost Panel */}
      {selectedProduct && !showUpdate && (
        <CostPanel
          product={selectedProduct}
          onRefresh={() => {
            if (selectedProduct) {
              getCurrentCostAction(selectedProduct.productId).then((res) => {
                if (res.success && res.data) {
                  setSelectedProduct((prev) => prev ? {
                    ...prev,
                    currentCost: res.data!.costPrice,
                    currentLandedCost: res.data!.landedCost,
                    currentVersion: res.data!.versionNumber,
                    supplierName: res.data!.supplier?.supplierName,
                    lastUpdated: res.data!.createdAt?.toString(),
                  } : prev);
                }
              });
              if (showTimeline) loadTimeline(selectedProduct.productId);
            }
          }}
        />
      )}

      {/* Quick Update Form */}
      {showUpdate && selectedProduct && (
        <CostQuickUpdate
          productId={selectedProduct.productId}
          productName={selectedProduct.name}
          currentCost={selectedProduct.currentCost}
          currentLandedCost={selectedProduct.currentLandedCost}
          currency={selectedProduct.currency}
          onSaved={() => {
            setShowUpdate(false);
            if (selectedProduct) {
              getCurrentCostAction(selectedProduct.productId).then((res) => {
                if (res.success && res.data) {
                  setSelectedProduct((prev) => prev ? {
                    ...prev,
                    currentCost: res.data!.costPrice,
                    currentLandedCost: res.data!.landedCost,
                    currentVersion: res.data!.versionNumber,
                    supplierName: res.data!.supplier?.supplierName,
                    lastUpdated: res.data!.createdAt?.toString(),
                  } : prev);
                }
              });
            }
          }}
          onCancel={() => setShowUpdate(false)}
        />
      )}

      {/* Timeline */}
      {showTimeline && selectedProduct && (
        <div>
          <SectionHeader
            title="Cost Timeline"
            description={`${selectedProduct.name} — v${selectedProduct.currentVersion} latest`}
            action={
              compareResult ? (
                <Button variant="outline" size="sm" onClick={() => setCompareResult(null)}>Back to Timeline</Button>
              ) : undefined
            }
          />
          <CostTimeline entries={versions} />
        </div>
      )}

      {/* Compare */}
      {compareResult && (
        <CostCompare
          versionA={compareResult.versionA}
          versionB={compareResult.versionB}
          costDifference={compareResult.costDifference}
          costDifferencePercent={compareResult.costDifferencePercent}
          landedCostDifference={compareResult.landedCostDifference}
          landedCostDifferencePercent={compareResult.landedCostDifferencePercent}
          isIncrease={compareResult.isIncrease}
        />
      )}

      {/* Version selector for compare */}
      {selectedProduct && versions.length >= 2 && !compareResult && showTimeline && (
        <Card className="border-info/20">
          <CardContent className="p-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold">Select two versions to compare:</span>
            <div className="flex gap-2 flex-wrap">
              {versions.slice(0, 10).map((v) => (
                <button key={v.id} onClick={() => {
                  const newIds = compareIds.includes(v.id)
                    ? compareIds.filter((id) => id !== v.id)
                    : [...compareIds, v.id].slice(-2);
                  setCompareIds(newIds);
                  if (newIds.length === 2) handleCompare(newIds[0], newIds[1]);
                }}
                  className={cn("h-8 px-2.5 rounded-lg text-xs font-semibold border transition-colors",
                    compareIds.includes(v.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  v{v.versionNumber}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {!selectedProduct && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="গড় খরচ" value={analytics ? formatCentsToCurrency(analytics.averageCost, "BDT") : "—"} icon={DollarSign} accent="primary" />
          <StatCard label="Avg Landed Cost" value={analytics ? formatCentsToCurrency(analytics.averageLandedCost, "BDT") : "—"} icon={TrendingUp} accent="info" />
          <StatCard label="Today&apos;s Updates" value={analytics?.productsUpdatedToday ?? 0} icon={Clock} accent="warning" />
          <StatCard label="Pending Approval" value={analytics?.pendingApprovals ?? 0} icon={Shield} accent="danger" />
          <StatCard label="Highest Increase" value={analytics?.highestIncrease ? formatCentsToCurrency(analytics.highestIncrease.amount, "BDT") : "—"} icon={ArrowUp} accent="danger" />
          <StatCard label="Largest Drop" value={analytics?.largestDrop ? formatCentsToCurrency(Math.abs(analytics.largestDrop.amount), "BDT") : "—"} icon={ArrowDown} accent="success" />
        </div>
      )}

      {/* Quick Actions */}
      {selectedProduct && !showTimeline && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowUpdate(true)}><DollarSign className="h-4 w-4" /> Quick Update</Button>
          <Button variant="outline" onClick={handleViewTimeline}><Clock className="h-4 w-4" /> Timeline</Button>
        </div>
      )}
    </div>
  );
}
