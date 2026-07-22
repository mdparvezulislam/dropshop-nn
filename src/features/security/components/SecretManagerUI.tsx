"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import {
  listMaskedSecretsAction,
  saveSecretAction,
  rotateSecretAction,
  rollbackSecretAction,
  deleteSecretAction,
} from "../actions/secret-actions";
import { toast } from "sonner";
import {
  ShieldCheck,
  Key,
  Lock,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Activity,
  PlusCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
} from "lucide-react";

export function SecretManagerUI(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<"inventory" | "create" | "audit" | "failed">("inventory");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Create Form State
  const [provider, setProvider] = React.useState<string>("courier_steadfast");
  const [secretType, setSecretType] = React.useState<string>("api_key");
  const [displayName, setDisplayName] = React.useState("");
  const [plaintextValue, setPlaintextValue] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Rotate Form State
  const [rotateProvider, setRotateProvider] = React.useState<string>("");
  const [rotateType, setRotateType] = React.useState<string>("");
  const [newRotateValue, setNewRotateValue] = React.useState("");
  const [isRotateModalOpen, setIsRotateModalOpen] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);

  // Tab Slider ref
  const tabSliderRef = React.useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: "left" | "right") => {
    if (tabSliderRef.current) {
      tabSliderRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMaskedSecretsAction();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.error || "Failed to load managed secrets");
      }
    } catch (err: any) {
      toast.error(err.message || "Error loading secrets");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !plaintextValue) {
      toast.error("Display Name and Secret Value are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await saveSecretAction({
        provider,
        secretType,
        displayName,
        plaintextValue,
        description,
      });
      if (res.success) {
        toast.success(`Secret [${displayName}] encrypted & saved successfully!`);
        setDisplayName("");
        setPlaintextValue("");
        setDescription("");
        setActiveTab("inventory");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to save secret");
      }
    } catch (err: any) {
      toast.error(err.message || "Save error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRotateSecret = async () => {
    if (!rotateProvider || !rotateType || !newRotateValue) {
      toast.error("Please enter the new secret value to rotate");
      return;
    }
    setSubmitting(true);
    try {
      const res = await rotateSecretAction({
        provider: rotateProvider,
        secretType: rotateType,
        newPlaintextValue: newRotateValue,
      });
      if (res.success) {
        toast.success(`Secret [${rotateProvider}/${rotateType}] rotated to v${res.data.version}!`);
        setIsRotateModalOpen(false);
        setNewRotateValue("");
        loadAllData();
      } else {
        toast.error(res.error || "Rotation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Rotate error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRollbackSecret = async (prov: string, stype: string) => {
    if (!confirm(`Rollback secret [${prov}/${stype}] to previous version?`)) return;
    try {
      const res = await rollbackSecretAction({ provider: prov, secretType: stype });
      if (res.success) {
        toast.success(`Secret rolled back to previous version v${res.data.version}!`);
        loadAllData();
      } else {
        toast.error(res.error || "Rollback failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Rollback error");
    }
  };

  const handleDeleteSecret = async (prov: string, stype: string) => {
    if (!confirm(`Revoke and soft delete secret [${prov}/${stype}]?`)) return;
    try {
      const res = await deleteSecretAction({ provider: prov, secretType: stype });
      if (res.success) {
        toast.success(`Secret revoked successfully`);
        loadAllData();
      } else {
        toast.error(res.error || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Delete error");
    }
  };

  const secretsList = data?.secrets || [];
  const filteredSecrets = secretsList.filter(
    (s: any) =>
      s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.secretType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Enterprise Secrets & Credential Security</h1>
            <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-950/40 text-[10px]">
              SECURITY-CENTER-001
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            AES-256-GCM Authenticated Encryption, Zero Plaintext Storage, Secret Masking & Zero-Downtime Rotation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secrets..."
              className="pl-8 text-xs bg-slate-900 border-slate-800"
            />
          </div>
          <Button onClick={() => setActiveTab("create")} size="sm" className="bg-rose-600 hover:bg-rose-500 text-xs gap-1.5">
            <PlusCircle className="h-3.5 w-3.5" /> Add Secret
          </Button>
          <Button onClick={loadAllData} size="sm" variant="ghost" disabled={loading} className="text-slate-400 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Master Encryption Key</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-emerald-400">{data?.masterKeyHealthy ? "AES-256-GCM ACTIVE" : "KEY ERROR"}</p>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Managed Secrets</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-white">{secretsList.length}</p>
              <Lock className="h-4 w-4 text-sky-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Audit Events</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-amber-400">{data?.auditLogs?.length || 0}</p>
              <History className="h-4 w-4 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400">Failed Access Logs</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-rose-400">{data?.failedAccessLogs?.length || 0}</p>
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
          </CardContent>
        </Card>
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
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "inventory" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Secrets Inventory ({secretsList.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "create" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" /> Add / Update Secret
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "audit" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5 text-amber-400" /> Security Audit Log
          </button>
          <button
            onClick={() => setActiveTab("failed")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "failed" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Failed Access Logs
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

      {/* TAB 1: SECRETS INVENTORY */}
      {activeTab === "inventory" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Encrypted Platform Secrets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs">Secret Type</TableHead>
                  <TableHead className="text-xs">Display Name</TableHead>
                  <TableHead className="text-xs">Masked Value (Server Encrypted)</TableHead>
                  <TableHead className="text-xs">Version</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSecrets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No encrypted secrets stored yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSecrets.map((s: any) => (
                    <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs capitalize font-semibold text-rose-400">{s.provider}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-300">{s.secretType}</TableCell>
                      <TableCell className="text-xs text-white font-medium">{s.displayName}</TableCell>
                      <TableCell className="text-xs font-mono text-emerald-400">{s.maskedValue}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-amber-300">v{s.version}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={s.status === "active" ? "success" : "destructive"}>{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right space-x-1">
                        <Button
                          onClick={() => {
                            setRotateProvider(s.provider);
                            setRotateType(s.secretType);
                            setIsRotateModalOpen(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-slate-700"
                        >
                          <RefreshCw className="h-3 w-3 mr-1 text-sky-400" /> Rotate
                        </Button>

                        {s.previousEncryptedValue && (
                          <Button
                            onClick={() => handleRollbackSecret(s.provider, s.secretType)}
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] border-slate-700 text-amber-300"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Rollback
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDeleteSecret(s.provider, s.secretType)}
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: CREATE / UPDATE SECRET */}
      {activeTab === "create" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Store Encrypted Credential</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSecret} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Provider *</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                  >
                    <option value="courier_steadfast">Steadfast Courier</option>
                    <option value="courier_pathao">Pathao Courier</option>
                    <option value="smtp">SMTP Email Server</option>
                    <option value="sms_gateway">SMS Gateway</option>
                    <option value="payment_bkash">bKash Payment Gateway</option>
                    <option value="payment_nagad">Nagad Payment Gateway</option>
                    <option value="payment_sslcommerz">SSLCommerz Gateway</option>
                    <option value="payment_stripe">Stripe Gateway</option>
                    <option value="cloudflare">Cloudflare API</option>
                    <option value="imagekit">ImageKit Media</option>
                    <option value="mongodb">MongoDB URI</option>
                    <option value="redis">Redis Password</option>
                    <option value="jwt">JWT Signing Secret</option>
                    <option value="custom">Custom Integration</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Secret Type *</label>
                  <select
                    value={secretType}
                    onChange={(e) => setSecretType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white mt-1"
                  >
                    <option value="api_key">API Key</option>
                    <option value="api_secret">API Secret</option>
                    <option value="client_secret">Client Secret</option>
                    <option value="username">Username</option>
                    <option value="password">Password</option>
                    <option value="access_token">Access Token</option>
                    <option value="refresh_token">Refresh Token</option>
                    <option value="webhook_secret">Webhook Secret</option>
                    <option value="private_key">Private Key</option>
                    <option value="bearer_token">Bearer Token</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Display Name *</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Steadfast Production API Key"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Plaintext Secret Value * (Will be encrypted with AES-256-GCM)</label>
                <Input
                  type="password"
                  value={plaintextValue}
                  onChange={(e) => setPlaintextValue(e.target.value)}
                  placeholder="Enter secret credential value"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional usage notes"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={submitting} size="sm" className="bg-rose-600 hover:bg-rose-500 text-xs">
                  Encrypt & Save Secret
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "audit" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Security Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs">Secret Type</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Performed By</TableHead>
                  <TableHead className="text-xs">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.auditLogs || []).map((a: any) => (
                  <TableRow key={a.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="text-xs font-semibold text-rose-400 uppercase">{a.provider}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-300">{a.secretType}</TableCell>
                    <TableCell className="text-xs uppercase font-bold text-amber-300">{a.action}</TableCell>
                    <TableCell className="text-xs text-white">{a.performedBy}</TableCell>
                    <TableCell className="text-xs text-slate-400">{a.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: FAILED ACCESS LOGS */}
      {activeTab === "failed" && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Failed Access & Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Failure Reason</TableHead>
                  <TableHead className="text-xs">Attempted By</TableHead>
                  <TableHead className="text-xs">Error Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.failedAccessLogs || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                      No security alerts or failed access attempts recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.failedAccessLogs || []).map((f: any) => (
                    <TableRow key={f.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{new Date(f.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold text-rose-400 uppercase">{f.failureReason}</TableCell>
                      <TableCell className="text-xs text-white">{f.attemptedBy}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-300">{f.errorMessage}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ROTATE SECRET MODAL */}
      {isRotateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Rotate Secret [{rotateProvider}/{rotateType}]</h3>
            <p className="text-xs text-slate-400">
              Entering a new secret value will encrypt the new key with AES-256-GCM and store the previous version for zero-downtime rollback.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-300">New Secret Value *</label>
              <Input
                type="password"
                value={newRotateValue}
                onChange={(e) => setNewRotateValue(e.target.value)}
                placeholder="New secret credential value"
                className="bg-slate-950 border-slate-800 text-xs mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setIsRotateModalOpen(false)} size="sm" variant="ghost" className="text-xs text-slate-400">
                Cancel
              </Button>
              <Button onClick={handleRotateSecret} disabled={submitting} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
                Rotate Key Zero-Downtime
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecretManagerUI;
