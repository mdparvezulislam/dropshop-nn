"use client";

import * as React from "react";
import { Layers, ArrowUp, ArrowDown, DollarSign, Target, Percent, Users, ShoppingBag, Building2, Tags } from "lucide-react";
import { toast } from "sonner";
import { bulkPricingOperationAction, listAllPricingForSearchAction } from "@/features/pricing/actions/pricing-engine-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FormField } from "@/shared/components/forms/form-field";
import { Badge } from "@/shared/components/ui/badge";
import { SectionHeader } from "@/shared/components/workspace/section-header";

const operations = [
  { type: "increase_percent" as const, label: "Increase by %", icon: ArrowUp, color: "text-success" },
  { type: "decrease_percent" as const, label: "Decrease by %", icon: ArrowDown, color: "text-destructive" },
  { type: "fixed_amount" as const, label: "Fixed Amount", icon: DollarSign, color: "text-info" },
  { type: "round_price" as const, label: "Round Price", icon: Target, color: "text-warning" },
  { type: "assign_profile" as const, label: "Assign Profile", icon: Layers, color: "text-violet-500" },
];

const filterOptions = [
  { key: "categoryId", label: "Category", icon: Tags },
  { key: "brandId", label: "Brand", icon: ShoppingBag },
  { key: "supplierId", label: "Supplier", icon: Building2 },
];

export default function BulkToolsPage(): React.ReactElement {
  const [filter, setFilter] = React.useState<Record<string, string>>({});
  const [opType, setOpType] = React.useState<string>("increase_percent");
  const [opValue, setOpValue] = React.useState(10);
  const [field, setField] = React.useState("sellingPrice");
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<{updated:number;errors:string[]} | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const bf: Record<string, string | string[]> = {};
      for (const [k, v] of Object.entries(filter)) { if (v.trim()) bf[k] = v.trim(); }
      const res = await bulkPricingOperationAction(bf, { type: opType as any, value: opValue, field: field as any });
      if (res.success && res.data) { setResult(res.data as any); toast.success(`Updated ${(res.data as any).updated} products`); }
      else toast.error("Operation failed");
    } catch (err: any) { toast.error(err.message); }
    finally { setRunning(false); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Bulk Pricing Tools" description="বাল্ক মূল্য আপডেট — ক্যাটাগরি, ব্র্যান্ড, সাপ্লায়ার অনুযায়ী" icon={Layers} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Filter Products <span className="text-xs font-normal text-muted-foreground">ফিল্টার</span></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {filterOptions.map((opt) => (
                <FormField key={opt.key} label={`${opt.label} ID`}>
                  <Input value={filter[opt.key] ?? ""} onChange={(e) => setFilter({ ...filter, [opt.key]: e.target.value })} placeholder={`Filter by ${opt.label.toLowerCase()}`} />
                </FormField>
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Operation Type</div>
              <div className="grid grid-cols-3 gap-2">
                {operations.map((op) => (
                  <button key={op.type} onClick={() => setOpType(op.type)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      opType === op.type ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-muted-foreground/30"
                    }`}>
                    <op.icon className={`h-3.5 w-3.5 ${op.color}`} /> {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Value">
                {opType === "round_price" ? (
                  <select value={opValue} onChange={(e) => setOpValue(Number(e.target.value))}
                    className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                    {[5, 10, 50, 100, 500, 1000].map((v) => <option key={v} value={v}>Nearest {v}</option>)}
                  </select>
                ) : (
                  <Input type="number" value={opValue} onChange={(e) => setOpValue(Number(e.target.value))}
                    placeholder={opType === "increase_percent" ? "e.g. 10" : opType === "fixed_amount" ? "e.g. 500" : "e.g. 5"} />
                )}
              </FormField>
              <FormField label="Target Field">
                <select value={field} onChange={(e) => setField(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                  <option value="sellingPrice">Retail Price</option>
                  <option value="wholesalePrice">Wholesale Price</option>
                  <option value="resellerPrice">Reseller Price</option>
                </select>
              </FormField>
            </div>

            <Button onClick={handleRun} loading={running} className="w-full gap-2">
              <Layers className="h-4 w-4" /> Apply Bulk Operation
            </Button>

            {result && (
              <Card className={result.errors.length > 0 ? "border-warning/30" : "border-success/30"}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Updated: {result.updated}</span>
                    {result.errors.length > 0 && (
                      <Badge variant="warning">{result.errors.length} errors</Badge>
                    )}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-2 text-xs text-destructive max-h-24 overflow-y-auto">
                      {result.errors.slice(0, 5).map((e, i) => <div key={i}>{e}</div>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-sm">MOQ Pricing Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Configure quantity-based pricing tiers:</p>
              {[1, 5, 10, 20, 50, 100].map((qty) => (
                <div key={qty} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-xs font-medium">{qty}+</span>
                  <span className="text-[10px] text-muted-foreground">MOQ tier</span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" disabled>
                <Users className="h-3.5 w-3.5" /> Bulk MOQ Setup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Apply 10% discount on all active products", icon: Percent },
                { label: "Round all prices to nearest 50", icon: Target },
                { label: "Reset all manual overrides to rules", icon: Layers },
              ].map((action, i) => (
                <button key={i} className="w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                  <action.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {action.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
