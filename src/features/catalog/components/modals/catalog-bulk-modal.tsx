"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Layers, DollarSign, Warehouse, CheckCircle2 } from "lucide-react";
import { bulkUpdateProductsAction } from "../../actions/product-catalog-actions";
import { toast } from "sonner";

export interface CatalogBulkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onComplete: () => void;
}

export function CatalogBulkModal({
  open,
  onOpenChange,
  selectedIds,
  onComplete,
}: CatalogBulkModalProps): React.ReactElement {
  const [status, setStatus] = React.useState<"" | "active" | "draft" | "archived">("");
  const [priceType, setPriceType] = React.useState<"none" | "percent_add" | "percent_sub" | "fixed">("none");
  const [priceValue, setPriceValue] = React.useState("");
  const [stockType, setStockType] = React.useState<"none" | "set" | "add" | "sub">("none");
  const [stockValue, setStockValue] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      const priceValNum = parseFloat(priceValue);
      const stockValNum = parseInt(stockValue);

      const res = await bulkUpdateProductsAction(selectedIds, {
        status: status || undefined,
        priceAdjustment: priceType !== "none" && !isNaN(priceValNum) ? { type: priceType as any, value: priceValNum } : undefined,
        stockAdjustment: stockType !== "none" && !isNaN(stockValNum) ? { type: stockType as any, value: stockValNum } : undefined,
      });

      if (res.success) {
        toast.success(`Succesfully updated ${res.updatedCount || selectedIds.length} products!`);
        onComplete();
        onOpenChange(false);
      } else {
        toast.error(res.error || "Bulk update failed");
      }
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Layers className="h-4 w-4 text-primary" /> বাল্ক আপডেট (Bulk Operations: {selectedIds.length} Items)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {/* Status Update */}
          <FormField label="Update Status for Selected">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-9.5 w-full rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            >
              <option value="">Do not change status</option>
              <option value="active">Publish / Active (সক্রিয়)</option>
              <option value="draft">Draft (খসড়া)</option>
              <option value="archived">Archive (আর্কাইভ)</option>
            </select>
          </FormField>

          {/* Bulk Price Adjustment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Bulk Price Modification Engine</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as any)}
                className="h-9.5 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground"
              >
                <option value="none">No Price Change</option>
                <option value="percent_add">Increase Price (+ %)</option>
                <option value="percent_sub">Decrease Price (- %)</option>
                <option value="fixed">Set Fixed BDT Price</option>
              </select>
              <Input
                type="number"
                disabled={priceType === "none"}
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                placeholder="Value (e.g. 10)"
                className="h-9.5 font-mono text-xs"
              />
            </div>
          </div>

          {/* Bulk Stock Adjustment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Bulk Stock Inventory Engine</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={stockType}
                onChange={(e) => setStockType(e.target.value as any)}
                className="h-9.5 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground"
              >
                <option value="none">No Stock Change</option>
                <option value="set">Set Fixed Stock Quantity</option>
                <option value="add">Add Stock (+ pcs)</option>
                <option value="sub">Subtract Stock (- pcs)</option>
              </select>
              <Input
                type="number"
                disabled={stockType === "none"}
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                placeholder="Pcs (e.g. 50)"
                className="h-9.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="gap-1 font-bold shadow-xs" onClick={handleApply} disabled={submitting}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Apply to {selectedIds.length} Products
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
