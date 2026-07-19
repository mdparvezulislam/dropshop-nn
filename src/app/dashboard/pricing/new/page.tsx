"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { createPricingAction } from "@/features/pricing/actions/pricing-actions";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { currencyToCents } from "@/shared/utils/currency-utils";

export default function NewPricingPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    productId: "",
    variantSku: "",
    baseCostPrice: "",
    purchasePrice: "",
    supplierPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    resellerPrice: "",
    comparePrice: "",
    promotionalPrice: "",
    discountPercentage: "0",
    currency: "USD",
    taxRate: "0",
    taxInclusive: false,
    commissionRate: "0",
    pricingRule: "fixed",
    status: "active",
  });

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toCents = (v: string): number => {
    if (!v || v.trim() === "") return 0;
    return currencyToCents(Number(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createPricingAction({
        productId: form.productId.trim(),
        variantSku: form.variantSku.trim() || undefined,
        baseCostPrice: toCents(form.baseCostPrice),
        purchasePrice: toCents(form.purchasePrice),
        supplierPrice: toCents(form.supplierPrice),
        sellingPrice: toCents(form.sellingPrice),
        wholesalePrice: toCents(form.wholesalePrice),
        resellerPrice: toCents(form.resellerPrice),
        comparePrice: toCents(form.comparePrice),
        promotionalPrice: form.promotionalPrice ? toCents(form.promotionalPrice) : undefined,
        discountPercentage: Number(form.discountPercentage) || 0,
        currency: form.currency,
        taxRate: Number(form.taxRate) || 0,
        taxInclusive: form.taxInclusive,
        commissionRate: Number(form.commissionRate) || 0,
        pricingRule: form.pricingRule as
          "fixed" | "percentage" | "supplier_based" | "category_based" | "brand_based" | "dynamic",
        status: form.status as "active" | "inactive" | "scheduled" | "expired",
      });

      if (res.success) {
        toast.success("Pricing created successfully");
        router.push("/dashboard/pricing");
      } else {
        toast.error(res.error || "Failed to create pricing");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create pricing";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/pricing"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Pricing</h1>
          <p className="text-sm text-slate-400">Define cost, sell, and tier prices for a product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Product Reference</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Product ID *</label>
              <Input
                required
                value={form.productId}
                onChange={(e) => set("productId", e.target.value)}
                placeholder="24-char ObjectId"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Variant SKU</label>
              <Input
                value={form.variantSku}
                onChange={(e) => set("variantSku", e.target.value)}
                placeholder="Optional variant SKU"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Cost Prices (major units)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["baseCostPrice", "Base Cost"],
                ["purchasePrice", "Purchase"],
                ["supplierPrice", "Supplier"],
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
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Sell Prices (major units)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["sellingPrice", "Selling *", true],
                ["wholesalePrice", "Wholesale", false],
                ["resellerPrice", "Reseller", false],
                ["comparePrice", "Compare At", false],
                ["promotionalPrice", "Promotional", false],
              ] as const
            ).map(([key, label, required]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs text-slate-400">{label}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required={required}
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
                step="0.01"
                value={form.discountPercentage}
                onChange={(e) => set("discountPercentage", e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Tax, Commission & Rules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Currency</label>
              <Input
                value={form.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase())}
                maxLength={3}
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
              <label className="text-xs text-slate-400">Commission Rate %</label>
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
              <label className="text-xs text-slate-400">Pricing Rule</label>
              <select
                value={form.pricingRule}
                onChange={(e) => set("pricingRule", e.target.value)}
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white"
              >
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
                <option value="supplier_based">Supplier Based</option>
                <option value="category_based">Category Based</option>
                <option value="brand_based">Brand Based</option>
                <option value="dynamic">Dynamic (future)</option>
              </select>
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
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.taxInclusive}
                  onChange={(e) => set("taxInclusive", e.target.checked)}
                  className="rounded border-slate-700"
                />
                Tax inclusive
              </label>
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
            {loading ? "Saving..." : "Save Pricing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
