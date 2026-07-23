"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/forms/number-input";
import { FormField } from "@/components/forms/form-field";
import { Badge } from "@/components/ui/badge";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Warehouse, Boxes, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface InventorySectionProps {
  sku: string;
  onSkuChange: (v: string) => void;
  barcode: string;
  onBarcodeChange: (v: string) => void;
  stock: string;
  onStockChange: (v: string) => void;
  lowStockThreshold: string;
  onLowStockThresholdChange: (v: string) => void;
  reservedStock?: string;
  onReservedStockChange?: (v: string) => void;
  incomingStock?: string;
  onIncomingStockChange?: (v: string) => void;
  warehouseLocation?: string;
  onWarehouseLocationChange?: (v: string) => void;
  weight?: string;
  onWeightChange?: (v: string) => void;
}

export function InventorySection({
  sku, onSkuChange,
  barcode, onBarcodeChange,
  stock, onStockChange,
  lowStockThreshold, onLowStockThresholdChange,
  reservedStock = "0", onReservedStockChange,
  incomingStock = "0", onIncomingStockChange,
  warehouseLocation = "Central DHAKA-WH1", onWarehouseLocationChange,
  weight = "0.5", onWeightChange,
}: InventorySectionProps): React.ReactElement {
  const stockNum = parseInt(stock) || 0;
  const reservedNum = parseInt(reservedStock) || 0;
  const incomingNum = parseInt(incomingStock) || 0;
  const threshold = parseInt(lowStockThreshold) || 5;

  const isOutOfStock = stockNum <= 0;
  const isLow = stockNum > 0 && stockNum <= threshold;

  const statusBadge = isOutOfStock ? (
    <Badge variant="destructive" size="xs" className="gap-1 font-bold">
      <XCircle className="h-3 w-3" /> Out of Stock
    </Badge>
  ) : isLow ? (
    <Badge variant="warning" size="xs" className="gap-1 font-bold">
      <AlertTriangle className="h-3 w-3" /> Low Stock ({stockNum} left)
    </Badge>
  ) : (
    <Badge variant="success" size="xs" className="gap-1 font-bold">
      <CheckCircle2 className="h-3 w-3" /> In Stock ({stockNum} available)
    </Badge>
  );

  return (
    <StudioCollapsibleSection
      id="inventory"
      title="Inventory & Warehouse Studio"
      description="Real-time stock tracking, reserved allocation, reorder thresholds, and warehouse location"
      defaultExpanded={true}
      badge={statusBadge}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Available Stock" required hint="Current physical quantity">
          <NumberInput value={stock} onChange={onStockChange} />
        </FormField>
        <FormField label="Reserved Stock" hint="Allocated for pending orders">
          <NumberInput value={reservedStock} onChange={onReservedStockChange || (() => {})} />
        </FormField>
        <FormField label="Incoming Shipment" hint="In-transit purchase orders">
          <NumberInput value={incomingStock} onChange={onIncomingStockChange || (() => {})} />
        </FormField>

        <FormField label="Reorder Threshold" hint="Triggers low-stock alert">
          <NumberInput value={lowStockThreshold} onChange={onLowStockThresholdChange} />
        </FormField>
        <FormField label="Warehouse Location">
          <Input
            value={warehouseLocation}
            onChange={(e) => onWarehouseLocationChange && onWarehouseLocationChange(e.target.value)}
            placeholder="e.g. Dhaka Central WH-01"
            className="font-mono text-xs"
          />
        </FormField>
        <FormField label="Package Weight (kg)">
          <Input
            value={weight}
            onChange={(e) => onWeightChange && onWeightChange(e.target.value)}
            placeholder="0.5"
            className="font-mono text-xs"
          />
        </FormField>
      </div>

      {/* Live Inventory Summary Card */}
      <Card className="border border-border bg-accent/30 p-4 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <span className="flex items-center gap-1.5"><Warehouse className="h-3.5 w-3.5 text-primary" /> Live Warehouse Allocation</span>
          {statusBadge}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-lg border border-border bg-card">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Available</p>
            <p className="text-base font-extrabold font-mono text-foreground">{stockNum} pcs</p>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-card">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Reserved</p>
            <p className="text-base font-extrabold font-mono text-warning">{reservedNum} pcs</p>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-card">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Incoming</p>
            <p className="text-base font-extrabold font-mono text-info">+{incomingNum} pcs</p>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-card">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Alert Threshold</p>
            <p className="text-base font-extrabold font-mono text-muted-foreground">≤ {threshold} pcs</p>
          </div>
        </div>
      </Card>
    </StudioCollapsibleSection>
  );
}
