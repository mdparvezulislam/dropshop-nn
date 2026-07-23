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
  Settings,
  Shield,
  Sliders,
  Database,
  Globe,
  Palette,
  Scale,
  DollarSign,
  Package,
  Truck,
  Bell,
  Lock,
  Flag,
  Wrench,
  HardDrive,
  Mail,
  Activity,
  History,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
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
    } catch (err: any) {
      toast.error(err.message || "Error loading settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveSetting = async (key: string) => {
    const value = editValues[key];
    setSavingKey(key);
    try {
      const res = await updateSettingAction({ key, value });
      if (res.success) {
        toast.success(`Setting [${key}] updated successfully`);
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
        toast.success(`Feature Flag [${key}] set to ${nextState.toUpperCase()}`);
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
        const link = document.createElement("a");
        link.href = url;
        link.download = `dropshop_platform_config_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Platform configuration exported to JSON backup file");
      } else {
        toast.error(res.error || "Export failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Export error");
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const payload = JSON.parse(evt.target?.result as string);
        const res = await importSettingsAction({ payload });
        if (res.success) {
          toast.success(`Import finished: ${res.data.importedSettings} settings & ${res.data.importedFlags} flags restored`);
          loadAllData();
        } else {
          toast.error(res.error || "Import failed");
        }
      } catch (err: any) {
        toast.error("Invalid JSON configuration backup file");
      }
    };
    reader.readAsText(file);
  };

  const handleResetCategory = async (cat: string) => {
    try {
      const res = await resetCategoryToDefaultAction(cat);
      if (res.success) {
        toast.success(`Category [${cat}] settings reset to default`);
        loadAllData();
      } else {
        toast.error(res.error || "Reset failed");
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
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Platform Configuration & Business Rules Center</h1>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-[10px]">
              SETTINGS-CENTER-001
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Single Source of Truth for Platform Configurations, Business Rules, Feature Flags, Maintenance & System Health
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all settings..."
              className="pl-8 text-xs bg-slate-900 border-slate-800"
            />
          </div>
          <Button onClick={handleExportJSON} size="sm" variant="outline" className="border-slate-800 text-xs bg-slate-900 gap-1.5">
            <Download className="h-3.5 w-3.5 text-emerald-400" /> Export JSON
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline" className="border-slate-800 text-xs bg-slate-900 gap-1.5">
            <Upload className="h-3.5 w-3.5 text-sky-400" /> Import JSON
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          <Button onClick={loadAllData} size="sm" variant="ghost" disabled={loading} className="text-slate-400 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Slider */}
      <div className="relative flex items-center border-b border-slate-800 pb-2 group">
        <button
          onClick={() => scrollTabs("left")}
          className="absolute left-0 z-10 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-md backdrop-blur transition-all"
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "overview" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Dashboard Summary
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "general" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-sky-400" /> General & Branding
          </button>
          <button
            onClick={() => setActiveTab("business_rules")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "business_rules" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Business Rules
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "pricing" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Pricing & Markup
          </button>
          <button
            onClick={() => setActiveTab("order_product")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "order_product" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Package className="h-3.5 w-3.5 text-purple-400" /> Order & Product
          </button>
          <button
            onClick={() => setActiveTab("logistics_finance")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "logistics_finance" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-indigo-400" /> Logistics & Finance
          </button>
          <button
            onClick={() => setActiveTab("security_access")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "security_access" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-rose-400" /> Security & Policy
          </button>
          <button
            onClick={() => setActiveTab("feature_flags")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "feature_flags" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Flag className="h-3.5 w-3.5 text-yellow-400" /> Feature Flags ({flagsList.length})
          </button>
          <button
            onClick={() => setActiveTab("system_health")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "system_health" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Server className="h-3.5 w-3.5 text-emerald-400" /> System Health
          </button>
          <button
            onClick={() => setActiveTab("history_audit")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "history_audit" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5 text-slate-300" /> Configuration History
          </button>
        </div>

        <button
          onClick={() => scrollTabs("right")}
          className="absolute right-0 z-10 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-md backdrop-blur transition-all"
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
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Platform Status</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-emerald-400">OPERATIONAL</p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Registered Settings</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-white">{settingsList.length}</p>
                  <Sliders className="h-4 w-4 text-sky-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Centralized Flags</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-amber-400">{flagsList.length}</p>
                  <Flag className="h-4 w-4 text-amber-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Database Engine</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-emerald-400">MongoDB Connected</p>
                  <Database className="h-4 w-4 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">All Platform Settings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Setting Key</TableHead>
                    <TableHead className="text-xs">Setting Name</TableHead>
                    <TableHead className="text-xs">Current Value</TableHead>
                    <TableHead className="text-xs">Scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSettings.slice(0, 15).map((s) => (
                    <TableRow key={s.key} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs capitalize font-medium text-sky-400">{s.category}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-400">{s.key}</TableCell>
                      <TableCell className="text-xs font-semibold text-white">{s.name}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-emerald-400">{String(s.value)}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="capitalize border-slate-700">{s.scope}</Badge>
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
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-sky-400" /> General & Branding Configuration
            </CardTitle>
            <Button onClick={() => handleResetCategory("general")} size="sm" variant="outline" className="text-xs border-slate-800 text-slate-300">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset General
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {getCategorySettings("general").concat(getCategorySettings("branding")).map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">{s.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                    onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                    className="h-8 text-xs bg-slate-900 border-slate-700 w-48 sm:w-64"
                  />
                  <Button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500"
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
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-400" /> Business Rule Engine Settings
            </CardTitle>
            <Button onClick={() => handleResetCategory("business_rules")} size="sm" variant="outline" className="text-xs border-slate-800 text-slate-300">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Rules
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {getCategorySettings("business_rules").map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">{s.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type={s.dataType === "number" ? "number" : "text"}
                    value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                    onChange={(e) => setEditValues({ ...editValues, [s.key]: s.dataType === "number" ? parseFloat(e.target.value) || 0 : e.target.value })}
                    className="h-8 text-xs bg-slate-900 border-slate-700 w-48"
                  />
                  <Button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500"
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
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Global Pricing & Markup Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getCategorySettings("pricing").map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">{s.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                    onChange={(e) => setEditValues({ ...editValues, [s.key]: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs bg-slate-900 border-slate-700 w-36"
                  />
                  <Button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500"
                  >
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: ORDER & PRODUCT */}
      {activeTab === "order_product" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-400" /> Order Engine & Product Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getCategorySettings("order").concat(getCategorySettings("product")).map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">{s.key}</p>
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
                        onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                        className="h-8 text-xs bg-slate-900 border-slate-700 w-44"
                      />
                      <Button
                        onClick={() => handleSaveSetting(s.key)}
                        disabled={savingKey === s.key}
                        size="sm"
                        className="h-8 text-xs bg-purple-600 hover:bg-purple-500"
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
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-400" /> Logistics Hub & Finance Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getCategorySettings("logistics").concat(getCategorySettings("finance")).map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">{s.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                    onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                    className="h-8 text-xs bg-slate-900 border-slate-700 w-44"
                  />
                  <Button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    size="sm"
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500"
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
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-400" /> Security, Policy & Session Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getCategorySettings("security").map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">{s.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editValues[s.key] !== undefined ? String(editValues[s.key]) : ""}
                    onChange={(e) => setEditValues({ ...editValues, [s.key]: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs bg-slate-900 border-slate-700 w-36"
                  />
                  <Button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    size="sm"
                    className="h-8 text-xs bg-rose-600 hover:bg-rose-500"
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
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Flag className="h-4 w-4 text-yellow-400" /> Centralized Feature Flag Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Flag Name</TableHead>
                  <TableHead className="text-xs">Key</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">State</TableHead>
                  <TableHead className="text-xs text-right">Toggle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagsList.map((f) => (
                  <TableRow key={f.key} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-xs font-semibold text-white">{f.name}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">{f.key}</TableCell>
                    <TableCell className="text-xs text-slate-300">{f.description}</TableCell>
                    <TableCell className="text-xs">
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          f.state === "on"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/30"
                            : f.state === "beta"
                            ? "border-yellow-500/40 text-yellow-400 bg-yellow-950/30"
                            : "border-slate-700 text-slate-400"
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
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" /> Platform System Health & Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Database Engine (MongoDB)</p>
                  <p className="text-lg font-bold text-emerald-400 capitalize">{healthStatus?.database || "Healthy"}</p>
                </div>
                <Database className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">BullMQ & Redis Queue</p>
                  <p className="text-lg font-bold text-emerald-400 capitalize">{healthStatus?.redis || "Healthy"}</p>
                </div>
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Asset Storage (ImageKit)</p>
                  <p className="text-lg font-bold text-emerald-400 capitalize">{healthStatus?.storage || "Healthy"}</p>
                </div>
                <HardDrive className="h-6 w-6 text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 10: CONFIGURATION HISTORY */}
      {activeTab === "history_audit" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-slate-300" /> Configuration Change Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Setting Key</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Old Value</TableHead>
                  <TableHead className="text-xs">New Value</TableHead>
                  <TableHead className="text-xs">Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                      No setting mutations recorded in audit trail yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((a) => (
                    <TableRow key={a.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-indigo-400">{a.settingKey}</TableCell>
                      <TableCell className="text-xs capitalize text-slate-300">{a.category}</TableCell>
                      <TableCell className="text-xs font-mono text-rose-400">{String(a.oldValue ?? "N/A")}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-emerald-400">{String(a.newValue)}</TableCell>
                      <TableCell className="text-xs text-slate-300 font-medium">{a.changedBy}</TableCell>
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
