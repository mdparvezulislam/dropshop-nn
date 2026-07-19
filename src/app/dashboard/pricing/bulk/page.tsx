"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  bulkUpdatePricesAction,
  bulkUpdateSupplierPricesAction,
} from "@/features/pricing/actions/pricing-actions";
import { toast } from "sonner";
import { ArrowLeft, Layers, Plus, Trash2 } from "lucide-react";
import { currencyToCents } from "@/shared/utils/currency-utils";

type BulkRow = {
  productId: string;
  variantSku: string;
  sellingPrice: string;
  wholesalePrice: string;
  supplierPrice: string;
};

const emptyRow = (): BulkRow => ({
  productId: "",
  variantSku: "",
  sellingPrice: "",
  wholesalePrice: "",
  supplierPrice: "",
});

export default function BulkPricingPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"sell" | "supplier">("sell");
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<BulkRow[]>([emptyRow(), emptyRow()]);

  const updateRow = (index: number, key: keyof BulkRow, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validRows = rows.filter((r) => r.productId.trim());
      if (validRows.length === 0) {
        toast.error("Add at least one product row");
        return;
      }

      if (mode === "sell") {
        const res = await bulkUpdatePricesAction({
          items: validRows.map((r) => ({
            productId: r.productId.trim(),
            variantSku: r.variantSku.trim() || undefined,
            sellingPrice: r.sellingPrice ? currencyToCents(Number(r.sellingPrice)) : undefined,
            wholesalePrice: r.wholesalePrice
              ? currencyToCents(Number(r.wholesalePrice))
              : undefined,
          })),
        });
        if (res.success) {
          toast.success(`Updated ${res.data?.length ?? 0} sell prices`);
          router.push("/dashboard/pricing");
        } else {
          toast.error(res.error || "Bulk update failed");
        }
      } else {
        const res = await bulkUpdateSupplierPricesAction({
          items: validRows.map((r) => ({
            productId: r.productId.trim(),
            variantSku: r.variantSku.trim() || undefined,
            supplierPrice: currencyToCents(Number(r.supplierPrice || 0)),
          })),
        });
        if (res.success) {
          toast.success(`Updated ${res.data?.length ?? 0} supplier prices`);
          router.push("/dashboard/pricing");
        } else {
          toast.error(res.error || "Bulk update failed");
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bulk update failed");
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-400" /> Bulk Pricing Update
          </h1>
          <p className="text-sm text-slate-400">
            Update sell prices or supplier costs across multiple SKUs
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("sell")}
          className={`h-9 rounded-md px-4 text-sm transition-colors ${
            mode === "sell"
              ? "bg-indigo-600 text-white"
              : "border border-slate-700 text-slate-300 hover:bg-slate-900"
          }`}
        >
          Sell Prices
        </button>
        <button
          type="button"
          onClick={() => setMode("supplier")}
          className={`h-9 rounded-md px-4 text-sm transition-colors ${
            mode === "supplier"
              ? "bg-indigo-600 text-white"
              : "border border-slate-700 text-slate-300 hover:bg-slate-900"
          }`}
        >
          Supplier Prices
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg">Update Rows</CardTitle>
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
              className="flex h-8 items-center gap-1 rounded-md border border-slate-700 px-3 text-xs text-slate-300 hover:bg-slate-800"
            >
              <Plus className="h-3 w-3" /> Add Row
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end border border-slate-800 rounded-lg p-3"
              >
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Product ID *</label>
                  <Input
                    value={row.productId}
                    onChange={(e) => updateRow(index, "productId", e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    placeholder="ObjectId"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Variant SKU</label>
                  <Input
                    value={row.variantSku}
                    onChange={(e) => updateRow(index, "variantSku", e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                {mode === "sell" ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Selling</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.sellingPrice}
                        onChange={(e) => updateRow(index, "sellingPrice", e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Wholesale</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.wholesalePrice}
                        onChange={(e) => updateRow(index, "wholesalePrice", e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 lg:col-span-2">
                    <label className="text-xs text-slate-400">Supplier Price *</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.supplierPrice}
                      onChange={(e) => updateRow(index, "supplierPrice", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  disabled={rows.length <= 1}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-slate-700 text-rose-400 hover:bg-rose-950/30 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/pricing"
            className="flex h-10 items-center rounded-md border border-slate-700 px-4 text-sm text-slate-300 hover:bg-slate-900"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {loading ? "Updating..." : "Apply Bulk Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
