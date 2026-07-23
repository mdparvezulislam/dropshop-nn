"use client";

import * as React from "react";
import { ShoppingBag, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listBrandOverridesAction, createBrandOverrideAction, updateBrandOverrideAction, deleteBrandOverrideAction } from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { SectionHeader } from "@/components/workspace/section-header";

type Override = { id: string; brandId: string; brandName: string; channel: string; markupType: string; markupValue: number; minProfitPercent?: number; maxDiscountPercent?: number; isActive: boolean; };

export default function BrandPricingPage(): React.ReactElement {
  const [overrides, setOverrides] = React.useState<Override[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Override | null>(null);
  const [form, setForm] = React.useState({ brandId: "", brandName: "", channel: "retail", markupType: "percentage" as const, markupValue: 35, minProfitPercent: 5, maxDiscountPercent: 60 });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listBrandOverridesAction();
    if (res.success) setOverrides((res.data ?? []) as Override[]);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ brandId: "", brandName: "", channel: "retail", markupType: "percentage", markupValue: 35, minProfitPercent: 5, maxDiscountPercent: 60 }); setDialogOpen(true); };
  const openEdit = (r: Override) => { setEditing(r); setForm({ brandId: r.brandId, brandName: r.brandName, channel: r.channel, markupType: r.markupType as any, markupValue: r.markupValue, minProfitPercent: r.minProfitPercent ?? 5, maxDiscountPercent: r.maxDiscountPercent ?? 60 }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) { await updateBrandOverrideAction(editing.id, form); toast.success("Brand pricing updated"); }
      else { await createBrandOverrideAction(form); toast.success("Brand pricing created"); }
      setDialogOpen(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteBrandOverrideAction(id); toast.success("Deleted"); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const columns: DataTableColumn<Override>[] = [
    { id: "name", header: "Brand", cell: (r) => <div className="font-medium">{r.brandName}</div> },
    { id: "channel", header: "Channel", cell: (r) => <Badge variant="soft" size="xs">{r.channel}</Badge> },
    { id: "markup", header: "মার্কআপ", cell: (r) => <span className="font-semibold">{r.markupType === "percentage" ? `${r.markupValue}%` : `৳${r.markupValue}`}</span> },
    { id: "minProfit", header: "Min লাভ", hideOnMobile: true, cell: (r) => <span>{r.minProfitPercent ?? "-"}%</span> },
    { id: "maxDisc", header: "Max Discount", hideOnMobile: true, cell: (r) => <span>{r.maxDiscountPercent ?? 100}%</span> },
    { id: "actions", header: "", cell: (r) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => openEdit(r)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => handleDelete(r.id)} className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Brand Pricing" description="ব্র্যান্ড অনুযায়ী মূল্য নির্ধারণ — Baseus, Xiaomi, Joyroom, Hoco সহ সব ব্র্যান্ড" icon={ShoppingBag}
        action={<Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> Add Brand Rule</Button>}
      />
      <DataTable columns={columns} data={overrides} loading={loading} emptyTitle="No brand overrides" emptyDescription="Configure per-brand pricing rules for your catalog." />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Brand Pricing" : "Add Brand Pricing"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="Brand ID" required><Input value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} placeholder="ObjectId" /></FormField>
            <FormField label="Brand Name" required><Input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} placeholder="e.g. Baseus" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Channel">
                <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                  {["retail","wholesale","reseller","distributor"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Markup Type">
                <select value={form.markupType} onChange={(e) => setForm({ ...form, markupType: e.target.value as any })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Markup Value" required><Input type="number" value={form.markupValue} onChange={(e) => setForm({ ...form, markupValue: Number(e.target.value) })} /></FormField>
              <FormField label="Min Profit %"><Input type="number" value={form.minProfitPercent} onChange={(e) => setForm({ ...form, minProfitPercent: Number(e.target.value) })} /></FormField>
            </div>
            <FormField label="Max Discount %"><Input type="number" value={form.maxDiscountPercent} onChange={(e) => setForm({ ...form, maxDiscountPercent: Number(e.target.value) })} /></FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
