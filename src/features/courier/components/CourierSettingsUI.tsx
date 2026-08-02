"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  getCourierSettingsDashboardAction,
  saveSteadfastSettingsAction,
  savePathaoSettingsAction,
  generatePathaoTokenAction,
  refreshPathaoTokenAction,
  fetchPathaoStoresAction,
  saveGlobalShippingDefaultsAction,
  getCourierApiLogsAction,
} from "../actions/courier-settings-actions";
import {
  testCourierConnectionAction,
  listPickupAddressesAction,
} from "../actions/courier-actions";
import { toast } from "sonner";
import {
  Truck,
  Zap,
  Key,
  Lock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Sliders,
  Store,
  Layers,
  ShieldCheck,
  Globe,
  Settings,
  Building,
  ExternalLink,
} from "lucide-react";

type MainTab = "steadfast" | "rules" | "pathao";

export function CourierSettingsUI(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<MainTab>("steadfast");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [pickupAddresses, setPickupAddresses] = React.useState<any[]>([]);
  const [pathaoStores, setPathaoStores] = React.useState<any[]>([]);

  // Steadfast Form State
  const [stEnabled, setStEnabled] = React.useState(true);
  const [stSandbox, setStSandbox] = React.useState(false);
  const [stBaseUrl, setStBaseUrl] = React.useState("https://portal.steadfast.com.bd/api/v1");
  const [stApiKey, setStApiKey] = React.useState("");
  const [stApiSecret, setStApiSecret] = React.useState("");
  const [stMerchantId, setStMerchantId] = React.useState("");
  const [stPickupId, setStPickupId] = React.useState("");
  const [stWeight, setStWeight] = React.useState(500);

  // Pathao Form State
  const [paEnabled, setPaEnabled] = React.useState(false);
  const [paSandbox, setPaSandbox] = React.useState(true);
  const [paBaseUrl, setPaBaseUrl] = React.useState("https://api-hermes.pathao.com");
  const [paClientId, setPaClientId] = React.useState("");
  const [paClientSecret, setPaClientSecret] = React.useState("");
  const [paUsername, setPaUsername] = React.useState("");
  const [paPassword, setPaPassword] = React.useState("");
  const [paStoreId, setPaStoreId] = React.useState("");
  const [paPickupId, setPaPickupId] = React.useState("");
  const [paWeight, setPaWeight] = React.useState(500);

  // Global Rules Form State
  const [defaultCourier, setDefaultCourier] = React.useState("steadfast");
  const [autoBookConfirm, setAutoBookConfirm] = React.useState(false);
  const [autoBookPayment, setAutoBookPayment] = React.useState(false);
  const [applyReseller, setApplyReseller] = React.useState(true);
  const [applyWholesale, setApplyWholesale] = React.useState(true);
  const [applyRetail, setApplyRetail] = React.useState(true);

  // Action loaders
  const [submittingAction, setSubmittingAction] = React.useState(false);
  const [testingSteadfast, setTestingSteadfast] = React.useState(false);
  const [testingPathao, setTestingPathao] = React.useState(false);

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCourierSettingsDashboardAction();
      if (res.success && res.data) {
        setData(res.data);
        const st = res.data.steadfast;
        if (st) {
          setStEnabled(st.enabled ?? true);
          setStSandbox(st.isSandbox ?? false);
          setStBaseUrl(st.apiBaseUrl || "https://portal.steadfast.com.bd/api/v1");
          setStApiKey(st.apiKey || "");
          setStApiSecret(st.apiSecret || "");
          setStMerchantId(st.merchantId || "");
          setStPickupId(st.pickupAddressId || "");
          setStWeight(st.defaultWeight || 500);
        }

        const pa = res.data.pathao;
        if (pa) {
          setPaEnabled(pa.enabled ?? false);
          setPaSandbox(pa.isSandbox ?? true);
          setPaBaseUrl(pa.apiBaseUrl || "https://api-hermes.pathao.com");
          setPaClientId(pa.pathaoConfig?.clientId || pa.apiKey || "");
          setPaClientSecret(pa.pathaoConfig?.clientSecret || pa.apiSecret || "");
          setPaUsername(pa.pathaoConfig?.username || "");
          setPaPassword(pa.pathaoConfig?.password || "");
          setPaStoreId(pa.pathaoConfig?.storeId || "");
          setPaPickupId(pa.pickupAddressId || "");
          setPaWeight(pa.defaultWeight || 500);
        }

        const rules = res.data.globalRules;
        if (rules) {
          setDefaultCourier(rules.defaultCourier || "steadfast");
          if (rules.autoBookingRules) {
            setAutoBookConfirm(rules.autoBookingRules.autoBookOnConfirm ?? false);
            setAutoBookPayment(rules.autoBookingRules.autoBookOnPayment ?? false);
            setApplyReseller(rules.autoBookingRules.applyReseller ?? true);
            setApplyWholesale(rules.autoBookingRules.applyWholesale ?? true);
            setApplyRetail(rules.autoBookingRules.applyRetail ?? true);
          }
        }
      }

      const addrRes = await listPickupAddressesAction();
      if (addrRes.success && addrRes.data) setPickupAddresses(addrRes.data);
    } catch {
      toast.error("Failed to load courier integration settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveSteadfast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stApiKey) {
      toast.error("Steadfast API Key is required");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await saveSteadfastSettingsAction({
        enabled: stEnabled,
        isSandbox: stSandbox,
        apiBaseUrl: stBaseUrl,
        apiKey: stApiKey,
        apiSecret: stApiSecret,
        merchantId: stMerchantId,
        pickupAddressId: stPickupId,
        defaultWeight: stWeight,
      });
      if (res.success) {
        toast.success("Steadfast Courier configuration saved!");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to save Steadfast settings");
      }
    } catch (err: any) {
      toast.error(err.message || "Save error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSavePathao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paClientId || !paClientSecret || !paUsername || !paPassword) {
      toast.error("Please fill in Client ID, Client Secret, Username, and Password");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await savePathaoSettingsAction({
        enabled: paEnabled,
        isSandbox: paSandbox,
        apiBaseUrl: paBaseUrl,
        clientId: paClientId,
        clientSecret: paClientSecret,
        username: paUsername,
        password: paPassword,
        storeId: paStoreId,
        pickupAddressId: paPickupId,
        defaultWeight: paWeight,
      });
      if (res.success) {
        toast.success("Pathao Courier configuration saved!");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to save Pathao settings");
      }
    } catch (err: any) {
      toast.error(err.message || "Save error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleGeneratePathaoToken = async () => {
    if (!paClientId || !paClientSecret || !paUsername || !paPassword) {
      toast.error("Credentials missing. Save Pathao settings first.");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await generatePathaoTokenAction({
        clientId: paClientId,
        clientSecret: paClientSecret,
        username: paUsername,
        password: paPassword,
        apiBaseUrl: paBaseUrl,
      });
      if (res.success) {
        toast.success("Pathao OAuth2 Access Token generated!");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to generate Pathao token");
      }
    } catch (err: any) {
      toast.error(err.message || "Token error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleTestSteadfastConnection = async () => {
    setTestingSteadfast(true);
    try {
      const res = await testCourierConnectionAction("steadfast");
      if (res.success) {
        toast.success("Steadfast API connection test PASSED!");
        loadAllData();
      } else {
        toast.error(res.error || "Steadfast connection test failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection test error");
    } finally {
      setTestingSteadfast(false);
    }
  };

  const handleTestPathaoConnection = async () => {
    setTestingPathao(true);
    try {
      const res = await testCourierConnectionAction("pathao");
      if (res.success) {
        toast.success("Pathao API connection test PASSED!");
        loadAllData();
      } else {
        toast.error(res.error || "Pathao connection test failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection test error");
    } finally {
      setTestingPathao(false);
    }
  };

  const handleSaveGlobalRules = async () => {
    setSubmittingAction(true);
    try {
      const res = await saveGlobalShippingDefaultsAction({
        defaultCourier,
        autoBookingRules: {
          autoBookOnConfirm: autoBookConfirm,
          autoBookOnPayment: autoBookPayment,
          applyReseller,
          applyWholesale,
          applyRetail,
        },
      });
      if (res.success) {
        toast.success("Global shipping & auto-booking rules saved!");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to save rules");
      }
    } catch (err: any) {
      toast.error(err.message || "Save rules error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const isSteadfastConfigured = Boolean(stApiKey && stApiSecret);
  const pathaoToken = data?.pathao?.pathaoConfig?.accessToken;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              Courier Setup & Integration
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              STEADFAST DIRECT
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure Steadfast Courier API credentials, pickup locations, and 1-click dispatch rules.
          </p>
        </div>

        <Button
          onClick={loadAllData}
          size="sm"
          variant="outline"
          disabled={loading}
          className="h-9 gap-1.5 text-xs font-bold shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Setup
        </Button>
      </div>

      {/* 3 Main Modern Tab Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("steadfast")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "steadfast"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Truck className="h-4 w-4" /> ⚡ Steadfast Courier
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
          <Sliders className="h-4 w-4" /> 📦 Dispatch Rules & Auto-Booking
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pathao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "pathao"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Globe className="h-4 w-4" /> 🛵 Pathao Courier
        </button>
      </div>

      {/* TAB 1: STEADFAST COURIER */}
      {activeTab === "steadfast" && (
        <div className="space-y-6">
          {/* Steadfast Status & Connection Card */}
          <Card className="rounded-3xl border-border">
            <CardHeader className="p-5 sm:p-6 border-b border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold">Steadfast Courier API Status</CardTitle>
                    <CardDescription className="text-xs">Primary delivery courier partner in Bangladesh</CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${
                      isSteadfastConfigured
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                    }`}
                  >
                    {isSteadfastConfigured ? "Ready for Dispatch" : "Missing API Keys"}
                  </Badge>

                  <Button
                    size="sm"
                    className="h-8 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-1"
                    onClick={handleTestSteadfastConnection}
                    disabled={testingSteadfast || !isSteadfastConfigured}
                  >
                    <Zap className="h-3.5 w-3.5 text-slate-950" /> Test Connection
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <form onSubmit={handleSaveSteadfast} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-foreground">Enable Steadfast Integration</p>
                      <p className="text-[11px] text-muted-foreground">Allow 1-click pickup requests to Steadfast</p>
                    </div>
                    <Switch checked={stEnabled} onCheckedChange={setStEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-foreground">Sandbox Test Mode</p>
                      <p className="text-[11px] text-muted-foreground">Use Steadfast sandbox environment</p>
                    </div>
                    <Switch checked={stSandbox} onCheckedChange={setStSandbox} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">API Key (App Key)</label>
                    <Input
                      type="text"
                      placeholder="e.g. st_key_xxxxxxx"
                      value={stApiKey}
                      onChange={(e) => setStApiKey(e.target.value)}
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Secret Key (App Secret)</label>
                    <Input
                      type="password"
                      placeholder="e.g. st_secret_xxxxxxx"
                      value={stApiSecret}
                      onChange={(e) => setStApiSecret(e.target.value)}
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Merchant ID / Code (Optional)</label>
                    <Input
                      type="text"
                      placeholder="e.g. 10452"
                      value={stMerchantId}
                      onChange={(e) => setStMerchantId(e.target.value)}
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Steadfast API Base URL</label>
                    <Input
                      type="text"
                      value={stBaseUrl}
                      onChange={(e) => setStBaseUrl(e.target.value)}
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={submittingAction}
                    className="h-10 px-6 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs"
                  >
                    Save Steadfast Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Steadfast Webhook Listener Information */}
          <Card className="rounded-3xl border-border bg-muted/20">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-500" /> Steadfast Webhook Status Listener
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              <p className="text-muted-foreground">
                Copy this Webhook URL and paste it into your Steadfast Merchant Portal under API Webhook Settings:
              </p>
              <div className="p-3 bg-card border border-border rounded-xl font-mono text-[11px] text-amber-600 dark:text-amber-400 select-all font-bold">
                https://dropshop-nn.com/api/webhooks/courier/steadfast
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: DISPATCH RULES & AUTO-BOOKING */}
      {activeTab === "rules" && (
        <Card className="rounded-3xl border-border">
          <CardHeader className="p-5 sm:p-6 border-b border-border/60">
            <CardTitle className="text-base font-extrabold">Dispatch & Auto-Booking Rules</CardTitle>
            <CardDescription className="text-xs">Set up automatic courier pickup rules for orders</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Default Pickup Courier</label>
                <select
                  value={defaultCourier}
                  onChange={(e) => setDefaultCourier(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-input bg-background font-bold"
                >
                  <option value="steadfast">⚡ Steadfast Courier (Recommended)</option>
                  <option value="pathao">🛵 Pathao Courier</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Auto-Book on Order Confirm</p>
                    <p className="text-[11px] text-muted-foreground">Request pickup when status changes to Confirmed</p>
                  </div>
                  <Switch checked={autoBookConfirm} onCheckedChange={setAutoBookConfirm} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Auto-Book on Payment Paid</p>
                    <p className="text-[11px] text-muted-foreground">Request pickup when advance payment is cleared</p>
                  </div>
                  <Switch checked={autoBookPayment} onCheckedChange={setAutoBookPayment} />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-extrabold text-foreground">Applicable Order Channels</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyReseller}
                      onChange={(e) => setApplyReseller(e.target.checked)}
                      className="rounded border-input text-amber-500"
                    />
                    Reseller Orders
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyWholesale}
                      onChange={(e) => setApplyWholesale(e.target.checked)}
                      className="rounded border-input text-amber-500"
                    />
                    Wholesale Orders
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyRetail}
                      onChange={(e) => setApplyRetail(e.target.checked)}
                      className="rounded border-input text-amber-500"
                    />
                    Retail Orders
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/60">
              <Button
                onClick={handleSaveGlobalRules}
                disabled={submittingAction}
                className="h-10 px-6 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs"
              >
                Save Dispatch Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PATHAO COURIER */}
      {activeTab === "pathao" && (
        <Card className="rounded-3xl border-border">
          <CardHeader className="p-5 sm:p-6 border-b border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-extrabold">Pathao Courier Setup</CardTitle>
                <CardDescription className="text-xs">Optional secondary courier integration</CardDescription>
              </div>

              <Button
                size="sm"
                className="h-8 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 gap-1"
                onClick={handleTestPathaoConnection}
                disabled={testingPathao}
              >
                <Zap className="h-3.5 w-3.5 text-slate-950" /> Test Connection
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSavePathao} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Enable Pathao Integration</p>
                    <p className="text-[11px] text-muted-foreground">Allow Pathao courier bookings</p>
                  </div>
                  <Switch checked={paEnabled} onCheckedChange={setPaEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Sandbox Mode</p>
                    <p className="text-[11px] text-muted-foreground">Use Pathao sandbox API</p>
                  </div>
                  <Switch checked={paSandbox} onCheckedChange={setPaSandbox} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Client ID</label>
                  <Input
                    type="text"
                    value={paClientId}
                    onChange={(e) => setPaClientId(e.target.value)}
                    className="h-10 text-xs font-mono rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Client Secret</label>
                  <Input
                    type="password"
                    value={paClientSecret}
                    onChange={(e) => setPaClientSecret(e.target.value)}
                    className="h-10 text-xs font-mono rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Pathao Registered Email / Username</label>
                  <Input
                    type="text"
                    value={paUsername}
                    onChange={(e) => setPaUsername(e.target.value)}
                    className="h-10 text-xs font-mono rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Pathao Password</label>
                  <Input
                    type="password"
                    value={paPassword}
                    onChange={(e) => setPaPassword(e.target.value)}
                    className="h-10 text-xs font-mono rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleGeneratePathaoToken}
                  disabled={submittingAction}
                  variant="outline"
                  className="h-10 text-xs font-bold"
                >
                  <Key className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Generate Access Token
                </Button>

                <Button
                  type="submit"
                  disabled={submittingAction}
                  className="h-10 px-6 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs"
                >
                  Save Pathao Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
