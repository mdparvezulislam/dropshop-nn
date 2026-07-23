"use client";

import * as React from "react";
import { DollarSign, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Badge } from "@/components/ui/badge";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";
import { cn } from "@/lib/utils/cn";

const REASONS = [
  { value: "supplier_price_increased", label: "Supplier Price Increased" },
  { value: "supplier_price_decreased", label: "Supplier Price Decreased" },
  { value: "new_shipment", label: "New Shipment" },
  { value: "import_cost_updated", label: "Import Cost Updated" },
  { value: "manual_correction", label: "Manual Correction" },
  { value: "currency_adjustment", label: "Currency Adjustment" },
  { value: "promotion", label: "Promotion" },
  { value: "replacement_supplier", label: "Replacement Supplier" },
  { value: "other", label: "Other" },
];

const EXPENSE_FIELDS = [
  { key: "importCost", label: "Import Cost" },
  { key: "shippingCost", label: "Shipping Cost" },
  { key: "packagingCost", label: "Packaging Cost" },
  { key: "handlingCost", label: "Handling Cost" },
  { key: "otherExpenses", label: "Other Expenses" },
];

interface PriceImpact {
  retailPrice: number;
  wholesalePrice: number;
  resellerPrice: number;
  profit: number;
  margin: number;
}

interface Props {
  productId: string;
  productName: string;
  currentCost: number;
  currentLandedCost: number;
  currency: string;
  currentSellingPrice?: number;
  currentProfit?: number;
  currentMargin?: number;
  onSaved?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function CostQuickUpdate({
  productId, productName, currentCost, currentLandedCost, currency,
  currentSellingPrice, currentProfit, currentMargin,
  onSaved, onCancel, className,
}: Props): React.ReactElement {
  const [saving, setSaving] = React.useState(false);
  const [newCost, setNewCost] = React.useState(currentCost);
  const [reason, setReason] = React.useState("");
  const [reasonText, setReasonText] = React.useState("");
  const [supplierName, setSupplierName] = React.useState("");
  const [supplierSku, setSupplierSku] = React.useState("");
  const [expenses, setExpenses] = React.useState<Record<string, number>>({
    importCost: 0, shippingCost: 0, packagingCost: 0, handlingCost: 0, otherExpenses: 0,
  });
  const [priceImpact, setPriceImpact] = React.useState<PriceImpact | null>(null);
  const [calculating, setCalculating] = React.useState(false);

  const landedCost = newCost +
    Object.values(expenses).reduce((a, b) => a + b, 0);

  const diff = newCost - currentCost;
  const diffPct = currentCost > 0 ? Math.round((diff / currentCost) * 10000) / 100 : 0;

  React.useEffect(() => {
    if (newCost !== currentCost && newCost > 0 && !calculating) {
      setCalculating(true);
      const timer = setTimeout(async () => {
        try {
          const { simulatePricingAction } = await import("@/features/pricing/actions/pricing-engine-actions");
          const res = await simulatePricingAction({ costPrice: landedCost, quantity: 1, role: "customer" });
          if (res.success && res.data) setPriceImpact(res.data);
        } catch { /* silent */ }
        finally { setCalculating(false); }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPriceImpact(null);
    }
  }, [newCost, landedCost, currentCost, calculating]);

  const handleSave = async () => {
    if (!newCost || newCost <= 0) { toast.error("Cost price is required"); return; }
    if (!reason) { toast.error("কারণ নির্বাচন করুন (Reason is required)"); return; }

    setSaving(true);
    try {
      const { createCostVersionAction } = await import("../../actions/cost-actions");
      const res = await createCostVersionAction({
        productId,
        costPrice: newCost,
        currency,
        supplier: {
          supplierName: supplierName || undefined,
          supplierSku: supplierSku || undefined,
        },
        importCost: expenses.importCost,
        shippingCost: expenses.shippingCost,
        packagingCost: expenses.packagingCost,
        handlingCost: expenses.handlingCost,
        otherExpenses: expenses.otherExpenses,
        reason,
        reasonText: reasonText || undefined,
      });
      if (res.success) {
        toast.success("খরচ সংরক্ষণ করা হয়েছে (Cost saved)");
        onSaved?.();
      } else {
        toast.error(res.error ?? "Save failed");
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Update Cost — {productName}
        </CardTitle>
        {onCancel && (
          <button onClick={onCancel} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="বর্তমান খরচ" hint="Current Cost">
            <div className="h-9.5 flex items-center px-3 rounded-lg border border-input bg-muted/50 text-sm font-semibold">
              {formatCentsToCurrency(currentCost, currency)}
            </div>
          </FormField>
          <FormField label="Current Landed Cost">
            <div className="h-9.5 flex items-center px-3 rounded-lg border border-input bg-muted/50 text-sm font-semibold">
              {formatCentsToCurrency(currentLandedCost, currency)}
            </div>
          </FormField>
        </div>

        <FormField label="নতুন খরচ (New Cost) *" required>
          <Input type="number" min={0} value={newCost} onChange={(e) => setNewCost(Number(e.target.value))} placeholder="Enter new cost price" />
        </FormField>

        {diff !== 0 && (
          <div className={cn("rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-2",
            diff > 0 ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
          )}>
            {diff > 0 ? "↑" : "↓"} {formatCentsToCurrency(Math.abs(diff), currency)} ({diffPct > 0 ? "+" : ""}{diffPct}%) from current
          </div>
        )}

        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">Additional Expenses</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EXPENSE_FIELDS.map((f) => (
              <FormField key={f.key} label={f.label}>
                <Input type="number" min={0} value={expenses[f.key]} onChange={(e) => setExpenses({ ...expenses, [f.key]: Number(e.target.value) })} />
              </FormField>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
          <span className="font-semibold">Landed Cost</span>
          <span className="font-bold font-mono">{formatCentsToCurrency(landedCost, currency)}</span>
        </div>

        <FormField label="কারণ (Reason) *" required>
          <select value={reason} onChange={(e) => setReason(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
            <option value="">Select reason...</option>
            {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </FormField>

        <FormField label="Reason Details (optional)">
          <Input value={reasonText} onChange={(e) => setReasonText(e.target.value)} placeholder="Additional details..." />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Supplier Name"><Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Optional" /></FormField>
          <FormField label="Supplier SKU"><Input value={supplierSku} onChange={(e) => setSupplierSku(e.target.value)} placeholder="Optional" /></FormField>
        </div>

        {priceImpact && (
          <Card className="border-info/20 bg-info/5">
            <CardContent className="p-3 space-y-1.5">
              <div className="text-[11px] font-semibold text-info flex items-center gap-1">
                {calculating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                Price Impact Preview
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Suggested Retail:</span> <span className="font-semibold">{formatCentsToCurrency(priceImpact.retailPrice, currency)}</span></div>
                <div><span className="text-muted-foreground">Suggested Wholesale:</span> <span className="font-semibold">{formatCentsToCurrency(priceImpact.wholesalePrice, currency)}</span></div>
                <div><span className="text-muted-foreground">Suggested Profit:</span> <span className="font-semibold">{formatCentsToCurrency(priceImpact.profit, currency)}</span></div>
                <div><span className="text-muted-foreground">Suggested Margin:</span> <span className="font-semibold">{priceImpact.margin.toFixed(1)}%</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} loading={saving} disabled={!newCost || !reason} className="flex-1 gap-2">
            <DollarSign className="h-4 w-4" /> সংরক্ষণ করুন
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
