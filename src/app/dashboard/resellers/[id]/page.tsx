"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateResellerStatusAction } from "@/features/reseller/actions/reseller-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  EyeOff,
  Heart,
  Wallet,
  ShoppingCart,
  TrendingUp,
  Pencil,
  Ban,
  CheckCircle,
  Archive,
} from "lucide-react";

const MOCK = {
  id: "1",
  code: "RSL-0001",
  businessName: "Nova Retail Hub",
  ownerName: "Farhana Akter",
  contactPerson: "Farhana Akter",
  email: "farhana@novaretail.com",
  phone: "+8801711002200",
  businessType: "Sole Proprietorship",
  status: "active" as const,
  nidVerified: true,
  tradeLicenseVerified: false,
  address: {
    country: "Bangladesh",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Gulshan",
    area: "Gulshan-2",
    postalCode: "1212",
    fullAddress: "House 12, Road 45, Gulshan-2, Dhaka",
  },
  stats: {
    totalProducts: 48,
    activeProducts: 36,
    hiddenProducts: 5,
    favoriteProducts: 12,
    draftProducts: 7,
    revenueReady: true,
    ordersReady: true,
    walletReady: true,
  },
};

export default function ResellerDetailsPage() {
  const params = useParams();
  const id = String(params.id);
  const [status, setStatus] = React.useState<
    "pending" | "active" | "suspended" | "blocked" | "archived"
  >(MOCK.status);
  const [loading, setLoading] = React.useState(false);

  const handleStatus = async (next: "active" | "suspended" | "archived" | "blocked") => {
    setLoading(true);
    try {
      const res = await updateResellerStatusAction(id, next);
      if (res.success) {
        setStatus(next);
        toast.success(`Status set to ${next}`);
      } else {
        toast.error(res.error || "Failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/resellers"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{MOCK.businessName}</h1>
              <Badge variant={status === "active" ? "success" : "warning"}>{status}</Badge>
            </div>
            <p className="text-sm text-slate-400 font-mono">{MOCK.code}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/resellers/${id}/edit`}
            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-900"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
          <Link
            href={`/dashboard/resellers/${id}/products`}
            className="flex h-9 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm text-white hover:bg-indigo-500"
          >
            <Package className="h-3.5 w-3.5" /> My Products
          </Link>
          {status !== "active" ? (
            <Button
              disabled={loading}
              onClick={() => handleStatus("active")}
              className="h-9 bg-emerald-700 hover:bg-emerald-600 text-white gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Activate
            </Button>
          ) : (
            <Button
              disabled={loading}
              onClick={() => handleStatus("suspended")}
              variant="outline"
              className="h-9 border-rose-800 text-rose-300 hover:bg-rose-950/40 gap-1.5"
            >
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
          )}
          <Button
            disabled={loading}
            onClick={() => handleStatus("archived")}
            variant="outline"
            className="h-9 border-slate-700 text-slate-300 gap-1.5"
          >
            <Archive className="h-3.5 w-3.5" /> Archive
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Package className="h-3 w-3" /> Total Products
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{MOCK.stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Active</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">{MOCK.stats.activeProducts}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <EyeOff className="h-3 w-3" /> Hidden
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">{MOCK.stats.hiddenProducts}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Heart className="h-3 w-3" /> Favorites
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-300">{MOCK.stats.favoriteProducts}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Revenue
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-sm font-medium text-slate-400">Ready</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Wallet / Orders
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" /> Ready
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Owner" value={MOCK.ownerName} />
            <Row label="Contact" value={MOCK.contactPerson} />
            <Row label="Email" value={MOCK.email} />
            <Row label="Phone" value={MOCK.phone} />
            <Row label="Business Type" value={MOCK.businessType} />
            <div className="flex gap-2 pt-1">
              <Badge variant={MOCK.nidVerified ? "success" : "warning"}>
                NID {MOCK.nidVerified ? "Verified" : "Pending"}
              </Badge>
              <Badge variant={MOCK.tradeLicenseVerified ? "success" : "warning"}>
                Trade License {MOCK.tradeLicenseVerified ? "Verified" : "Ready"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="District" value={MOCK.address.district} />
            <Row label="Upazila" value={MOCK.address.upazila} />
            <Row label="Area" value={MOCK.address.area} />
            <Row label="Postal" value={MOCK.address.postalCode} />
            <Row label="Full" value={MOCK.address.fullAddress} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/resellers/${id}/products`}
          className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm hover:border-indigo-700/50 transition-colors"
        >
          <div className="font-medium text-white">My Products</div>
          <div className="text-xs text-slate-400">Catalog, hide, favorite</div>
        </Link>
        <Link
          href={`/dashboard/resellers/${id}/pricing`}
          className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm hover:border-emerald-700/50 transition-colors"
        >
          <div className="font-medium text-white">Product Pricing</div>
          <div className="text-xs text-slate-400">Margins, discounts, reset</div>
        </Link>
        <Link
          href={`/dashboard/resellers/${id}/products?assign=1`}
          className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm hover:border-amber-700/50 transition-colors"
        >
          <div className="font-medium text-white">Product Assignment</div>
          <div className="text-xs text-slate-400">Add master products (read-only source)</div>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 text-right">{value}</span>
    </div>
  );
}
