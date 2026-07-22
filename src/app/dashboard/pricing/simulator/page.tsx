"use client";

import * as React from "react";
import { Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";
import { simulatePricingAction, listPricingProfilesAction } from "@/features/pricing/actions/pricing-engine-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FormField } from "@/shared/components/forms/form-field";
import { Badge } from "@/shared/components/ui/badge";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";

export default function PricingSimulatorPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(false);
  const [profiles, setProfiles] = React.useState<Array<{id:string;name:string}>>([]);
  const [form, setForm] = React.useState({ costPrice: 1000, quantity: 1, categoryId: "", brandId: "", profileId: "", role: "customer" as const });
  const [result, setResult] = React.useState<{
    retailPrice: number; wholesalePrice: number; resellerPrice: number;
    distributorPrice: number; campaignPrice?: number;
    profit: number; margin: number; netProfit: number; roundedPrice: number;
  } | null>(null);

  React.useEffect(() => {
    listPricingProfilesAction().then((res) => {
      if (res.success) setProfiles((res.data ?? []) as any[]);
    });
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await simulatePricingAction(form);
      if (res.success && res.data) setResult(res.data);
      else toast.error("Simulation failed");
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Pricing Simulator" description="লাইভ মূল্য নির্ধারণ সিমুলেটর — খরচ, মার্কআপ ও লাভ তাৎক্ষণিক গণনা" icon={Calculator} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Input Parameters <span className="text-xs font-normal text-muted-foreground">প্যারামিটার</span></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Cost Price (খরচ মূল্য)" required>
              <Input type="number" min={0} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} placeholder="e.g. 1000" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Quantity">
                <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </FormField>
              <FormField label="Role">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                  <option value="customer">Customer (Retail)</option>
                  <option value="wholesaler">Wholesale</option>
                  <option value="reseller">Reseller</option>
                  <option value="distributor">Distributor</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category ID">
                <Input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} placeholder="Optional" />
              </FormField>
              <FormField label="Brand ID">
                <Input value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} placeholder="Optional" />
              </FormField>
            </div>
            <FormField label="Pricing Profile">
              <select value={form.profileId} onChange={(e) => setForm({ ...form, profileId: e.target.value })}
                className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                <option value="">Default profile</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
            <Button onClick={handleSimulate} loading={loading} className="w-full gap-2">
              <Calculator className="h-4 w-4" /> Calculate Prices
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {result ? (
            <>
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-5">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Cost Basis (খরচ)</div>
                  <div className="text-2xl font-bold">{formatCentsToCurrency(form.costPrice * 100, "BDT")}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">লাভ</div>
                      <div className="text-lg font-semibold text-success">{formatCentsToCurrency(result.profit * 100, "BDT")}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">মার্জিন</div>
                      <div className="text-lg font-semibold text-info">{result.margin.toFixed(1)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Retail", value: result.retailPrice, role: "customer" },
                  { label: "Wholesale", value: result.wholesalePrice, role: "wholesale" },
                  { label: "Reseller", value: result.resellerPrice, role: "reseller" },
                  { label: "Distributor", value: result.distributorPrice, role: "distributor" },
                ].map((tier) => (
                  <Card key={tier.role} className={`${form.role === tier.role.toLowerCase() ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
                    <CardContent className="p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{tier.label}</div>
                      <div className="text-xl font-bold mt-0.5">{formatCentsToCurrency(tier.value * 100, "BDT")}</div>
                      {result && <div className="text-[10px] text-muted-foreground mt-0.5">{result.margin.toFixed(1)}% margin</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {result.campaignPrice && (
                <Card className="border-warning/30 bg-warning/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div><span className="text-xs font-semibold text-muted-foreground">Campaign Price</span>
                    <div className="text-lg font-bold text-warning">{formatCentsToCurrency(result.campaignPrice * 100, "BDT")}</div></div>
                    <Badge variant="warning">Flash Sale</Badge>
                  </CardContent>
                </Card>
              )}

              <Card className="border-info/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rounded Price</span>
                    <span className="font-bold">{formatCentsToCurrency(result.roundedPrice * 100, "BDT")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Net Profit (নিট মুনাফা)</span>
                    <span className="font-bold text-success">{formatCentsToCurrency(result.netProfit * 100, "BDT")}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">Enter parameters & calculate</p>
                <p className="text-xs text-muted-foreground/70 mt-1">See live pricing for all channels</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
