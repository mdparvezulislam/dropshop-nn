"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import { Separator } from "@/shared/components/ui/separator";
import {
  getSupplierByIdAction,
  updateSupplierStatusAction,
} from "@/features/supplier/actions/supplier-actions";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  FileText,
  User,
  CreditCard,
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  Tag,
  Star,
} from "lucide-react";

export default function SupplierDetailsPage(): React.ReactElement {
  const params = useParams();
  const id = params?.id as string;

  const [supplier, setSupplier] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("profile");
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSupplierByIdAction(id).then((res) => {
      if (res.success && res.data) {
        setSupplier(res.data);
      } else {
        toast.error("Failed to load supplier");
      }
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await updateSupplierStatusAction(id, newStatus as any);
      if (res.success) {
        setSupplier((prev: any) => ({ ...prev, status: newStatus }));
        toast.success(`Supplier status updated to ${newStatus}`);
      } else {
        toast.error(res.error ?? "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update supplier status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success" as const;
      case "pending":
        return "warning" as const;
      case "suspended":
      case "blocked":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Spinner size="lg" />
          <span>Loading supplier…</span>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center gap-4">
        <Building2 className="h-12 w-12 text-slate-700" />
        <p className="text-slate-400">Supplier not found</p>
        <Link href="/dashboard/suppliers">
          <Button variant="outline">Back to suppliers</Button>
        </Link>
      </div>
    );
  }

  const statusActions: { label: string; status: string; variant: "outline" | "destructive" }[] = [];
  if (supplier.status === "pending" || supplier.status === "inactive") {
    statusActions.push({ label: "Activate", status: "active", variant: "outline" });
  }
  if (supplier.status === "active") {
    statusActions.push({ label: "Suspend", status: "suspended", variant: "destructive" });
  }
  if (supplier.status !== "blocked" && supplier.status !== "archived") {
    statusActions.push({ label: "Archive", status: "archived", variant: "outline" });
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <Link
          href="/dashboard/suppliers"
          className="mt-1 p-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight truncate">
              {supplier.businessName}
            </h1>
            <Badge variant={getStatusVariant(supplier.status)}>{supplier.status}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 flex-wrap">
            <span>Code: {supplier.code}</span>
            {supplier.supplierCategory && (
              <span className="capitalize">Category: {supplier.supplierCategory.replace(/_/g, " ")}</span>
            )}
            {supplier.performance?.performanceScore != null && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Score: {supplier.performance.performanceScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs + Actions */}
      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "profile", icon: User, label: "Profile" },
              { key: "contacts", icon: Mail, label: "Contacts" },
              { key: "settings", icon: SettingsIcon, label: "Settings" },
              { key: "banking", icon: CreditCard, label: "Banking" },
              { key: "documents", icon: FileText, label: "Documents" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {statusActions.map((action) => (
              <Button
                key={action.status}
                onClick={() => handleStatusChange(action.status)}
                disabled={updating}
                variant={action.variant}
                className={
                  action.variant === "outline"
                    ? "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 h-10 font-medium"
                    : "h-10 font-medium"
                }
              >
                {action.label}
              </Button>
            ))}
            <Link href={`/dashboard/suppliers/${id}/edit`}>
              <Button variant="outline" className="h-10 font-medium">
                Edit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Business Registration Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Owner Name</span>
                    <p className="text-sm font-medium text-slate-200">
                      {supplier.ownerName || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Business Type</span>
                    <p className="text-sm font-medium text-slate-200">
                      {supplier.businessType || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Trade License Number</span>
                    <p className="text-sm font-medium text-slate-200">
                      {supplier.tradeLicenseNumber || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">BIN / TIN Numbers</span>
                    <p className="text-sm font-medium text-slate-200">
                      BIN: {supplier.binNumber || "N/A"} / TIN: {supplier.tinNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Verification Status</span>
                    <p className="text-sm font-medium text-slate-200 capitalize">
                      {supplier.businessVerificationStatus || "unverified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Supplier Category</span>
                    <p className="text-sm font-medium text-slate-200 capitalize">
                      {supplier.supplierCategory
                        ? supplier.supplierCategory.replace(/_/g, " ")
                        : "—"}
                    </p>
                  </div>
                </div>
                {supplier.tags && supplier.tags.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-400">Tags</span>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {supplier.tags.map((t: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400"
                        >
                          <Tag className="h-3 w-3" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {supplier.description && (
                  <div>
                    <span className="text-xs text-slate-400">Description</span>
                    <p className="text-sm text-slate-200 mt-1">{supplier.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {supplier.performance ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Performance Score</span>
                      <p className="text-2xl font-bold text-slate-200">
                        {supplier.performance.performanceScore ?? 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <span className="text-xs text-slate-400">On-Time Delivery</span>
                      <p className="text-2xl font-bold text-emerald-500">
                        {supplier.performance.onTimeDeliveryRate ?? 0}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Return Rate</span>
                      <p className="text-2xl font-bold text-amber-500">
                        {supplier.performance.returnRate ?? 0}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Avg Delivery Days</span>
                      <p className="text-2xl font-bold text-slate-200">
                        {supplier.performance.averageDeliveryDays ?? 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Response Time (hrs)</span>
                      <p className="text-2xl font-bold text-slate-200">
                        {supplier.performance.responseTimeHours ?? 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Completed Orders</span>
                      <p className="text-2xl font-bold text-slate-200">
                        {supplier.performance.completedOrders ?? 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No performance data yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Full Address</span>
                  <p className="text-sm text-slate-200">
                    {supplier.address?.fullAddress || "—"}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Pickup Point</span>
                    <p className="text-sm text-slate-200">
                      {supplier.address?.pickupAddress || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Return Point</span>
                    <p className="text-sm text-slate-200">
                      {supplier.address?.returnAddress || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3 text-xs text-slate-500">
                  <span>Division: {supplier.address?.division || "—"}</span>
                  <span>District: {supplier.address?.district || "—"}</span>
                  <span>Upazila: {supplier.address?.upazila || "—"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-slate-300 truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-slate-300">{supplier.phone}</span>
                </div>
                {supplier.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-slate-500 shrink-0" />
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline truncate"
                    >
                      {supplier.website}
                    </a>
                  </div>
                )}
                {supplier.facebook && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="text-slate-300 truncate">FB: {supplier.facebook}</span>
                  </div>
                )}
                {supplier.whatsApp && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="text-slate-300">WhatsApp: {supplier.whatsApp}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/suppliers/${id}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {supplier.notes && supplier.notes.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {supplier.notes.map((note: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 text-sm"
                    >
                      <p className="text-slate-300">{note.content}</p>
                      {note.createdAt && (
                        <p className="text-[10px] text-slate-600 mt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                          {note.createdBy ? ` · by ${note.createdBy}` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab: Contacts */}
      {activeTab === "contacts" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Contact Persons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.contacts && supplier.contacts.length > 0 ? (
              <div className="grid gap-4">
                {supplier.contacts.map((contact: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-800 rounded-lg bg-slate-950/40"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{contact.name}</p>
                        <span className="text-xs text-indigo-400">{contact.role}</span>
                      </div>
                      {contact.isPrimary && (
                        <Badge variant="default" className="text-[10px]">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-400 space-y-1">
                      <p>Email: {contact.email}</p>
                      <p>Phone: {contact.phone}</p>
                      {contact.isEmergency && <p className="text-amber-500">Emergency Contact</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No contacts listed.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Settings Configuration</CardTitle>
            <CardDescription className="text-slate-400">
              On-demand operational settings and defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.settings ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Auto Accept Orders</span>
                    <p className="text-sm font-semibold text-slate-200">
                      {supplier.settings.autoAcceptOrders ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Auto Reject Out Of Stock</span>
                    <p className="text-sm font-semibold text-slate-200">
                      {supplier.settings.autoRejectOutOfStock ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Allow Backorders</span>
                    <p className="text-sm font-semibold text-slate-200">
                      {supplier.settings.allowBackorders ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Processing Time</span>
                    <p className="text-sm font-semibold text-slate-200">
                      {supplier.settings.processingTimeDays} Days
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Shipping Window</span>
                    <p className="text-sm font-semibold text-slate-200">
                      {supplier.settings.shippingTimeDays} Days
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Warranty Period</span>
                    <p className="text-sm font-semibold text-slate-200">
                      {supplier.settings.warrantyPeriodDays} Days
                    </p>
                  </div>
                </div>
                <Separator className="bg-slate-800" />
                <div>
                  <span className="text-xs text-slate-400">Return Policy</span>
                  <p className="text-sm text-slate-200 mt-1">
                    {supplier.settings.returnPolicy || "—"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No settings configured.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Banking */}
      {activeTab === "banking" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Banking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.banking ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Bank Name</span>
                    <p className="text-sm font-medium text-slate-200">
                      {supplier.banking.bankName || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Branch</span>
                    <p className="text-sm font-medium text-slate-200">
                      {supplier.banking.branch || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Account Name</span>
                    <p className="text-sm font-medium text-slate-200">
                      {supplier.banking.accountName || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Account Number</span>
                    <p className="text-sm font-medium text-indigo-400 font-mono">
                      {supplier.banking.accountNumber || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Routing Number</span>
                    <p className="text-sm font-medium text-slate-200 font-mono">
                      {supplier.banking.routingNumber || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Mobile Wallet</span>
                    <p className="text-sm font-medium text-slate-200 capitalize">
                      {supplier.banking.mobileBankingType || "—"}
                    </p>
                  </div>
                </div>
                {supplier.banking.binanceWalletAddress && (
                  <div>
                    <span className="text-xs text-slate-400">Binance Wallet</span>
                    <p className="text-sm font-mono text-slate-200">
                      {supplier.banking.binanceWalletAddress}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">No banking details configured.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Documents */}
      {activeTab === "documents" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Onboard Verification Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.documents && supplier.documents.length > 0 ? (
              supplier.documents.map((doc: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{doc.type}</p>
                    {doc.uploadedAt && (
                      <span className="text-xs text-slate-500">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Badge
                    variant={
                      doc.status === "verified"
                        ? "success"
                        : doc.status === "rejected"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/40">
                  <div>
                    <p className="text-sm font-semibold text-white">Trade License PDF</p>
                    <span className="text-xs text-slate-500">No file uploaded</span>
                  </div>
                  <Badge variant="default">pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/40">
                  <div>
                    <p className="text-sm font-semibold text-white">BIN Certificate</p>
                    <span className="text-xs text-slate-500">No file uploaded</span>
                  </div>
                  <Badge variant="default">pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/40">
                  <div>
                    <p className="text-sm font-semibold text-white">TIN Certificate</p>
                    <span className="text-xs text-slate-500">No file uploaded</span>
                  </div>
                  <Badge variant="default">pending</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
