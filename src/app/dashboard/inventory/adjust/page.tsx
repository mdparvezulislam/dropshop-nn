"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adjustStockAction } from "@/features/inventory/actions/inventory-actions";
import { toast } from "sonner";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

function StockAdjustmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get("id") || "";
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    inventoryId: presetId,
    operation: "stock_in",
    quantity: "1",
    absoluteAvailable: "",
    reason: "",
    referenceId: "",
    notes: "",
  });

  React.useEffect(() => {
    if (presetId) {
      setForm((prev) => ({ ...prev, inventoryId: presetId }));
    }
  }, [presetId]);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adjustStockAction({
        inventoryId: form.inventoryId.trim(),
        operation: form.operation as
          "stock_in" | "stock_out" | "adjustment" | "reservation" | "release" | "transfer",
        quantity: Number(form.quantity),
        absoluteAvailable:
          form.operation === "adjustment" && form.absoluteAvailable
            ? Number(form.absoluteAvailable)
            : undefined,
        reason: form.reason.trim() || undefined,
        referenceId: form.referenceId.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });

      if (res.success) {
        toast.success(
          `Stock ${form.operation.replace("_", " ")} applied. Available: ${res.data?.inventory.availableStock}`,
        );
        router.push("/dashboard/inventory");
      } else {
        toast.error(res.error || "Adjustment failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Operation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs text-muted-foreground">Inventory ID *</label>
            <Input
              required
              value={form.inventoryId}
              onChange={(e) => set("inventoryId", e.target.value)}
              placeholder="Inventory record ObjectId"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Operation *</label>
            <select
              value={form.operation}
              onChange={(e) => set("operation", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="stock_in">Stock In</option>
              <option value="stock_out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
              <option value="reservation">Reservation</option>
              <option value="release">Release</option>
              <option value="transfer">Transfer (source side)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Quantity *</label>
            <Input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
            />
          </div>
          {form.operation === "adjustment" && (
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs text-muted-foreground">
                Absolute Available (optional — sets exact level)
              </label>
              <Input
                type="number"
                min="0"
                value={form.absoluteAvailable}
                onChange={(e) => set("absoluteAvailable", e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Reason</label>
            <Input
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              placeholder="e.g. Supplier restock"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Reference ID</label>
            <Input
              value={form.referenceId}
              onChange={(e) => set("referenceId", e.target.value)}
              placeholder="PO / Order / Ticket"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs text-muted-foreground">Notes</label>
            <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
        <p>
          <span className="text-foreground font-medium">Stock In</span> — increases available;
          reduces incoming when present.
        </p>
        <p>
          <span className="text-foreground font-medium">Reservation</span> — moves available →
          reserved (order hold ready).
        </p>
        <p>
          <span className="text-foreground font-medium">Transfer</span> — deducts source warehouse;
          full multi-warehouse transfer ships later.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
        <Link
          href="/dashboard/inventory"
          className="flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {loading ? "Applying..." : "Apply Adjustment"}
        </Button>
      </div>
    </form>
  );
}

export default function StockAdjustmentPage() {
  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/inventory"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" /> Stock Adjustment
          </h1>
          <p className="text-sm text-muted-foreground">
            Stock in, out, reserve, release, adjust, or prepare transfer
          </p>
        </div>
      </div>

      <React.Suspense
        fallback={
          <div className="text-sm text-slate-400 animate-pulse">Loading adjustment form...</div>
        }
      >
        <StockAdjustmentForm />
      </React.Suspense>
    </div>
  );
}
