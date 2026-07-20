"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { NumberInput } from "@/shared/components/forms/number-input";
import { FormField } from "@/shared/components/forms/form-field";
import { Badge } from "@/shared/components/ui/badge";
import { StudioSection } from "../studio-layout";

export interface InventorySectionProps {
  sku: string;
  onSkuChange: (v: string) => void;
  barcode: string;
  onBarcodeChange: (v: string) => void;
  stock: string;
  onStockChange: (v: string) => void;
  lowStockThreshold: string;
  onLowStockThresholdChange: (v: string) => void;
}

export function InventorySection({
  sku, onSkuChange,
  barcode, onBarcodeChange,
  stock, onStockChange,
  lowStockThreshold, onLowStockThresholdChange,
}: InventorySectionProps): React.ReactElement {
  const stockNum = parseInt(stock) || 0;
  const threshold = parseInt(lowStockThreshold) || 5;
  const isLow = stockNum > 0 && stockNum <= threshold;

  return (
    <StudioSection id="inventory" title="Inventory" description="Stock levels, SKU tracking, and alerts">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Variant SKU" hint="Unique identifier">
          <Input value={sku} onChange={(e) => onSkuChange(e.target.value)} placeholder="SKU-001" className="font-mono" />
        </FormField>
        <FormField label="Barcode">
          <Input value={barcode} onChange={(e) => onBarcodeChange(e.target.value)} placeholder="UPC / EAN" className="font-mono" />
        </FormField>
        <FormField label="Stock quantity" hint="Available units">
          <NumberInput value={stock} onChange={onStockChange} />
        </FormField>
        <FormField label="Low stock threshold" hint="Alert when at or below">
          <NumberInput value={lowStockThreshold} onChange={onLowStockThresholdChange} />
        </FormField>
      </div>

      {stockNum > 0 ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Status:</span>
          {isLow ? (
            <Badge variant="warning">Low stock ({stockNum} remaining)</Badge>
          ) : (
            <Badge variant="success">In stock ({stockNum} available)</Badge>
          )}
        </div>
      ) : null}
    </StudioSection>
  );
}
