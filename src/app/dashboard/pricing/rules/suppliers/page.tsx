"use client";

import * as React from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listSupplierPricingRulesAction, createGlobalRuleAction, updateGlobalRuleAction, deleteGlobalRuleAction } from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { FormField } from "@/shared/components/forms/form-field";
import { SectionHeader } from "@/shared/components/workspace/section-header";

type Rule = { id: string; supplierId: string; supplierName: string; markupType: string; markupValue: number; minMarginPercent?: number; priority: number; leadCost?: number; handlingFee?: number; isActive: boolean; };

export default function SupplierPricingPage(): React.ReactElement {
  const [rules, setRules] = React.useState<Rule[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listSupplierPricingRulesAction();
    if (res.success) setRules((res.data ?? []) as Rule[]);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const columns: DataTableColumn<Rule>[] = [
    { id: "name", header: "Supplier", cell: (r) => <div className="font-medium">{r.supplierName}</div> },
    { id: "markup", header: "মার্কআপ", cell: (r) => <span className="font-semibold">{r.markupType === "percentage" ? `${r.markupValue}%` : `৳${r.markupValue}`}</span> },
    { id: "minMargin", header: "Min মার্জিন", hideOnMobile: true, cell: (r) => <span>{r.minMarginPercent ?? "-"}%</span> },
    { id: "leadCost", header: "Lead Cost", hideOnMobile: true, cell: (r) => <span className="tabular-nums">{r.leadCost ? `৳${r.leadCost}` : "-"}</span> },
    { id: "handling", header: "Handling", hideOnMobile: true, cell: (r) => <span className="tabular-nums">{r.handlingFee ? `৳${r.handlingFee}` : "-"}</span> },
    { id: "status", header: "", cell: (r) => <Badge variant={r.isActive ? "success" : "muted"} size="xs">{r.isActive ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Supplier Pricing" description="সাপ্লায়ার অনুযায়ী মূল্য নির্ধারণ — মার্কআপ ও খরচ কনফিগার করুন" icon={Building2} />
      <DataTable columns={columns} data={rules} loading={loading} emptyTitle="No supplier pricing rules" emptyDescription="Supplier-specific pricing will appear here once configured." />
    </div>
  );
}
