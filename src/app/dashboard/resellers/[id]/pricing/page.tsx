"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateResellerProductPricingAction,
  resetResellerProductPriceAction,
  previewResellerProductPricingAction,
} from "@/features/reseller/actions/reseller-actions";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Save, TrendingUp } from "lucide-react";
import { currencyToCents, formatCentsToCurrency } from "@/lib/utils/currency-utils";

const MOCK = {
  id: "rp1",
  title: "Smart Watch Ultra 2 — Nova Edition",
  variantSku: "APL-IPH16PM-256-BLK",
  sellingPrice: 124900,
  recommendedPrice: 119900,
  costBasis: 92000,
  discountPercentage: 0,
  profitMargin: 26.3,
  profitAmount: 32900,
  currency: "USD",
};

function PricingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const resellerId = String(params.id);
  const productId = searchParams.get("product") || MOCK.id;

  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<{
    profitMargin: number;
    profitAmount: number;
    sellingPrice: number;
  } | null>(null);

  const [form, setForm] = React.useState({
    sellingPrice: (MOCK.sellingPrice / 100).toFixed(2),
    discountPercentage: String(MOCK.discountPercentage),
  });

  const handlePreview = async () => {
    try {
      const res = await previewResellerProductPricingAction(productId, {
        sellingPrice: currencyToCents(Number(form.sellingPrice)),
        discountPercentage: Number(form.discountPercentage) || 0,
      });
      if (res.success && res.data) {
        setPreview({
          profitMargin: res.data.profitMargin,
          profitAmount: res.data.profitAmount,
          sellingPrice: res.data.sellingPrice,
        });
      }
    } catch {
      // preview optional when offline
      const sell = currencyToCents(Number(form.sellingPrice));
      const disc = Number(form.discountPercentage) || 0;
      const effective = Math.round(sell * (1 - disc / 100));
      const profit = effective - MOCK.costBasis;
      setPreview({
        sellingPrice: effective,
        profitAmount: profit,
        profitMargin: effective > 0 ? Math.round((profit / effective) * 10000) / 100 : 0,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateResellerProductPricingAction(productId, {
        sellingPrice: currencyToCents(Number(form.sellingPrice)),
        discountPercentage: Number(form.discountPercentage) || 0,
      });
      if (res.success) {
        toast.success("Reseller price updated (master pricing unchanged)");
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetResellerProductPriceAction(productId);
      if (res.success && res.data) {
        setForm({
          sellingPrice: (res.data.pricing.recommendedPrice / 100).toFixed(2),
          discountPercentage: "0",
        });
        toast.success("Price reset to recommended");
      } else {
        setForm({
          sellingPrice: (MOCK.recommendedPrice / 100).toFixed(2),
          discountPercentage: "0",
        });
        toast.success("Price reset to recommended");
      }
    } catch {
      setForm({
        sellingPrice: (MOCK.recommendedPrice / 100).toFixed(2),
        discountPercentage: "0",
      });
      toast.success("Price reset to recommended");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/resellers/${resellerId}/products`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Pricing</h1>
          <p className="text-sm text-slate-400">
            {MOCK.title} · <span className="font-mono">{MOCK.variantSku}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 max-w-4xl">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Recommended</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold">
              {formatCentsToCurrency(MOCK.recommendedPrice, MOCK.currency)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Cost Basis</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold text-slate-300">
              {formatCentsToCurrency(MOCK.costBasis, MOCK.currency)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400">Profit</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold text-emerald-400">
              {formatCentsToCurrency(preview?.profitAmount ?? MOCK.profitAmount, MOCK.currency)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Margin
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold text-indigo-400">
              {preview?.profitMargin ?? MOCK.profitMargin}%
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Custom Reseller Price</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Selling Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Discount %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.discountPercentage}
                onChange={(e) => setForm((f) => ({ ...f, discountPercentage: e.target.value }))}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <p className="sm:col-span-2 text-xs text-slate-500">
              Stored on ResellerProduct only. Platform ProductPricing and Product catalog stay
              untouched.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            className="border-slate-700 text-slate-300"
          >
            Profit Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleReset}
            className="border-slate-700 text-slate-300 gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Reset Price
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Price"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ResellerPricingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-6 text-slate-400">Loading pricing...</div>
      }
    >
      <PricingContent />
    </React.Suspense>
  );
}
