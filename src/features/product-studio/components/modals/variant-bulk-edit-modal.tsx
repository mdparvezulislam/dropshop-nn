"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FormField } from "@/shared/components/forms/form-field";
import { Layers, DollarSign, Warehouse, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { ExtendedVariantRow } from "../../types/studio-types";

export interface VariantBulkEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApplyBulkEdit: (changes: {
    price?: number;
    stock?: number;
    status?: "active" | "draft" | "disabled";
    priceModifier?: number; // e.g. +10% or -5%
  }) => void;
}

export function VariantBulkEditModal({
  open,
  onOpenChange,
  selectedCount,
  onApplyBulkEdit,
}: VariantBulkEditModalProps): React.ReactElement {
  const [bulkPrice, setBulkPrice] = React.useState("");
  const [bulkStock, setBulkStock] = React.useState("");
  const [bulkStatus, setBulkStatus] = React.useState<"" | "active" | "draft" | "disabled">("");

  const handleApply = () => {
    const priceNum = parseFloat(bulkPrice);
    const stockNum = parseInt(bulkStock);

    onApplyBulkEdit({
      price: !isNaN(priceNum) ? priceNum : undefined,
      stock: !isNaN(stockNum) ? stockNum : undefined,
      status: bulkStatus || undefined,
    });

    toast.success(`Applied bulk updates to ${selectedCount} variants`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Layers className="h-4 w-4 text-primary" /> Bulk Variant Operations ({selectedCount} Selected)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <FormField label="Set Price for Selected (৳)">
            <Input
              type="number"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              placeholder="Leave blank to keep existing"
              className="font-mono text-xs"
            />
          </FormField>

          <FormField label="Set Stock Quantity for Selected">
            <Input
              type="number"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              placeholder="Leave blank to keep existing"
              className="font-mono text-xs"
            />
          </FormField>

          <FormField label="Set Status for Selected">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as any)}
              className="h-9.5 w-full rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            >
              <option value="">Do not change status</option>
              <option value="active">Active (Available)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="disabled">Disabled</option>
            </select>
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="gap-1 font-bold shadow-xs" onClick={handleApply}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Apply to {selectedCount} Variants
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
