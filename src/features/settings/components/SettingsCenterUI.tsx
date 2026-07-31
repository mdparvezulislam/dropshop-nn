"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  getAllSettingsAction,
  updateSettingAction,
  toggleFeatureFlagAction,
  exportSettingsAction,
  importSettingsAction,
  resetCategoryToDefaultAction,
} from "../actions/settings-actions";
import { toast } from "sonner";
import {
  Sliders,
  Database,
  Globe,
  Scale,
  DollarSign,
  Package,
  Truck,
  Lock,
  Flag,
  HardDrive,
  Activity,
  History,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Server,
  Zap,
  RotateCcw,
} from "lucide-react";

export function SettingsCenterUI(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<string>("overview");
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [settingsList, setSettingsList] = React.useState<any[]>([]);
  const [flagsList, setFlagsList] = React.useState<any[]>([]);
  const [healthStatus, setHealthStatus] = React.useState<any>(null);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

  // Editing state maps
  const [editValues, setEditValues] = React.useState<Record<string, any>>({});
  const [savingKey, setSavingKey] = React.useState<string | null>(null);

  // Import file upload ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const tabSliderRef = React.useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabSliderRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      tabSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSettingsAction();
      if (res.success && res.data) {
        setSettingsList(res.data.settings);
        setFlagsList(res.data.flags);
        setHealthStatus(res.data.health);
        setAuditLogs(res.data.auditLogs);

        // Prepopulate editValues map
        const map: Record<string, any> = {};
        res.data.settings.forEach((s: any) => {
          map[s.key] = s.value;
        });
        setEditValues(map);
      } else {
        toast.error(res.error || "Failed to load platform settings");
      }
    } catch {
      toast.error("Failed to fetch settings from server");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveSetting = async (key: string) => {
    const val = editValues[key];
    if (val === undefined) return;
    setSavingKey(key);
    try {
      const res = await updateSettingAction({ key, value: val });
      if (res.success) {
        toast.success(`Setting '${key}' updated successfully`);
        loadAllData();
      } else {
        toast.error(res.error || "Failed to update setting");
      }
    } catch (err: any) {
      toast.error(err.message || "Update error");
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleFlag = async (key: string, currentState: string) => {
    const nextState = currentState === "on" ? "off" : "on";
    try {
      const res = await toggleFeatureFlagAction({ key, state: nextState });
      if (res.success) {
        toast.success(`Feature flag '${key}' set to ${nextState.toUpperCase()}`);
        loadAllData();
      } else {
        toast.error(res.error || "Failed to toggle flag");
      }
    } catch (err: any) {
      toast.error(err.message || "Toggle error");
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await exportSettingsAction();
      if (res.success && res.data) {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dropshopnn-settings-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Settings exported successfully");
      } else {
        toast.error(res.error || "Failed to export settings");
      }
    } catch {
      toast.error("Export error");
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        const res = await importSettingsAction(parsed);
        if (res.success) {
          toast.success("Settings imported successfully");
          loadAllData();
        } else {
          toast.error(res.error || "Failed to import settings");
        }
      } catch {
        toast.error("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetCategory = async (cat: string) => {
    try {
      const res = await resetCategoryToDefaultAction(cat);
      if (res.success) {
        toast.success(`Category '${cat}' reset to default settings`);
        loadAllData();
      } else {
        toast.error(res.error || "Failed to reset category");
      }
    } catch (err: any) {
      toast.error(err.message || "Reset error");
    }
  };

  // Filter settings by search
  const filteredSettings = settingsList.filter(
    (s) =>
      s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getCategorySettings = (cat: string) => filteredSettings.filter((s) => s.category === cat);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Platform Configuration &amp; Settings
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/10 text-[10px] font-bold"
            >
              SETTINGS-CENTER-001
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-1">
            Single Source of Truth for Platform Configurations, Business Rules, Feature Flags, Maintenance &amp; System Health
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all settings..."
              className="pl-8 text-xs bg-background border-border text-foreground"
            />
          </div>
          <Button
            onClick={handleExportJSON}
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 font-bold"
          >
            <Download className="h-3.5 w-3.5 text-primary" /> Export JSON
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 font-bold"
          >
            <Upload className="h-3.5 w-3.5 text-sky-500" /> Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
          <Button
            onClick={loadAllData}
            size="sm"
            variant="ghost"
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Slider */}
      <div className="relative flex items-center border-b border-border pb-3 group">
        <button
          onClick={() => scrollTabs("left")}
          className="absolute left-0 z-10 p-1.5 rounded-full bg-card border border-border text-foreground hover:bg-muted shadow-xs transition-all"
          title="Scroll Left"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={tabSliderRef}
          className="flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-none px-8 text-xs w-full"
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Dashboard Summary
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "general"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-sky-500" /> General &amp; Branding
          </button>
          <button
            onClick={() => setActiveTab("business_rules")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "business_rules"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-amber-500" /> Business Rules
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "pricing"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Pricing &amp; Markup
          </button>
          <button
            onClick={() => setActiveTab("order_product")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "order_product"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Package className="h-3.5 w-3.5 text-purple-500" /> Order &amp; Product
          </button>
          <button
            onClick={() => setActiveTab("logistics_finance")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "logistics_finance"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-indigo-500" /> Logistics &amp; Finance
          </button>
          <button
            onClick={() => setActiveTab("security_access")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "security_access"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-rose-500" /> Security &amp; Policy
          </button>
          <button
            onClick={() => setActiveTab("feature_flags")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "feature_flags"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Flag className="h-3.5 w-3.5 text-amber-500" /> Feature Flags ({flagsList.length})
          </button>
          <button
            onClick={() => setActiveTab("system_health")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "system_health"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Server className="h-3.5 w-3.5 text-emerald-500" /> System Health
          </button>
          <button
            onClick={() => setActiveTab("history_audit")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === "history_audit"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <History className="h-3.5 w-3.5 text-muted-foreground" /> Configuration History
          </button>
        </div>

        <button
          onClick={() => scrollTabs("right")}
          className="absolute right-0 z-10 p-1.5 rounded-full bg-card border border-border text-foreground hover:bg-muted shadow-xs transition-all"
          title="Scroll Right"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Platform Status</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg sm:text-xl font-black text-emerald-500">OPERATIONAL</p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Registered Settings</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg sm:text-xl font-black text-foreground">{settingsList.length}</p>
                  <Sliders className="h-4 w-4 text-sky-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Centralized Flags</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg sm:text-xl font-black text-amber-500">{flagsList.length}</p>
                  <Flag className="h-4 w-4 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Database Engine</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg sm:text-xl font-black text-emerald-500">MongoDB Connected</p>
                  <Database className="h-4 w-4 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-sm font-black text-foreground">
                All Platform Settings Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/40 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-muted-foreground">Category</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Setting Key</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Setting Name</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Current Value</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSettings.slice(0, 15).map((s) => (
                    <TableRow key={s.key} className="border-border/60 hover:bg-muted/40">
                      <TableCell className="text-xs capitalize font-bold text-sky-600 dark:text-sky-400">
                        {s.category}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{s.key}</TableCell>
                      <TableCell className="text-xs font-extrabold text-foreground">{s.name}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
                        {String(s.value)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="capitalize font-bold border-border text-foreground">
                          {s.scope}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: GENERAL & BRANDING */}
      {activeTab === "general" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-sky-500" /> General &amp; Branding Configuration
            </CardTitle>
            <Button
              onClick={() => handleResetCategory("general")}
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset General
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {getCategorySettings("general")
              .concat(getCategorySettings("branding"))
              .map((s) => (
                <div
                  key={s.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/70">{s.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                      onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                      className="h-8 text-xs bg-background border-border w-48 sm:w-64"
                    />
                    <Button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      size="sm"
                      className="h-8 text-xs font-bold shadow-xs"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: BUSINESS RULES */}
      {activeTab === "business_rules" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-500" /> Business Rule Engine Settings
            </CardTitle>
            <Button
              onClick={() => handleResetCategory("business_rules")}
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Rules
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {getCategorySettings("business_rules").map((s) => (
              <div
                key={s.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/70">{s.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type={s.dataType === "number" ? "number" : "text"}
                    value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [s.key]:
                          s.dataType === "number"
                            ? parseFloat(e.target.value) || 0
                            : e.target.value,
                      })
                    }
                    className="h-8 text-xs bg-background border-border w-48"
                  />
                  <Button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    size="sm"
                    className="h-8 text-xs font-bold shadow-xs"
                  >
                    Save Rule
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PRICING & MARKUP */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" /> Global Pricing &amp; Markup Defaults
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {getCategorySettings("pricing").map((s) => (
                <div
                  key={s.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/70">{s.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                      onChange={(e) =>
                        setEditValues({ ...editValues, [s.key]: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 text-xs bg-background border-border w-36"
                    />
                    <Button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      size="sm"
                      className="h-8 text-xs font-bold shadow-xs"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Pricing Engine Preview Card */}
          <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-2xs">
            <CardHeader className="border-b border-emerald-500/20 pb-3">
              <CardTitle className="text-sm font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Live Pricing Engine Calculator Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Formula: <span className="font-mono font-bold text-foreground">Selling Price = Cost Price + (Cost Price × Markup %)</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                  <p className="text-[11px] font-bold text-muted-foreground">Sample Cost Price (BDT)</p>
                  <p className="text-lg font-black text-foreground">৳ 750</p>
                  <p className="text-[10px] text-muted-foreground">Base product cost</p>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                  <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400">Retail Tier ({editValues["pricing.retail_markup_percent"] ?? 40}%)</p>
                  <p className="text-lg font-black text-sky-600 dark:text-sky-400">
                    ৳ {Math.round(750 * (1 + ((editValues["pricing.retail_markup_percent"] ?? 40) / 100)))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Profit: ৳ {Math.round(750 * ((editValues["pricing.retail_markup_percent"] ?? 40) / 100))}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Wholesale Tier ({editValues["pricing.wholesale_markup_percent"] ?? 30}%)</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    ৳ {Math.round(750 * (1 + ((editValues["pricing.wholesale_markup_percent"] ?? 30) / 100)))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Profit: ৳ {Math.round(750 * ((editValues["pricing.wholesale_markup_percent"] ?? 30) / 100))}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Reseller Base Tier ({editValues["pricing.reseller_markup_percent"] ?? 22}%)</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                    ৳ {Math.round(750 * (1 + ((editValues["pricing.reseller_markup_percent"] ?? 22) / 100)))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Profit: ৳ {Math.round(750 * ((editValues["pricing.reseller_markup_percent"] ?? 22) / 100))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: ORDER & PRODUCT */}
      {activeTab === "order_product" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" /> Order Engine &amp; Product Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {getCategorySettings("order")
              .concat(getCategorySettings("product"))
              .map((s) => (
                <div
                  key={s.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/70">{s.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof s.value === "boolean" ? (
                      <Switch
                        checked={Boolean(editValues[s.key])}
                        onCheckedChange={(chk) => {
                          setEditValues({ ...editValues, [s.key]: chk });
                          updateSettingAction({ key: s.key, value: chk }).then(loadAllData);
                        }}
                      />
                    ) : (
                      <>
                        <Input
                          value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                          onChange={(e) =>
                            setEditValues({ ...editValues, [s.key]: e.target.value })
                          }
                          className="h-8 text-xs bg-background border-border w-44"
                        />
                        <Button
                          onClick={() => handleSaveSetting(s.key)}
                          disabled={savingKey === s.key}
                          size="sm"
                          className="h-8 text-xs font-bold shadow-xs"
                        >
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 6: LOGISTICS & FINANCE */}
      {activeTab === "logistics_finance" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-500" /> Logistics Hub &amp; Finance Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {getCategorySettings("logistics")
              .concat(getCategorySettings("finance"))
              .map((s) => (
                <div
                  key={s.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/70">{s.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                      onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                      className="h-8 text-xs bg-background border-border w-44"
                    />
                    <Button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      size="sm"
                      className="h-8 text-xs font-bold shadow-xs"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 7: SECURITY & POLICY */}
      {activeTab === "security_access" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-500" /> Security, Policy &amp; Session Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {getCategorySettings("security").map((s) => (
              <div
                key={s.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/70">{s.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                    onChange={(e) =>
                      setEditValues({ ...editValues, [s.key]: parseInt(e.target.value) || 0 })
                    }
                    className="h-8 text-xs bg-background border-border w-36"
                  />
                  <Button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    size="sm"
                    className="h-8 text-xs font-bold shadow-xs"
                  >
                    Save Policy
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 8: FEATURE FLAGS */}
      {activeTab === "feature_flags" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Flag className="h-4 w-4 text-amber-500" /> Centralized Feature Flag Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/40 hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-muted-foreground">Flag Name</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Key</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Description</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">State</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground text-right">Toggle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagsList.map((f) => (
                  <TableRow key={f.key} className="border-border/60 hover:bg-muted/40">
                    <TableCell className="text-xs font-black text-foreground">{f.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{f.key}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-semibold">{f.description}</TableCell>
                    <TableCell className="text-xs">
                      <Badge
                        variant="outline"
                        className={`capitalize font-bold ${
                          f.state === "on"
                            ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            : f.state === "beta"
                              ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {f.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      <Switch
                        checked={f.state === "on" || f.state === "beta"}
                        onCheckedChange={() => handleToggleFlag(f.key, f.state)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 9: SYSTEM HEALTH */}
      {activeTab === "system_health" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-500" /> Platform System Health &amp; Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Database Engine (MongoDB)</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 capitalize">
                    {healthStatus?.database || "Healthy"}
                  </p>
                </div>
                <Database className="h-6 w-6 text-emerald-500" />
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">BullMQ &amp; Redis Queue</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 capitalize">
                    {healthStatus?.redis || "Healthy"}
                  </p>
                </div>
                <Zap className="h-6 w-6 text-amber-500" />
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Asset Storage (ImageKit)</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 capitalize">
                    {healthStatus?.storage || "Healthy"}
                  </p>
                </div>
                <HardDrive className="h-6 w-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 10: CONFIGURATION HISTORY */}
      {activeTab === "history_audit" && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-black text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" /> Configuration Change Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/40 hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Setting Key</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Old Value</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">New Value</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs font-semibold">
                      No setting mutations recorded in audit trail yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((a) => (
                    <TableRow key={a.id} className="border-border/60 hover:bg-muted/40">
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(a.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {a.settingKey}
                      </TableCell>
                      <TableCell className="text-xs capitalize font-semibold text-foreground">
                        {a.category}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-rose-600 dark:text-rose-400">
                        {String(a.oldValue ?? "N/A")}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {String(a.newValue)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-bold">
                        {a.changedBy}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SettingsCenterUI;
