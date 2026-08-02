"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  listGlobalRulesAction,
  createGlobalRuleAction,
  updateGlobalRuleAction,
  deleteGlobalRuleAction,
  listCampaignsAction,
} from "@/features/pricing/actions/pricing-engine-actions";
import { listPricingAction } from "@/features/pricing/actions/pricing-actions";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Tag,
  Zap,
  Check,
  X,
} from "lucide-react";
import { formatAmount } from "@/features/order/utils/payment-utils";
import { Spinner } from "@/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";

type MainTab = "catalog" | "rules" | "campaigns";

export default function PricingEnginePage(): React.ReactElement {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as MainTab) || "catalog";

  const [activeTab, setActiveTab] = React.useState<MainTab>(initialTab);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Data states
  const [pricingItems, setPricingItems] = React.useState<any[]>([]);
  const [globalRules, setGlobalRules] = React.useState<any[]>([]);
  const [campaigns, setCampaigns] = React.useState<any[]>([]);

  // Rule Editor Dialog State
  const [isRuleModalOpen, setIsRuleModalOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<any | null>(null);
  const [ruleForm, setRuleForm] = React.useState({
    name: "",
    channel: "retail",
    markupType: "percentage" as "percentage" | "fixed_amount",
    markupValue: 20,
    minMarginPercent: 5,
    maxDiscount: 50,
    priority: 100,
    isActive: true,
  });
  const [savingRule, setSavingRule] = React.useState(false);

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [pricingRes, rulesRes, campaignsRes] = await Promise.all([
        listPricingAction({ page: 1, limit: 50 }),
        listGlobalRulesAction(),
        listCampaignsAction(),
      ]);

      if (pricingRes.success && pricingRes.data) {
        const pData = pricingRes.data as any;
        setPricingItems(Array.isArray(pData) ? pData : pData.items || []);
      }
      if (rulesRes.success && rulesRes.data) {
        setGlobalRules(rulesRes.data as any[]);
      }
      if (campaignsRes.success && campaignsRes.data) {
        setCampaigns(campaignsRes.data as any[]);
      }
    } catch {
      toast.error("Failed to load pricing engine data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleOpenRuleModal = (rule?: any) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        name: rule.name || "",
        channel: rule.channel || "retail",
        markupType: rule.markupType === "fixed_amount" ? "fixed_amount" : "percentage",
        markupValue: rule.markupValue || 20,
        minMarginPercent: rule.minMarginPercent || 5,
        maxDiscount: rule.maxDiscount || 50,
        priority: rule.priority || 100,
        isActive: rule.isActive ?? true,
      });
    } else {
      setEditingRule(null);
      setRuleForm({
        name: "",
        channel: "retail",
        markupType: "percentage",
        markupValue: 20,
        minMarginPercent: 5,
        maxDiscount: 50,
        priority: 100,
        isActive: true,
      });
    }
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRule(true);
    try {
      if (editingRule) {
        const ruleId = editingRule.id || editingRule._id;
        const res = await updateGlobalRuleAction(ruleId, ruleForm);
        if (res.success) {
          toast.success("Markup rule updated successfully!");
          setIsRuleModalOpen(false);
          loadAllData();
        } else {
          toast.error((res as any).error || "Failed to update rule");
        }
      } else {
        const res = await createGlobalRuleAction(ruleForm);
        if (res.success) {
          toast.success("New markup rule created!");
          setIsRuleModalOpen(false);
          loadAllData();
        } else {
          toast.error((res as any).error || "Failed to create rule");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Rule save error");
    } finally {
      setSavingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this pricing rule?")) return;
    try {
      const res = await deleteGlobalRuleAction(ruleId);
      if (res.success) {
        toast.success("Markup rule deleted!");
        loadAllData();
      } else {
        toast.error((res as any).error || "Failed to delete rule");
      }
    } catch (err: any) {
      toast.error(err.message || "Delete error");
    }
  };

  // Filter pricing items by search query
  const filteredPricingItems = pricingItems.filter((i) => {
    const title = i.productName || i.title || "";
    const sku = i.variantSku || "";
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              Pricing Engine & Margin Rules
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              PROFIT CONTROL
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Automated reseller markup rates, wholesale channel tier pricing, and campaign discounts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => handleOpenRuleModal()}
            size="sm"
            className="h-9 px-4 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Markup Rule
          </Button>

          <Button
            onClick={loadAllData}
            size="sm"
            variant="outline"
            disabled={loading}
            className="h-9 text-xs font-bold gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Active Markup Rules</span>
          <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {globalRules.filter((r) => r.isActive !== false).length} Rules
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Channel markup rules</span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Retail Base Markup</span>
          <p className="text-xl font-black font-mono text-foreground">
            +20% Margin
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Default retail profit tier</span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Reseller Profit Margin</span>
          <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
            +15% Target
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Dropshipping margin</span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Active Campaigns</span>
          <p className="text-xl font-black font-mono text-foreground">
            {campaigns.length} Campaigns
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Flash sales & coupons</span>
        </Card>
      </div>

      {/* 3 Clean Navigation Tabs & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "catalog"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" /> 💲 Catalog Pricing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "rules"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Zap className="h-4 w-4" /> ⚡ Channel Markup Rules ({globalRules.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "campaigns"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Tag className="h-4 w-4" /> 🏷️ Campaigns & Flash Sales
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search product or rule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-border bg-card"
          />
        </div>
      </div>

      {/* TAB 1: CATALOG PRICING */}
      {activeTab === "catalog" && (
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader className="p-5 border-b border-border/60">
            <CardTitle className="text-base font-extrabold">Product Pricing & Profit Margins</CardTitle>
            <CardDescription className="text-xs">Base cost prices, retail selling prices, and reseller profit margins</CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                <Spinner size="sm" /> Loading catalog prices...
              </div>
            ) : filteredPricingItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No product pricing entries found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPricingItems.map((item: any) => {
                  const id = item.id || item._id;
                  const name = item.productName || item.title || "Product";
                  const cost = item.baseCostPrice > 5000 ? Math.round(item.baseCostPrice / 100) : item.baseCostPrice || 0;
                  const selling = item.sellingPrice > 5000 ? Math.round(item.sellingPrice / 100) : item.sellingPrice || 0;
                  const margin = item.profitMargin || (cost > 0 ? Math.round(((selling - cost) / cost) * 100) : 0);

                  return (
                    <div key={id} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-foreground text-xs truncate">{name}</h3>
                          <span className="text-[10px] font-mono text-muted-foreground">SKU: {item.variantSku || "DEFAULT"}</span>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                          +{margin}% Margin
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Cost Price</span>
                          <span className="font-bold text-foreground">৳ {formatAmount(cost)}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Retail Selling</span>
                          <span className="font-bold text-emerald-600">৳ {formatAmount(selling)}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Wholesale Price</span>
                          <span className="font-bold text-amber-600">৳ {formatAmount(item.wholesalePrice ? (item.wholesalePrice > 5000 ? Math.round(item.wholesalePrice / 100) : item.wholesalePrice) : selling)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: CHANNEL MARKUP RULES */}
      {activeTab === "rules" && (
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader className="p-5 border-b border-border/60">
            <CardTitle className="text-base font-extrabold">Automated Channel Markup Rules</CardTitle>
            <CardDescription className="text-xs">Rule-based automatic markup rules applied across sales channels</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {globalRules.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No automated markup rules configured.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {globalRules.map((rule: any) => {
                  const rId = rule.id || rule._id;
                  return (
                    <div key={rId} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <div>
                          <h3 className="font-extrabold text-foreground text-xs">{rule.name || "Markup Rule"}</h3>
                          <p className="text-[10px] font-mono text-muted-foreground capitalize">Channel: {rule.channel || "retail"}</p>
                        </div>
                        <StatusChip label={rule.isActive !== false ? "active" : "inactive"} tone={statusToneFromValue(rule.isActive !== false ? "active" : "inactive")} />
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Markup Rate:</span>
                        <span className="font-bold text-emerald-600">
                          {rule.markupType === "fixed_amount" ? `+৳${rule.markupValue}` : `+${rule.markupValue}%`}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenRuleModal(rule)}
                          className="h-8 text-xs font-bold gap-1 text-amber-600 hover:bg-amber-500/10"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRule(rId)}
                          className="h-8 text-xs font-bold gap-1 text-rose-600 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: CAMPAIGNS & FLASH SALES */}
      {activeTab === "campaigns" && (
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader className="p-5 border-b border-border/60">
            <CardTitle className="text-base font-extrabold">Promotional Campaigns & Coupons</CardTitle>
            <CardDescription className="text-xs">Active promotional pricing rules and store flash sales</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No active discount campaigns.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {campaigns.map((c: any) => (
                  <div key={c.id || c._id} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-foreground text-xs">{c.name || "Flash Campaign"}</h3>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold">
                        ACTIVE
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">Discount: {c.discountPercent || 10}% OFF</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rule Editor Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">
                {editingRule ? "Edit Channel Markup Rule" : "Create Channel Markup Rule"}
              </h3>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsRuleModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Rule Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Reseller Base Markup"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  required
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Sales Channel</label>
                  <select
                    value={ruleForm.channel}
                    onChange={(e) => setRuleForm({ ...ruleForm, channel: e.target.value })}
                    className="w-full h-9 text-xs rounded-xl border border-border bg-background px-3 font-bold text-foreground"
                  >
                    <option value="retail">Retail</option>
                    <option value="reseller">Reseller</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="marketplace">Marketplace</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Markup Type</label>
                  <select
                    value={ruleForm.markupType}
                    onChange={(e) => setRuleForm({ ...ruleForm, markupType: e.target.value as "percentage" | "fixed_amount" })}
                    className="w-full h-9 text-xs rounded-xl border border-border bg-background px-3 font-bold text-foreground"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (৳)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Markup Value ({ruleForm.markupType === "percentage" ? "%" : "৳ Taka"})
                </label>
                <Input
                  type="number"
                  value={ruleForm.markupValue}
                  onChange={(e) => setRuleForm({ ...ruleForm, markupValue: parseFloat(e.target.value) || 0 })}
                  required
                  className="h-9 text-xs font-mono font-bold rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsRuleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={savingRule}
                  className="h-9 px-4 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-1"
                >
                  <Check className="h-4 w-4" /> Save Markup Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
