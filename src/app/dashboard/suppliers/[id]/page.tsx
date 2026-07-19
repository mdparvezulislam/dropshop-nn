"use client";

import * as React from "react";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { updateSupplierStatusAction } from "@/features/supplier/actions/supplier-actions";
import { toast } from "sonner";
import { Settings as SettingsIcon, FileText, User, CreditCard, ArrowLeft } from "lucide-react";

const MOCK_SUPPLIER = {
  id: "1",
  code: "SPL-0001",
  businessName: "Vertex Logistics",
  ownerName: "Akram Khan",
  contactPerson: "Akram Khan",
  email: "akram@vertex.com",
  phone: "+8801711223344",
  alternativePhone: "+8801811998877",
  website: "https://vertexlogistics.com",
  businessType: "LTD",
  tradeLicenseNumber: "TR-55667",
  binNumber: "1234567890",
  tinNumber: "0987654321",
  nidVerified: true,
  businessVerificationStatus: "verified" as const,
  status: "active" as const,
  address: {
    country: "Bangladesh",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Tejgaon",
    area: "Tejgaon Industrial Area",
    postalCode: "1215",
    fullAddress: "Tejgaon Industrial Area, Dhaka, Bangladesh",
    pickupAddress: "Warehouse 4B, Tejgaon Industrial Area, Dhaka",
    returnAddress: "Warehouse 4B, Tejgaon Industrial Area, Dhaka",
  },
  contacts: [
    {
      name: "Akram Khan",
      role: "Primary Contact",
      email: "akram@vertex.com",
      phone: "+8801711223344",
    },
    {
      name: "Jamil Ahmed",
      role: "Warehouse Manager",
      email: "jamil@vertex.com",
      phone: "+8801722998877",
    },
  ],
  banking: {
    bankName: "Standard Chartered Bank",
    branch: "Gulshan Branch",
    accountName: "Vertex Logistics Ltd",
    accountNumber: "01-8899776-01",
    routingNumber: "075262014",
    mobileBankingType: "bKash",
  },
  settings: {
    autoAcceptOrders: true,
    autoRejectOutOfStock: true,
    allowBackorders: false,
    processingTimeDays: 2,
    returnPolicy: "7 Days replacement warranty on logistics defects",
    warrantyPeriodDays: 30,
    shippingTimeDays: 3,
  },
};

export default function SupplierDetailsPage() {
  const [supplier, setSupplier] = React.useState<any>(MOCK_SUPPLIER);
  const [activeTab, setActiveTab] = React.useState("profile");
  const [updating, setUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: "active" | "suspended" | "archived") => {
    setUpdating(true);
    try {
      const res = await updateSupplierStatusAction(supplier.id, newStatus);
      if (res.success) {
        setSupplier((prev: any) => ({ ...prev, status: newStatus }));
        toast.success(`Supplier status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
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
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/suppliers"
          className="p-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{supplier.businessName}</h1>
            <Badge variant={getStatusVariant(supplier.status)}>{supplier.status}</Badge>
          </div>
          <p className="text-sm text-slate-400">Supplier Code: {supplier.code}</p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <User className="h-4 w-4" /> Profile
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <SettingsIcon className="h-4 w-4" /> Settings
            </button>
            <button
              onClick={() => setActiveTab("banking")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "banking"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <CreditCard className="h-4 w-4" /> Banking
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "documents"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FileText className="h-4 w-4" /> Documents
            </button>
          </div>

          <div className="flex gap-2">
            {supplier.status !== "active" && (
              <Button
                onClick={() => handleStatusChange("active")}
                disabled={updating}
                variant="outline"
                className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 h-10 font-medium"
              >
                Activate
              </Button>
            )}
            {supplier.status !== "suspended" && (
              <Button
                onClick={() => handleStatusChange("suspended")}
                disabled={updating}
                variant="destructive"
                className="h-10 font-medium"
              >
                Suspend
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
                    <p className="text-sm font-medium text-slate-200">{supplier.ownerName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Business Type</span>
                    <p className="text-sm font-medium text-slate-200">{supplier.businessType}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Trade License Number</span>
                    <p className="text-sm font-medium text-slate-200">
                      {supplier.tradeLicenseNumber}
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
                      {supplier.businessVerificationStatus}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Address Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Primary Office Address</span>
                  <p className="text-sm text-slate-200">{supplier.address.fullAddress}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Warehouse Pickup Point</span>
                    <p className="text-sm text-slate-200">{supplier.address.pickupAddress}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Returns Drop Point</span>
                    <p className="text-sm text-slate-200">{supplier.address.returnAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Contact Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.contacts.map((contact: any, idx: number) => (
                  <div key={idx} className="p-3 border border-slate-800 rounded-lg bg-slate-950/40">
                    <p className="text-sm font-semibold text-white">{contact.name}</p>
                    <span className="text-xs text-indigo-400">{contact.role}</span>
                    <p className="text-xs text-slate-400 mt-2">Email: {contact.email}</p>
                    <p className="text-xs text-slate-400">Phone: {contact.phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Settings Configuration</CardTitle>
            <CardDescription className="text-slate-400">
              On-demand operational settings and defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <span className="text-xs text-slate-400">Processing Time</span>
                <p className="text-sm font-semibold text-slate-200">
                  {supplier.settings.processingTimeDays} Days
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Shipping window</span>
                <p className="text-sm font-semibold text-slate-200">
                  {supplier.settings.shippingTimeDays} Days
                </p>
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">Warranty Policy</span>
              <p className="text-sm text-slate-200">
                {supplier.settings.warrantyPeriodDays} Days limited
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Return Policy</span>
              <p className="text-sm text-slate-200">{supplier.settings.returnPolicy}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "banking" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Banking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-xs text-slate-400">Bank Name</span>
                <p className="text-sm font-medium text-slate-200">{supplier.banking.bankName}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Branch Name</span>
                <p className="text-sm font-medium text-slate-200">{supplier.banking.branch}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-xs text-slate-400">Account Name</span>
                <p className="text-sm font-medium text-slate-200">{supplier.banking.accountName}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Account Number</span>
                <p className="text-sm font-medium text-indigo-400 font-mono">
                  {supplier.banking.accountNumber}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-xs text-slate-400">Routing Number</span>
                <p className="text-sm font-medium text-slate-200 font-mono">
                  {supplier.banking.routingNumber}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Mobile Wallet Type</span>
                <p className="text-sm font-medium text-slate-200 capitalize">
                  {supplier.banking.mobileBankingType}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Onboard Verification Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/40">
              <div>
                <p className="text-sm font-semibold text-white">Trade License PDF</p>
                <span className="text-xs text-slate-500">Uploaded 1 day ago</span>
              </div>
              <Badge variant="success">verified</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/40">
              <div>
                <p className="text-sm font-semibold text-white">BIN Certificate</p>
                <span className="text-xs text-slate-500">Uploaded 1 day ago</span>
              </div>
              <Badge variant="success">verified</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/40">
              <div>
                <p className="text-sm font-semibold text-white">TIN Certificate</p>
                <span className="text-xs text-slate-500">Uploaded 1 day ago</span>
              </div>
              <Badge variant="success">verified</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
