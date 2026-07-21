"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  updatePricingAction,
  overridePricingAction,
  getPricingByIdAction,
} from "@/features/pricing/actions/pricing-actions";
import { toast } from "sonner";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { currencyToCents, formatCentsToCurrency } from "@/shared/utils/currency-utils";

export default function PricingEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [loading, setLoading] = React.useState(false);
  const [overrideMode, setOverrideMode] = React.useState(false);
  const [productName, setProductName] = React.useState("Pricing Details");
  const [variantSku, setVariantSku] = React.useState(id);

  const [form, setForm] = React.useState({
    baseCostPrice: "0.00",
    purchasePrice: "0.00",
    supplierPrice: "0.00",
    sellingPrice: "0.00",
    wholesalePrice: "0.00",
    resellerPrice: "0.00",
    comparePrice: "0.00",
    promotionalPrice: "",
    discountPercentage: "0",
    currency: "BDT",
    taxRate: "0",
    taxInclusive: false,
    commissionRate: "0",
    pricingRule: "fixed" as const,
    status: "active" as const,
  });

  React.useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await getPricingByIdAction(id);
        if (res.success && res.data) {
          const item = res.data;
          setForm({
            baseCostPrice: (item.baseCostPrice / 100).toFixed(2),
            purchasePrice: (item.purchasePrice / 100).toFixed(2),
            supplierPrice: (item.supplierPrice / 100).toFixed(2),
            sellingPrice: (item.sellingPrice / 100).toFixed(2),
            wholesalePrice: (item.wholesalePrice / 100).toFixed(2),
            resellerPrice: (item.resellerPrice / 100).toFixed(2),
            comparePrice: (item.comparePrice / 100).toFixed(2),
            promotionalPrice: item.promotionalPrice ? (item.promotionalPrice / 100).toFixed(2) : "",
            discountPercentage: String(item.discountPercentage ?? 0),
            currency: item.currency || "BDT",
            taxRate: String(item.taxRate ?? 0),
            taxInclusive: item.taxInclusive ?? false,
            commissionRate: String(item.commissionRate ?? 0),
            pricingRule: item.pricingRule as any || "fixed",
            status: item.status as any || "active",
          });
          if ((item as any).productName) setProductName((item as any).productName);
          if ((item as any).variantSku) setVariantSku((item as any).variantSku);
        }
      } catch {
        // use clean default values
      }
    }
    load();
  }, [id]);

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        baseCostPrice: currencyToCents(Number(form.baseCostPrice)),
        purchasePrice: currencyToCents(Number(form.purchasePrice)),
        supplierPrice: currencyToCents(Number(form.supplierPrice)),
        sellingPrice: currencyToCents(Number(form.sellingPrice)),
        wholesalePrice: currencyToCents(Number(form.wholesalePrice)),
        resellerPrice: currencyToCents(Number(form.resellerPrice)),
        comparePrice: currencyToCents(Number(form.comparePrice)),
        promotionalPrice: form.promotionalPrice
          ? currencyToCents(Number(form.promotionalPrice))
          : undefined,
        discountPercentage: Number(form.discountPercentage) || 0,
        currency: form.currency,
        taxRate: Number(form.taxRate) || 0,
        taxInclusive: form.taxInclusive,
        commissionRate: Number(form.commissionRate) || 0,
        pricingRule: form.pricingRule,
        status: form.status,
      };

      const res = overrideMode
        ? await overridePricingAction(id, payload)
        : await updatePricingAction(id, payload);

      if (res.success) {
        toast.success(overrideMode ? "Price override applied" : "Pricing updated");
        router.push("/dashboard/pricing");
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pricing"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{productName}</h1>
              <Badge variant="success">{form.status}</Badge>
            </div>
            <p className="text-sm text-slate-400 font-mono">{variantSku}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOverrideMode((v) => !v)}
          className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm transition-colors ${
            overrideMode
              ? "border-amber-600 bg-amber-950/40 text-amber-300"
              : "border-slate-700 text-slate-300 hover:bg-slate-900"
          }`}
        >
          <Shield className="h-4 w-4" />
          {overrideMode ? "Override Mode On" : "Enable Override"}
        </button>
      </div>

      {(() => {
        const sellCents = currencyToCents(Number(form.sellingPrice));
        const costCents = currencyToCents(Number(form.baseCostPrice));
        const profitCents = Math.max(0, sellCents - costCents);
        const marginPct = sellCents > 0 ? ((profitCents / sellCents) * 100).toFixed(1) : "0.0";
        return (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs text-slate-400">Profit Amount</span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-emerald-400">
                  {formatCentsToCurrency(profitCents, form.currency)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs text-slate-400">Profit Margin</span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-indigo-400">{marginPct}%</div>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs text-slate-400">Rule</span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold capitalize">{form.pricingRule.replace("_", " ")}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs text-slate-400">Currency</span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">{form.currency}</div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Edit Prices</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["baseCostPrice", "Base Cost"],
                ["purchasePrice", "Purchase"],
                ["supplierPrice", "Supplier"],
                ["sellingPrice", "Selling"],
                ["wholesalePrice", "Wholesale"],
                ["resellerPrice", "Reseller"],
                ["comparePrice", "Compare At"],
                ["promotionalPrice", "Promotional"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs text-slate-400">{label}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Discount %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.discountPercentage}
                onChange={(e) => set("discountPercentage", e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Tax Rate %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.taxRate}
                onChange={(e) => set("taxRate", e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Commission %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.commissionRate}
                onChange={(e) => set("commissionRate", e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Link
            href="/dashboard/pricing"
            className="flex h-10 items-center justify-center rounded-md border border-slate-700 px-4 text-sm text-slate-300 hover:bg-slate-900 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : overrideMode ? "Override & Save" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
