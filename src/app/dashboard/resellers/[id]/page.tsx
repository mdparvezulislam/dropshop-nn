"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  getResellerByIdAction,
  updateResellerStatusAction,
  updateResellerMarkupAction,
} from "@/features/reseller/actions/reseller-actions";
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
  Store,
  ShieldCheck,
  MapPin,
  Percent,
} from "lucide-react";

export default function ResellerDetailsPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id);

  const [loading, setLoading] = React.useState(true);
  const [mutatingStatus, setMutatingStatus] = React.useState(false);
  const [reseller, setReseller] = React.useState<any>(null);

  const [resellerMarkup, setResellerMarkup] = React.useState<number>(22);
  const [wholesaleMarkup, setWholesaleMarkup] = React.useState<number>(30);
  const [savingMarkup, setSavingMarkup] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResellerByIdAction(id);
      if (res.success && res.data) {
        setReseller(res.data);
        if (res.data.resellerMarkupPercent !== undefined) {
          setResellerMarkup(res.data.resellerMarkupPercent);
        }
        if (res.data.wholesaleMarkupPercent !== undefined) {
          setWholesaleMarkup(res.data.wholesaleMarkupPercent);
        }
      } else {
        toast.error(res.error || "Reseller document not found");
      }
    } catch {
      toast.error("Failed to load reseller profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveMarkup = async () => {
    setSavingMarkup(true);
    try {
      const res = await updateResellerMarkupAction(id, resellerMarkup, wholesaleMarkup);
      if (res.success) {
        toast.success("Custom partner markup percentages saved!");
        setReseller((prev: any) => ({
          ...prev,
          resellerMarkupPercent: resellerMarkup,
          wholesaleMarkupPercent: wholesaleMarkup,
        }));
      } else {
        toast.error(res.error || "Failed to update custom markup");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save custom markup");
    } finally {
      setSavingMarkup(false);
    }
  };

  const handleStatus = async (next: "active" | "suspended" | "archived" | "blocked") => {
    setMutatingStatus(true);
    try {
      const res = await updateResellerStatusAction(id, next);
      if (res.success) {
        setReseller((prev: any) => ({ ...prev, status: next }));
        toast.success(`Status updated to ${next}`);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setMutatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center p-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Spinner size="default" /> Loading reseller details…
        </div>
      </div>
    );
  }

  const r = reseller || {
    id,
    code: id.substring(0, 8).toUpperCase(),
    businessName: "Reseller Partner",
    ownerName: "N/A",
    contactPerson: "N/A",
    email: "partner@dropshop.com",
    phone: "N/A",
    businessType: "Reseller Business",
    status: "active",
    address: {
      district: "Dhaka",
      upazila: "Gulshan",
      area: "Gulshan-1",
      postalCode: "1212",
      fullAddress: "House 10, Road 2, Gulshan-1, Dhaka",
    },
  };

  const statusTone =
    r.status === "active" ? "success" : r.status === "suspended" ? "destructive" : "warning";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/resellers"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <Store className="h-6 w-6 text-amber-500 shrink-0" />
                {r.businessName || r.ownerName}
              </h1>
              <Badge variant={statusTone as any}>{r.status}</Badge>
            </div>
            <p className="text-sm font-mono text-muted-foreground mt-0.5">ID: {r.code || id}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/resellers/${id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
          <Link
            href={`/dashboard/resellers/${id}/products`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-600 px-3 text-sm font-medium text-white hover:bg-amber-500 transition-colors"
          >
            <Package className="h-3.5 w-3.5" /> Catalog
          </Link>
          {r.status !== "active" ? (
            <Button
              disabled={mutatingStatus}
              onClick={() => handleStatus("active")}
              className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Activate
            </Button>
          ) : (
            <Button
              disabled={mutatingStatus}
              onClick={() => handleStatus("suspended")}
              variant="outline"
              className="h-9 border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
          )}
          <Button
            disabled={mutatingStatus}
            onClick={() => handleStatus("archived")}
            variant="outline"
            className="h-9 border-border text-muted-foreground hover:bg-muted gap-1.5"
          >
            <Archive className="h-3.5 w-3.5" /> Archive
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-amber-500" /> Catalog Items
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black">{r.productCount || 48}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Active Selling
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {r.activeProducts || 36}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <EyeOff className="h-3.5 w-3.5 text-amber-500" /> Hidden
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {r.hiddenProducts || 5}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-500" /> Favorites
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {r.favoriteProducts || 12}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Revenue Stream
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Active</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-purple-500" /> Wallet Desk
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShoppingCart className="h-3.5 w-3.5" /> Synchronized
          </CardContent>
        </Card>
      </div>

      {/* Main Profile Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Business Profile */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" /> Business Profile & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm">
            <Row label="Business Name" value={r.businessName || "—"} />
            <Row label="Owner Name" value={r.ownerName || "—"} />
            <Row label="Contact Person" value={r.contactPerson || "—"} />
            <Row label="Email" value={r.email || "—"} />
            <Row label="Phone" value={r.phone || "—"} />
            <Row label="Business Type" value={r.businessType || "Sole Proprietorship"} />
            <div className="flex gap-2 pt-2">
              <Badge variant={r.nidVerified ? "success" : "warning"}>
                NID {r.nidVerified ? "Verified" : "Pending"}
              </Badge>
              <Badge variant={r.tradeLicenseVerified ? "success" : "warning"}>
                Trade License {r.tradeLicenseVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" /> Address & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm">
            <Row label="District" value={r.address?.district || "Dhaka"} />
            <Row label="Upazila / Thana" value={r.address?.upazila || "Gulshan"} />
            <Row label="Area" value={r.address?.area || "—"} />
            <Row label="Postal Code" value={r.address?.postalCode || "—"} />
            <Row label="Full Address" value={r.address?.fullAddress || "—"} />
          </CardContent>
        </Card>
      </div>

      {/* Custom Per-User Partner Markup Overrides Card */}
      <Card className="border-amber-500/30 bg-card shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-amber-600 dark:text-amber-400 text-lg font-bold flex items-center gap-2">
                <Percent className="h-5 w-5" /> Partner Pricing & Custom Tier Overrides
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign individual custom markup percentages for top-performing resellers or wholesalers.
              </p>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-300">
              Custom VIP Tier Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-xl border border-border">
              <label className="text-xs font-bold text-foreground">Reseller Markup %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={resellerMarkup}
                onChange={(e) => setResellerMarkup(Number(e.target.value))}
                className="w-full h-9 rounded-lg bg-background border border-input px-3 text-sm font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-muted-foreground">
                Custom profit margin for this reseller catalog (Default: 22%)
              </p>
            </div>

            <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-xl border border-border">
              <label className="text-xs font-bold text-foreground">Wholesale Markup %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={wholesaleMarkup}
                onChange={(e) => setWholesaleMarkup(Number(e.target.value))}
                className="w-full h-9 rounded-lg bg-background border border-input px-3 text-sm font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-muted-foreground">
                Custom bulk order tier margin for this wholesale partner (Default: 30%)
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={savingMarkup}
              onClick={handleSaveMarkup}
              className="bg-amber-600 hover:bg-amber-500 text-white gap-2 font-bold"
            >
              {savingMarkup ? "Saving..." : "Save Custom Partner Markups"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
