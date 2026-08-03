"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  Globe,
  DollarSign,
  Package,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  Zap,
  Sliders,
  Flag,
  RotateCcw,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type MainTab = "general" | "contact" | "pricing" | "business" | "secrets" | "security";

export function SettingsCenterUI(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<MainTab>("general");
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [settingsList, setSettingsList] = React.useState<any[]>([]);
  const [flagsList, setFlagsList] = React.useState<any[]>([]);
  const [healthStatus, setHealthStatus] = React.useState<any>(null);

  // Editing state maps & Secret Visibility map
  const [editValues, setEditValues] = React.useState<Record<string, any>>({});
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});

  // Import file upload ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSettingsAction();
      if (res.success && res.data) {
        setSettingsList(res.data.settings);
        setFlagsList(res.data.flags);
        setHealthStatus(res.data.health);

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

  // Filter settings by search
  const filteredSettings = settingsList.filter(
    (s) =>
      s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getCategorySettings = (cats: string[]) => filteredSettings.filter((s) => cats.includes(s.category));

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              Platform Configuration & Settings
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              SYSTEM CONTROL
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Single source of truth for platform configurations, pricing markup, branding, and feature flags.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            onClick={handleExportJSON}
            size="sm"
            variant="outline"
            className="h-9 text-xs font-bold gap-1"
          >
            <Download className="h-3.5 w-3.5 text-amber-500" /> Export JSON
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="h-9 text-xs font-bold gap-1"
          >
            <Upload className="h-3.5 w-3.5 text-amber-500" /> Import JSON
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

      {/* 6 Clean Modern Navigation Pills & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "general"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Globe className="h-4 w-4" /> 🌐 General & Branding
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "contact"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            📞 Contact & Socials
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "pricing"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" /> 💲 Pricing & Markup
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("business")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "business"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" /> 📦 Business & Logistics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("secrets")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "secrets"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            🔑 API Keys & Secrets
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === "security"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Lock className="h-4 w-4" /> 🔒 Security & Flags
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search all settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-border bg-card"
          />
        </div>
      </div>

      {/* Main Settings Sections */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground gap-2">
          <Spinner size="sm" /> Loading platform configuration...
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: GENERAL & BRANDING */}
          {activeTab === "general" && (
            <Card className="rounded-3xl border-border bg-card">
              <CardHeader className="p-5 sm:p-6 border-b border-border/60">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-amber-500" /> General Platform & Branding Settings
                </CardTitle>
                <CardDescription className="text-xs">Company identity, platform titles, contact info, and branding assets</CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getCategorySettings(["general", "branding"]).map((s) => (
                    <div key={s.key} className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">{s.name}</label>
                        <Badge variant="outline" className="text-[9px] font-mono capitalize">
                          {s.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">{s.key}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          type="text"
                          value={editValues[s.key] ?? s.value ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                          className="h-9 text-xs font-mono rounded-xl bg-background"
                        />
                        <Button
                          size="sm"
                          disabled={savingKey === s.key}
                          onClick={() => handleSaveSetting(s.key)}
                          className="h-9 px-3 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs shrink-0"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: CONTACT & SOCIAL PROFILES */}
          {activeTab === "contact" && (
            <Card className="rounded-3xl border-border bg-card">
              <CardHeader className="p-5 sm:p-6 border-b border-border/60">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  📞 Public Business Contact & Social Profiles
                </CardTitle>
                <CardDescription className="text-xs">
                  Hotline, WhatsApp, support email, office address, and social media links
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSettings
                    .filter((s) => s.key.startsWith("contact.") || s.key.startsWith("social."))
                    .map((s) => (
                      <div key={s.key} className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">{s.name}</label>
                          <Badge variant="outline" className="text-[9px] font-mono capitalize">
                            {s.key.split(".")[0]}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">{s.key}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            type="text"
                            value={editValues[s.key] ?? s.value ?? ""}
                            onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                            className="h-9 text-xs font-mono rounded-xl bg-background"
                          />
                          <Button
                            size="sm"
                            disabled={savingKey === s.key}
                            onClick={() => handleSaveSetting(s.key)}
                            className="h-9 px-3 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs shrink-0"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: PRICING & MARKUP */}
          {activeTab === "pricing" && (
            <Card className="rounded-3xl border-border bg-card">
              <CardHeader className="p-5 sm:p-6 border-b border-border/60">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-500" /> Pricing Rules, Markup & Financial Limits
                </CardTitle>
                <CardDescription className="text-xs">Configure default reseller markup percent, minimum order amount, and tax rates</CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getCategorySettings(["pricing", "finance", "markup"]).map((s) => (
                    <div key={s.key} className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">{s.name}</label>
                        <Badge variant="outline" className="text-[9px] font-mono capitalize">
                          {s.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">{s.key}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          type="text"
                          value={editValues[s.key] ?? s.value ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                          className="h-9 text-xs font-mono rounded-xl bg-background"
                        />
                        <Button
                          size="sm"
                          disabled={savingKey === s.key}
                          onClick={() => handleSaveSetting(s.key)}
                          className="h-9 px-3 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs shrink-0"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: BUSINESS & LOGISTICS */}
          {activeTab === "business" && (
            <Card className="rounded-3xl border-border bg-card">
              <CardHeader className="p-5 sm:p-6 border-b border-border/60">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" /> Business Rules & Logistics Settings
                </CardTitle>
                <CardDescription className="text-xs">Weight units, free shipping thresholds, and inventory rules</CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getCategorySettings(["business_rules", "logistics"]).map((s) => (
                    <div key={s.key} className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">{s.name}</label>
                        <Badge variant="outline" className="text-[9px] font-mono capitalize">
                          {s.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">{s.key}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          type="text"
                          value={editValues[s.key] ?? s.value ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                          className="h-9 text-xs font-mono rounded-xl bg-background"
                        />
                        <Button
                          size="sm"
                          disabled={savingKey === s.key}
                          onClick={() => handleSaveSetting(s.key)}
                          className="h-9 px-3 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs shrink-0"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: SECRETS & INTEGRATION KEYS */}
          {activeTab === "secrets" && (
            <div className="space-y-6">
              <Card className="rounded-3xl border-border bg-card">
                <CardHeader className="p-5 sm:p-6 border-b border-border/60">
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    🔑 Environment Secrets & Storage Keys ({filteredSettings.filter((s) => s.category === "courier" || s.category === "storage" || s.key.startsWith("storage.")).length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure Steadfast Courier API keys and ImageKit CDN credentials directly. Secrets are masked in UI and encrypted in database.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-6">
                  {filteredSettings.filter((s) => s.category === "courier" || s.category === "storage" || s.key.startsWith("storage.")).length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No secret entries found. Click <strong className="text-amber-500">Refresh</strong> above to load defaults.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSettings
                        .filter((s) => s.category === "courier" || s.category === "storage" || s.key.startsWith("storage."))
                        .map((s) => {
                          const isVisible = showSecrets[s.key] ?? false;
                          return (
                            <div
                              key={s.key}
                              className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2 hover:border-amber-500/40 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-xs font-extrabold text-foreground truncate">
                                  {s.name}
                                </label>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] font-mono capitalize bg-amber-500/10 text-amber-600 border-amber-500/30 shrink-0"
                                >
                                  {s.category}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{s.key}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight">{s.description}</p>
                              <div className="flex items-center gap-2 pt-1">
                                <div className="relative flex-1">
                                  <Input
                                    type={isVisible ? "text" : "password"}
                                    placeholder={s.defaultValue ? String(s.defaultValue) : "Enter value..."}
                                    value={editValues[s.key] ?? s.value ?? ""}
                                    onChange={(e) =>
                                      setEditValues({ ...editValues, [s.key]: e.target.value })
                                    }
                                    className="h-9 text-xs font-mono rounded-xl bg-background pr-9"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowSecrets((prev) => ({ ...prev, [s.key]: !prev[s.key] }))
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
                                    title={isVisible ? "Hide Secret" : "Show Secret"}
                                  >
                                    {isVisible ? "👁️" : "🔒"}
                                  </button>
                                </div>
                                <Button
                                  size="sm"
                                  disabled={savingKey === s.key}
                                  onClick={() => handleSaveSetting(s.key)}
                                  className="h-9 px-3 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs shrink-0"
                                >
                                  {savingKey === s.key ? <Spinner size="sm" /> : "Save"}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: SECURITY & FEATURE FLAGS */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Security & System Settings */}
              <Card className="rounded-3xl border-border bg-card">
                <CardHeader className="p-5 sm:p-6 border-b border-border/60">
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-500" /> Security & Policy Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getCategorySettings(["security"]).map((s) => (
                      <div key={s.key} className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">{s.name}</label>
                          <Badge variant="outline" className="text-[9px] font-mono capitalize">
                            security
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">{s.key}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            type="text"
                            value={editValues[s.key] ?? s.value ?? ""}
                            onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                            className="h-9 text-xs font-mono rounded-xl bg-background"
                          />
                          <Button
                            size="sm"
                            disabled={savingKey === s.key}
                            onClick={() => handleSaveSetting(s.key)}
                            className="h-9 px-3 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs shrink-0"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Centralized Feature Flags */}
              <Card className="rounded-3xl border-border bg-card">
                <CardHeader className="p-5 sm:p-6 border-b border-border/60">
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <Flag className="h-5 w-5 text-amber-500" /> Centralized System Feature Flags ({flagsList.length})
                  </CardTitle>
                  <CardDescription className="text-xs">Toggle system capabilities, maintenance mode, and reseller onboarding</CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {flagsList.map((f) => (
                      <div key={f.key} className="rounded-2xl border border-border/70 bg-muted/20 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-foreground">{f.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{f.key}</p>
                        </div>
                        <Switch
                          checked={f.state === "on"}
                          onCheckedChange={() => handleToggleFlag(f.key, f.state)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
