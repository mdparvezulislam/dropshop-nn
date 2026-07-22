"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
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
  createPickupAddressAction,
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
  Building,
  MapPin,
  Sliders,
  Activity,
  History,
  Store,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
  Settings,
  PlusCircle,
} from "lucide-react";

export function CourierSettingsUI(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<
    | "dashboard"
    | "steadfast_config"
    | "steadfast_mapping"
    | "pathao_config"
    | "pathao_tokens"
    | "pathao_mapping"
    | "pickup_locations"
    | "global_rules"
    | "api_logs"
  >("dashboard");

  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [pickupAddresses, setPickupAddresses] = React.useState<any[]>([]);
  const [pathaoStores, setPathaoStores] = React.useState<any[]>([]);
  const [apiLogs, setApiLogs] = React.useState<any[]>([]);
  const [fetchingStores, setFetchingStores] = React.useState(false);

  // Tab Slider ref
  const tabSliderRef = React.useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: "left" | "right") => {
    if (tabSliderRef.current) {
      tabSliderRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  // Steadfast Form State
  const [stEnabled, setStEnabled] = React.useState(false);
  const [stSandbox, setStSandbox] = React.useState(true);
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
          setStEnabled(st.enabled ?? false);
          setStSandbox(st.isSandbox ?? true);
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
      }

      const addrRes = await listPickupAddressesAction();
      if (addrRes.success && addrRes.data) setPickupAddresses(addrRes.data);

      const logsRes = await getCourierApiLogsAction("all", "all");
      if (logsRes.success && logsRes.data) setApiLogs(logsRes.data);
    } catch (err: any) {
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
      toast.error("Credentials missing. Please save Client ID, Client Secret, Username & Password first.");
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
        toast.success("Pathao OAuth2 Access Token generated successfully!");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to generate Pathao token");
      }
    } catch (err: any) {
      toast.error(err.message || "Token generation error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRefreshPathaoToken = async () => {
    setSubmittingAction(true);
    try {
      const res = await refreshPathaoTokenAction();
      if (res.success) {
        toast.success("Pathao OAuth2 token refreshed!");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to refresh token");
      }
    } catch (err: any) {
      toast.error(err.message || "Token refresh error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleFetchPathaoStores = async () => {
    setFetchingStores(true);
    try {
      const res = await fetchPathaoStoresAction();
      if (res.success && res.data) {
        setPathaoStores(res.data);
        toast.success(`Fetched ${res.data.length} registered Pathao Store locations`);
      } else {
        toast.error(res.error || "Failed to fetch Pathao stores");
      }
    } catch (err: any) {
      toast.error(err.message || "Store fetch error");
    } finally {
      setFetchingStores(false);
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

  const pathaoToken = data?.pathao?.pathaoConfig?.accessToken;
  const pathaoTokenExpires = data?.pathao?.pathaoConfig?.tokenExpiresAt;

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Courier Integration Settings Center</h1>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-950/40 text-[10px]">
              STEADFAST & PATHAO
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dedicated Courier Integration Center: OAuth2 Tokens, Status Mapping, Webhooks, Pickup Locations & API Logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "dashboard" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Courier Dashboard
          </button>
          <button
            onClick={() => setActiveTab("steadfast_config")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "steadfast_config" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-cyan-400" /> Steadfast Configuration
          </button>
          <button
            onClick={() => setActiveTab("pathao_config")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "pathao_config" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-rose-400" /> Pathao Configuration
          </button>
          <button
            onClick={() => setActiveTab("pathao_tokens")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "pathao_tokens" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Key className="h-3.5 w-3.5 text-yellow-400" /> Pathao Token Manager
          </button>
          <button
            onClick={() => setActiveTab("pickup_locations")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "pickup_locations" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Building className="h-3.5 w-3.5 text-emerald-400" /> Shared Pickup Locations
          </button>
          <button
            onClick={() => setActiveTab("global_rules")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "global_rules" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-sky-400" /> Auto-Booking & Rules
          </button>
          <button
            onClick={() => setActiveTab("api_logs")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "api_logs" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5 text-slate-300" /> API Health & Logs
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

      {/* TAB 1: COURIER DASHBOARD OVERVIEW */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Steadfast Card */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-white">Steadfast Courier</CardTitle>
                  <Badge variant={stEnabled ? "success" : "outline"} className="text-[10px]">
                    {stEnabled ? "ENABLED" : "DISABLED"}
                  </Badge>
                  <Badge variant="warning" className="text-[10px]">
                    {stSandbox ? "SANDBOX" : "PRODUCTION"}
                  </Badge>
                </div>
                <Button onClick={handleTestSteadfastConnection} disabled={testingSteadfast} size="sm" variant="outline" className="text-xs h-7">
                  {testingSteadfast ? "Testing..." : "Test Connection"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Connection Status:</span>
                  <Badge variant={data?.steadfast?.connectionStatus === "connected" ? "success" : "destructive"}>
                    {data?.steadfast?.connectionStatus || "untested"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Today's Requests / Errors:</span>
                  <span className="font-semibold text-white">
                    {data?.steadfastHealth?.totalRequests || 0} / <span className="text-rose-400">{data?.steadfastHealth?.errorCount || 0}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Avg API Response Time:</span>
                  <span className="font-semibold text-emerald-400">{data?.steadfastHealth?.avgResponseTimeMs || 0} ms</span>
                </div>
              </CardContent>
            </Card>

            {/* Pathao Card */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-white">Pathao Courier</CardTitle>
                  <Badge variant={paEnabled ? "success" : "outline"} className="text-[10px]">
                    {paEnabled ? "ENABLED" : "DISABLED"}
                  </Badge>
                  <Badge variant="warning" className="text-[10px]">
                    {paSandbox ? "SANDBOX" : "PRODUCTION"}
                  </Badge>
                </div>
                <Button onClick={handleTestPathaoConnection} disabled={testingPathao} size="sm" variant="outline" className="text-xs h-7">
                  {testingPathao ? "Testing..." : "Test Connection"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">OAuth2 Access Token:</span>
                  <Badge variant={pathaoToken ? "success" : "destructive"}>
                    {pathaoToken ? "ACTIVE TOKEN" : "MISSING TOKEN"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Today's Requests / Errors:</span>
                  <span className="font-semibold text-white">
                    {data?.pathaoHealth?.totalRequests || 0} / <span className="text-rose-400">{data?.pathaoHealth?.errorCount || 0}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Avg API Response Time:</span>
                  <span className="font-semibold text-emerald-400">{data?.pathaoHealth?.avgResponseTimeMs || 0} ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: STEADFAST CONFIGURATION */}
      {activeTab === "steadfast_config" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-cyan-400" /> Dedicated Steadfast Courier Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSteadfast} className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">Enable Steadfast Integration</p>
                  <p className="text-[11px] text-slate-400">Allow booking and tracking via Steadfast Courier API</p>
                </div>
                <Switch checked={stEnabled} onCheckedChange={setStEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">Sandbox / Staging Mode</p>
                  <p className="text-[11px] text-slate-400">Use Steadfast sandbox environment for testing</p>
                </div>
                <Switch checked={stSandbox} onCheckedChange={setStSandbox} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">API Base URL *</label>
                <Input
                  value={stBaseUrl}
                  onChange={(e) => setStBaseUrl(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">API Key (App Key) *</label>
                  <Input
                    type="password"
                    value={stApiKey}
                    onChange={(e) => setStApiKey(e.target.value)}
                    placeholder="Steadfast API Key"
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">API Secret Key</label>
                  <Input
                    type="password"
                    value={stApiSecret}
                    onChange={(e) => setStApiSecret(e.target.value)}
                    placeholder="Steadfast Secret Key"
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Default Pickup Location</label>
                  <select
                    value={stPickupId}
                    onChange={(e) => setStPickupId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                  >
                    <option value="">Select Pickup Address</option>
                    {pickupAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.district}, {a.area})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Default Package Weight (grams)</label>
                  <Input
                    type="number"
                    value={stWeight}
                    onChange={(e) => setStWeight(parseInt(e.target.value) || 500)}
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={submittingAction} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
                  Save Steadfast Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PATHAO CONFIGURATION */}
      {activeTab === "pathao_config" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-rose-400" /> Dedicated Pathao Courier Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePathao} className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">Enable Pathao Integration</p>
                  <p className="text-[11px] text-slate-400">Allow booking and tracking via Pathao Courier API</p>
                </div>
                <Switch checked={paEnabled} onCheckedChange={setPaEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">Sandbox / Staging Mode</p>
                  <p className="text-[11px] text-slate-400">Use Pathao staging endpoint (`https://api-hermes.pathao.com`)</p>
                </div>
                <Switch checked={paSandbox} onCheckedChange={setPaSandbox} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Pathao API Base URL *</label>
                <Input
                  value={paBaseUrl}
                  onChange={(e) => setPaBaseUrl(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Client ID *</label>
                  <Input
                    type="password"
                    value={paClientId}
                    onChange={(e) => setPaClientId(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Client Secret *</label>
                  <Input
                    type="password"
                    value={paClientSecret}
                    onChange={(e) => setPaClientSecret(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Pathao Username / Email *</label>
                  <Input
                    value={paUsername}
                    onChange={(e) => setPaUsername(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Pathao Account Password *</label>
                  <Input
                    type="password"
                    value={paPassword}
                    onChange={(e) => setPaPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-300">Pathao Store ID (Pickup Location)</label>
                  <Input
                    value={paStoreId}
                    onChange={(e) => setPaStoreId(e.target.value)}
                    placeholder="Pathao Store ID"
                    className="bg-slate-950 border-slate-800 text-xs mt-1"
                  />
                </div>
                <Button onClick={handleFetchPathaoStores} disabled={fetchingStores} type="button" size="sm" variant="outline" className="mt-5 text-xs">
                  {fetchingStores ? "Fetching..." : "Fetch Stores"}
                </Button>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={submittingAction} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
                  Save Pathao Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PATHAO TOKEN MANAGER */}
      {activeTab === "pathao_tokens" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-yellow-400" /> Pathao OAuth2 Token Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Active Access Token Status:</span>
                <Badge variant={pathaoToken ? "success" : "destructive"}>
                  {pathaoToken ? "ACTIVE OAUTH TOKEN" : "NO ACTIVE TOKEN"}
                </Badge>
              </div>
              {pathaoTokenExpires && (
                <p className="text-xs text-slate-400">
                  Token Expiration: <span className="text-amber-300">{new Date(pathaoTokenExpires).toLocaleString()}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGeneratePathaoToken} disabled={submittingAction} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
                Generate Pathao OAuth2 Token
              </Button>
              <Button onClick={handleRefreshPathaoToken} disabled={submittingAction} size="sm" variant="outline" className="text-xs border-amber-500/40 text-amber-300">
                Refresh OAuth Token
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: PICKUP LOCATIONS */}
      {activeTab === "pickup_locations" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-400" /> Shared Pickup Locations Registry
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Shared warehouse & store pickup locations used across Steadfast & Pathao.</p>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Location Name</TableHead>
                  <TableHead className="text-xs">Contact Person</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">District/Area</TableHead>
                  <TableHead className="text-xs">Street Address</TableHead>
                  <TableHead className="text-xs">Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickupAddresses.map((a) => (
                  <TableRow key={a.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-xs font-semibold text-white">{a.name}</TableCell>
                    <TableCell className="text-xs text-slate-300">{a.contactPerson}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-300">{a.phone}</TableCell>
                    <TableCell className="text-xs text-slate-300">{a.district}, {a.area}</TableCell>
                    <TableCell className="text-xs text-slate-400">{a.address}</TableCell>
                    <TableCell className="text-xs">
                      {a.isDefault ? <Badge variant="success">DEFAULT</Badge> : <Badge variant="outline">STANDARD</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: GLOBAL RULES */}
      {activeTab === "global_rules" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-400" /> Global Shipping & Auto-Booking Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-medium text-slate-300">Default Courier Partner</label>
              <select
                value={defaultCourier}
                onChange={(e) => setDefaultCourier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
              >
                <option value="steadfast">Steadfast Courier</option>
                <option value="pathao">Pathao Courier</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Auto Book After Order Confirmation</p>
                <p className="text-[11px] text-slate-400">Automatically book courier consignment when order is confirmed</p>
              </div>
              <Switch checked={autoBookConfirm} onCheckedChange={setAutoBookConfirm} />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Auto Book After Payment Verification</p>
                <p className="text-[11px] text-slate-400">Automatically dispatch order after payment is captured</p>
              </div>
              <Switch checked={autoBookPayment} onCheckedChange={setAutoBookPayment} />
            </div>

            <div className="pt-2">
              <Button onClick={handleSaveGlobalRules} disabled={submittingAction} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
                Save Shipping Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: API LOGS */}
      {activeTab === "api_logs" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-slate-300" /> Courier API Request/Response Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs">Log Type</TableHead>
                  <TableHead className="text-xs">Endpoint</TableHead>
                  <TableHead className="text-xs">Latency</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                      No API logs recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiLogs.map((l) => (
                    <TableRow key={l.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{new Date(l.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-xs uppercase font-semibold text-indigo-400">{l.provider}</TableCell>
                      <TableCell className="text-xs capitalize text-slate-300">{l.logType}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-400">{l.endpoint}</TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-400">{l.responseTimeMs} ms</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={l.success ? "success" : "destructive"}>{l.success ? "SUCCESS" : "ERROR"}</Badge>
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

export default CourierSettingsUI;
