"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createInventoryAction } from "@/features/inventory/actions/inventory-actions";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function NewInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    productId: "",
    variantSku: "",
    warehouseId: "",
    availableStock: "0",
    reservedStock: "0",
    incomingStock: "0",
    damagedStock: "0",
    returnedStock: "0",
    safetyStock: "0",
    reorderLevel: "0",
    lowStockThreshold: "5",
    allowPreOrder: false,
    allowBackorder: false,
    status: "active",
  });

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createInventoryAction({
        productId: form.productId.trim(),
        variantSku: form.variantSku.trim() || undefined,
        warehouseId: form.warehouseId.trim() || undefined,
        availableStock: Number(form.availableStock) || 0,
        reservedStock: Number(form.reservedStock) || 0,
        incomingStock: Number(form.incomingStock) || 0,
        damagedStock: Number(form.damagedStock) || 0,
        returnedStock: Number(form.returnedStock) || 0,
        safetyStock: Number(form.safetyStock) || 0,
        reorderLevel: Number(form.reorderLevel) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        allowPreOrder: form.allowPreOrder,
        allowBackorder: form.allowBackorder,
        status: form.status as "active" | "inactive" | "frozen",
      });

      if (res.success) {
        toast.success("Inventory created successfully");
        router.push("/dashboard/inventory");
      } else {
        toast.error(res.error || "Failed to create inventory");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/inventory"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Inventory</h1>
          <p className="text-sm text-slate-400">
            Initialize stock levels for a product (warehouse-ready)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Product Reference</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
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
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Warehouse ID (optional)</label>
              <Input
                value={form.warehouseId}
                onChange={(e) => set("warehouseId", e.target.value)}
                placeholder="Future multi-warehouse"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Stock Levels</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["availableStock", "Available"],
                ["reservedStock", "Reserved"],
                ["incomingStock", "Incoming"],
                ["damagedStock", "Damaged"],
                ["returnedStock", "Returned"],
                ["safetyStock", "Safety Stock"],
                ["reorderLevel", "Reorder Level"],
                ["lowStockThreshold", "Low Stock Threshold"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs text-slate-400">{label}</label>
                <Input
                  type="number"
                  min="0"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Availability Options</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowPreOrder}
                onChange={(e) => set("allowPreOrder", e.target.checked)}
                className="rounded border-slate-700"
              />
              Allow Pre-Order when out of stock
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowBackorder}
                onChange={(e) => set("allowBackorder", e.target.checked)}
                className="rounded border-slate-700"
              />
              Allow Backorder
            </label>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Link
            href="/dashboard/inventory"
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
            {loading ? "Saving..." : "Save Inventory"}
          </Button>
        </div>
      </form>
    </div>
  );
}
