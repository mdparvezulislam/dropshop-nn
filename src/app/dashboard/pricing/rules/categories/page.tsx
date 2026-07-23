"use client";

import * as React from "react";
import { Tags, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listCategoryOverridesAction, createCategoryOverrideAction, updateCategoryOverrideAction, deleteCategoryOverrideAction } from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { SectionHeader } from "@/components/workspace/section-header";

type Override = { id: string; categoryId: string; categoryName: string; markupType: string; markupValue: number; minMarginPercent?: number; maxDiscountPercent?: number; isActive: boolean; };

export default function CategoryPricingPage(): React.ReactElement {
  const [overrides, setOverrides] = React.useState<Override[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Override | null>(null);
  const [form, setForm] = React.useState({ categoryId: "", categoryName: "", markupType: "percentage" as const, markupValue: 30, minMarginPercent: 5, maxDiscountPercent: 50 });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listCategoryOverridesAction();
    if (res.success) setOverrides((res.data ?? []) as Override[]);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ categoryId: "", categoryName: "", markupType: "percentage", markupValue: 30, minMarginPercent: 5, maxDiscountPercent: 50 }); setDialogOpen(true); };
  const openEdit = (r: Override) => { setEditing(r); setForm({ categoryId: r.categoryId, categoryName: r.categoryName, markupType: r.markupType as any, markupValue: r.markupValue, minMarginPercent: r.minMarginPercent ?? 5, maxDiscountPercent: r.maxDiscountPercent ?? 50 }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) { await updateCategoryOverrideAction(editing.id, form); toast.success("Category pricing updated"); }
      else { await createCategoryOverrideAction(form); toast.success("Category pricing created"); }
      setDialogOpen(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCategoryOverrideAction(id); toast.success("Deleted"); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const columns: DataTableColumn<Override>[] = [
    { id: "name", header: "Category", cell: (r) => <div className="font-medium">{r.categoryName}</div> },
    { id: "markup", header: "মার্কআপ", cell: (r) => <span className="font-semibold">{r.markupType === "percentage" ? `${r.markupValue}%` : `৳${r.markupValue}`}</span> },
    { id: "minMargin", header: "Min মার্জিন", cell: (r) => <span>{r.minMarginPercent ?? "-"}%</span> },
    { id: "maxDisc", header: "Max Discount", cell: (r) => <span>{r.maxDiscountPercent ?? 100}%</span> },
    { id: "status", header: "", cell: (r) => <Badge variant={r.isActive ? "success" : "muted"} size="xs">{r.isActive ? "Active" : "Inactive"}</Badge> },
    { id: "actions", header: "", cell: (r) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => openEdit(r)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => handleDelete(r.id)} className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Category Pricing" description="ক্যাটাগরি অনুযায়ী মূল্য নির্ধারণ — Power Bank, Speaker, Earbuds সহ সব ক্যাটাগরি" icon={Tags}
        action={<Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> Add Category Rule</Button>}
      />
      <DataTable columns={columns} data={overrides} loading={loading} emptyTitle="No category overrides" emptyDescription="Set different pricing rules for different product categories." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Category Pricing" : "Add Category Pricing"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="Category ID" required><Input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} placeholder="ObjectId" /></FormField>
            <FormField label="Category Name" required><Input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} placeholder="e.g. Power Bank" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Markup Type">
                <select value={form.markupType} onChange={(e) => setForm({ ...form, markupType: e.target.value as any })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </FormField>
              <FormField label="Markup Value" required><Input type="number" value={form.markupValue} onChange={(e) => setForm({ ...form, markupValue: Number(e.target.value) })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Margin %"><Input type="number" value={form.minMarginPercent} onChange={(e) => setForm({ ...form, minMarginPercent: Number(e.target.value) })} /></FormField>
              <FormField label="Max Discount %"><Input type="number" value={form.maxDiscountPercent} onChange={(e) => setForm({ ...form, maxDiscountPercent: Number(e.target.value) })} /></FormField>
            </div>
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
