"use client";

import * as React from "react";
import { Layers, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { listPricingProfilesAction, createPricingProfileAction, updatePricingProfileAction, deletePricingProfileAction } from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { SectionHeader } from "@/components/workspace/section-header";

type Profile = { id: string; name: string; slug: string; description?: string; markupRules: Array<{channel:string;markupType:string;markupValue:number}>; minMarginPercent: number; roundPriceTo?: number; isDefault: boolean; isActive: boolean; };

export default function PricingProfilesPage(): React.ReactElement {
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Profile | null>(null);
  const [form, setForm] = React.useState<{name:string;slug:string;description:string;minMarginPercent:number;roundPriceTo:number;isDefault:boolean;markupRules:Array<{channel:string;markupType:string;markupValue:number}>}>({ name: "", slug: "", description: "", minMarginPercent: 5, roundPriceTo: 1, isDefault: false, markupRules: [{ channel: "retail", markupType: "percentage", markupValue: 40 }] });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listPricingProfilesAction();
    if (res.success) setProfiles((res.data ?? []) as Profile[]);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", description: "", minMarginPercent: 5, roundPriceTo: 1, isDefault: false, markupRules: [{ channel: "retail", markupType: "percentage", markupValue: 40 }] }); setDialogOpen(true); };
  const openEdit = (p: Profile) => { setEditing(p); setForm({ name: p.name, slug: p.slug, description: p.description ?? "", minMarginPercent: p.minMarginPercent, roundPriceTo: p.roundPriceTo ?? 1, isDefault: p.isDefault, markupRules: p.markupRules }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) { await updatePricingProfileAction(editing.id, form); toast.success("Profile updated"); }
      else { await createPricingProfileAction({ ...form, discountRules: [] }); toast.success("Profile created"); }
      setDialogOpen(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    try { await deletePricingProfileAction(id); toast.success("Deleted"); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const addRule = () => setForm({ ...form, markupRules: [...form.markupRules, { channel: "retail", markupType: "percentage", markupValue: 30 }] });
  const updateRule = (i: number, field: string, value: any) => {
    const rules = [...form.markupRules];
    (rules[i] as any)[field] = value;
    setForm({ ...form, markupRules: rules });
  };
  const removeRule = (i: number) => setForm({ ...form, markupRules: form.markupRules.filter((_, idx) => idx !== i) });

  const columns: DataTableColumn<Profile>[] = [
    { id: "name", header: "Profile", cell: (r) => (
      <div className="flex items-center gap-2">
        <div className="font-medium">{r.name}</div>
        {r.isDefault && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
      </div>
    )},
    { id: "channels", header: "Channels", cell: (r) => (
      <div className="flex gap-1 flex-wrap">{r.markupRules.map((mr) => <Badge key={mr.channel} variant="soft" size="xs">{mr.channel}: {mr.markupValue}%</Badge>)}</div>
    )},
    { id: "minMargin", header: "Min মার্জিন", hideOnMobile: true, cell: (r) => <span>{r.minMarginPercent}%</span> },
    { id: "actions", header: "", cell: (r) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => openEdit(r)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => handleDelete(r.id)} className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Pricing Profiles" description="পুনর্ব্যবহারযোগ্য প্রোফাইল — Standard, Premium, Budget, Wholesale, Reseller সহ" icon={Layers}
        action={<Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> Create Profile</Button>}
      />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-4">
        {profiles.slice(0, 8).map((p) => (
          <Card key={p.id} className={`hover:border-primary/40 ${p.isDefault ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">{p.name}</span>
                {p.isDefault && <Star className="h-3 w-3 text-warning fill-warning" />}
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">{p.markupRules.map((r) => `${r.channel}: ${r.markupValue}%`).join(", ")}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <DataTable columns={columns} data={profiles} loading={loading} emptyTitle="No profiles" emptyDescription="Create reusable pricing profiles to apply consistent markup rules across products." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Profile" : "Create Pricing Profile"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Profile Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Standard" /></FormField>
              <FormField label="Slug" required><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="standard" /></FormField>
            </div>
            <FormField label="Description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" /></FormField>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Markup Rules</span>
                <Button variant="outline" size="sm" onClick={addRule}><Plus className="h-3 w-3" /> Add</Button>
              </div>
              {form.markupRules.map((rule, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <select value={rule.channel} onChange={(e) => updateRule(i, "channel", e.target.value)}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs">
                    {["retail","wholesale","reseller","distributor"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={rule.markupType} onChange={(e) => updateRule(i, "markupType", e.target.value)}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs">
                    <option value="percentage">%</option>
                    <option value="fixed_amount">৳</option>
                  </select>
                  <Input type="number" value={rule.markupValue} onChange={(e) => updateRule(i, "markupValue", Number(e.target.value))} className="h-8 text-xs" />
                  {form.markupRules.length > 1 && (
                    <button onClick={() => removeRule(i)} className="h-8 w-8 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-md"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Margin %"><Input type="number" value={form.minMarginPercent} onChange={(e) => setForm({ ...form, minMarginPercent: Number(e.target.value) })} /></FormField>
              <FormField label="Round To">
                <select value={form.roundPriceTo} onChange={(e) => setForm({ ...form, roundPriceTo: Number(e.target.value) })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm">
                  {[1, 5, 10, 50, 100, 500].map((v) => <option key={v} value={v}>Nearest {v}</option>)}
                </select>
              </FormField>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded border-border" />
              Set as default profile
            </label>
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
