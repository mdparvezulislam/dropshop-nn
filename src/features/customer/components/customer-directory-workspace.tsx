"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  listCustomersAction,
  updateTagsAction,
} from "@/features/customer/actions/customer-actions";
import { formatAmount } from "@/features/order/utils/payment-utils";
import {
  Search,
  Users,
  UserCheck,
  Crown,
  TrendingUp,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Tag,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  LayoutGrid,
  List,
  Download,
  PlusCircle,
  ChevronRight,
  Filter,
  X,
  ExternalLink,
  Ban,
  CheckCircle2,
} from "lucide-react";

interface CustomerDirectoryWorkspaceProps {
  initialCustomers?: any[];
  userRole?: string;
}

export function CustomerDirectoryWorkspace({
  initialCustomers = [],
  userRole = "admin",
}: CustomerDirectoryWorkspaceProps): React.ReactElement {
  const router = useRouter();

  // State
  const [customers, setCustomers] = useState<any[]>(initialCustomers);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeFilterPreset, setActiveFilterPreset] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCustomersAction(search);
      if (res.success && res.data) {
        setCustomers(res.data);
      } else {
        toast.error(res.error || "গ্রাহকদের তথ্য লোড করা যায়নি");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter Presets Definition
  const FILTER_PRESETS = [
    { id: "all", label: "All Customers" },
    { id: "vip", label: "VIP Members" },
    { id: "high_value", label: "High Value (LTV > ৳10k)" },
    { id: "repeat", label: "Repeat Buyers" },
    { id: "risk", label: "High Risk / Fraud" },
    { id: "reseller", label: "Reseller Network" },
    { id: "wholesale", label: "Wholesale B2B" },
  ];

  // Client-side Preset Filtering
  const filteredCustomers = customers.filter((c) => {
    const stats = c.statistics || {};
    const tags: string[] = c.tags || [];
    const totalSpend = (stats.totalSpend || 0) / 100;
    const totalOrders = stats.totalOrders || 0;

    if (activeFilterPreset === "vip") return tags.includes("VIP") || totalSpend > 20000;
    if (activeFilterPreset === "high_value") return totalSpend >= 10000;
    if (activeFilterPreset === "repeat") return totalOrders >= 2;
    if (activeFilterPreset === "risk") return tags.includes("Fraud Risk") || tags.includes("Blacklisted");
    if (activeFilterPreset === "reseller") return tags.includes("Reseller") || c.source === "reseller";
    if (activeFilterPreset === "wholesale") return tags.includes("Wholesale") || c.source === "wholesaler";
    return true;
  });

  // Calculate Metrics
  const totalCount = customers.length;
  const vipCount = customers.filter((c) => (c.tags || []).includes("VIP") || ((c.statistics?.totalSpend || 0) / 100) > 20000).length;
  const totalLtvSpend = customers.reduce((sum, c) => sum + Math.round((c.statistics?.totalSpend || 0) / 100), 0);
  const repeatCount = customers.filter((c) => (c.statistics?.totalOrders || 0) >= 2).length;
  const repeatRate = totalCount > 0 ? Math.round((repeatCount / totalCount) * 100) : 0;

  // Selection Logic
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map((c) => c.id || c._id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk Actions
  const handleBulkAddTag = async (tagName: string) => {
    if (selectedIds.size === 0) return;
    try {
      let updatedCount = 0;
      for (const id of Array.from(selectedIds)) {
        const c = customers.find((cust) => (cust.id || cust._id) === id);
        if (c) {
          const currentTags: string[] = c.tags || [];
          if (!currentTags.includes(tagName)) {
            await updateTagsAction({ customerId: id, tags: [...currentTags, tagName] });
            updatedCount++;
          }
        }
      }
      toast.success(`${updatedCount} জন গ্রাহকের প্রোফাইলে '${tagName}' ট্যাগ যোগ করা হয়েছে!`);
      setSelectedIds(new Set());
      fetchCustomers();
    } catch {
      toast.error("বাল্ক আপডেট ব্যর্থ হয়েছে");
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const itemsToExport = selectedIds.size > 0
      ? customers.filter((c) => selectedIds.has(c.id || c._id))
      : filteredCustomers;

    const headers = ["Customer ID", "Name", "Phone", "Email", "Total Orders", "Total Spend (BDT)", "Tags", "Created At"];
    const rows = itemsToExport.map((c) => [
      c.id || c._id,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      c.statistics?.totalOrders || 0,
      Math.round((c.statistics?.totalSpend || 0) / 100),
      `"${(c.tags || []).join(", ")}"`,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${itemsToExport.length} জন গ্রাহকের তথ্য CSV ফাইলে ডাউনলোড হয়েছে!`);
  };

  return (
    <div className="w-full space-y-5 pb-24">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-amber-500" />
            Customer Intelligence & CRM
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            360° Customer Profiles, LTV Metrics, Segmentation & Retention Hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            disabled={loading}
            className="h-10 text-xs font-bold border-border"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleExportCsv}
            className="h-10 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-md rounded-xl gap-1.5"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase">Total Customers</p>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black font-mono text-foreground mt-1">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase">VIP Members</p>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-500 mt-1">{vipCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase">Total Customer LTV</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
            ৳ {formatAmount(totalLtvSpend)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase">Repeat Rate</p>
            <UserCheck className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black font-mono text-purple-600 mt-1">{repeatRate}%</p>
        </div>
      </div>

      {/* 3. Search & Preset Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_PRESETS.map((tab) => {
            const isActive = activeFilterPreset === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilterPreset(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
                  isActive
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Name, Phone, Email, Tag, Customer ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs font-medium rounded-xl border-border bg-card"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-border p-1 bg-card">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "card" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Customer Content Grid / Table */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-bold text-foreground">কোনো গ্রাহক পাওয়া যায়নি</p>
          <p className="text-xs text-muted-foreground mt-1">সার্চ ফিল্টার রিসেট করে ট্রাই করুন</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            const customerId = c.id || c._id;
            const stats = c.statistics || {};
            const spendTaka = Math.round((stats.totalSpend || 0) / 100);
            const totalOrders = stats.totalOrders || 0;
            const tags: string[] = c.tags || [];
            const isVip = tags.includes("VIP") || spendTaka > 20000;
            const formattedPhone = (c.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "880");

            return (
              <div
                key={customerId}
                className="rounded-2xl border border-border bg-card p-4 hover:border-amber-500/50 hover:shadow-md transition-all space-y-3 relative group"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 font-black text-sm uppercase font-heading border border-amber-500/20">
                      {c.name ? c.name.slice(0, 2) : "CU"}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/orders/customers/${customerId}`}
                        className="text-sm font-extrabold text-foreground hover:text-amber-500 transition-colors line-clamp-1 block"
                      >
                        {c.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        ID: #{customerId.slice(-6)}
                      </p>
                    </div>
                  </div>

                  {isVip && (
                    <Badge variant="warning" size="xs" className="gap-1 font-extrabold shrink-0">
                      <Crown className="h-3 w-3 fill-amber-500 text-amber-600" /> VIP
                    </Badge>
                  )}
                </div>

                {/* Contact Links */}
                <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-foreground font-semibold flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-blue-500" />
                      {c.phone}
                    </span>
                    {c.phone && (
                      <a
                        href={`https://wa.me/${formattedPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                  {c.email && (
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {c.email}
                    </p>
                  )}
                </div>

                {/* Spend & Order Stats */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 text-xs border border-border/40">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Spend</span>
                    <span className="font-black font-mono text-emerald-600 text-sm">৳ {formatAmount(spendTaka)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Orders</span>
                    <span className="font-black font-mono text-foreground text-sm">{totalOrders} Orders</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="xs" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* View Details Link */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Source: {c.source || "Website"}</span>
                  <Link
                    href={`/dashboard/orders/customers/${customerId}`}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-0.5"
                  >
                    360° Profile <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-border bg-card overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-extrabold text-[11px] border-b border-border">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <Checkbox
                    checked={selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0}
                    onCheckedChange={handleToggleSelectAll}
                  />
                </th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5 text-center">Orders</th>
                <th className="p-3.5 text-right">Lifetime Spend</th>
                <th className="p-3.5">Tags</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCustomers.map((c) => {
                const customerId = c.id || c._id;
                const spendTaka = Math.round(((c.statistics?.totalSpend || 0) / 100));
                const isSelected = selectedIds.has(customerId);

                return (
                  <tr key={customerId} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelectOne(customerId)}
                      />
                    </td>
                    <td className="p-3.5">
                      <Link
                        href={`/dashboard/orders/customers/${customerId}`}
                        className="font-bold text-foreground hover:text-amber-500 transition-colors block"
                      >
                        {c.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground font-mono">ID: #{customerId.slice(-6)}</span>
                    </td>
                    <td className="p-3.5 font-mono">
                      {c.phone}
                      {c.email && <span className="block text-[10px] text-muted-foreground font-sans">{c.email}</span>}
                    </td>
                    <td className="p-3.5 text-center font-bold font-mono">
                      {c.statistics?.totalOrders || 0}
                    </td>
                    <td className="p-3.5 text-right font-black font-mono text-emerald-600">
                      ৳ {formatAmount(spendTaka)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((t: string) => (
                          <Badge key={t} variant="outline" size="xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/dashboard/orders/customers/${customerId}`}
                        className="text-xs font-bold text-amber-600 hover:underline"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Bulk Action Floating Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl rounded-2xl bg-slate-900/95 text-white p-3 shadow-2xl backdrop-blur-md border border-slate-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-mono">
              {selectedIds.size}
            </div>
            <div>
              <p className="text-xs font-extrabold text-white leading-tight">
                {selectedIds.size} Customers Selected
              </p>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] text-slate-400 hover:text-amber-400 font-semibold underline"
              >
                Clear selection
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkAddTag("VIP")}
              className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border-0 gap-1"
            >
              <Crown className="h-3.5 w-3.5" /> + VIP Tag
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkAddTag("High Risk")}
              className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border-0 gap-1"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> + Risk Tag
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportCsv}
              className="h-8 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 gap-1"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
