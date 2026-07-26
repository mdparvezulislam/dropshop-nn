"use client";

import * as React from "react";
import { Shield, Plus, Pencil, Trash2, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  listGlobalRulesAction,
  createGlobalRuleAction,
  updateGlobalRuleAction,
  deleteGlobalRuleAction,
} from "@/features/pricing/actions/pricing-engine-actions";
import { ListLayout } from "@/components/workspace/list-layout";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { SectionHeader } from "@/components/workspace/section-header";

type Rule = {
  id: string;
  name: string;
  channel: string;
  markupType: string;
  markupValue: number;
  minMarginPercent?: number;
  maxDiscount?: number;
  isActive: boolean;
  priority: number;
  roundPriceTo?: number;
};

const CHANNELS = ["retail", "wholesale", "reseller", "distributor", "vip_reseller", "marketplace"];

export default function GlobalRulesPage(): React.ReactElement {
  const [rules, setRules] = React.useState<Rule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Rule | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    channel: "retail",
    markupType: "percentage",
    markupValue: 40,
    minMarginPercent: 5,
    maxDiscount: 70,
    roundPriceTo: 1,
    priority: 100,
    isActive: true,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listGlobalRulesAction();
    if (res.success) setRules((res.data ?? []) as Rule[]);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      channel: "retail",
      markupType: "percentage",
      markupValue: 40,
      minMarginPercent: 5,
      maxDiscount: 70,
      roundPriceTo: 1,
      priority: 100,
      isActive: true,
    });
    setDialogOpen(true);
  };
  const openEdit = (r: Rule) => {
    setEditing(r);
    setForm({
      name: r.name,
      channel: r.channel,
      markupType: r.markupType,
      markupValue: r.markupValue,
      minMarginPercent: r.minMarginPercent ?? 5,
      maxDiscount: r.maxDiscount ?? 70,
      roundPriceTo: r.roundPriceTo ?? 1,
      priority: r.priority,
      isActive: r.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateGlobalRuleAction(editing.id, form);
        toast.success("Rule updated");
      } else {
        await createGlobalRuleAction(form);
        toast.success("Rule created");
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGlobalRuleAction(id);
      toast.success("Rule deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: DataTableColumn<Rule>[] = [
    {
      id: "name",
      header: "Rule Name",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.name}</div>
          <Badge variant={r.isActive ? "success" : "muted"} size="xs">
            {r.isActive ? "Active" : "Draft"}
          </Badge>
        </div>
      ),
    },
    {
      id: "channel",
      header: "Channel",
      cell: (r) => (
        <Badge variant="soft" size="sm">
          {r.channel.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "markup",
      header: "মার্কআপ",
      cell: (r) => (
        <span className="font-semibold tabular-nums">
          {r.markupType === "percentage" ? `${r.markupValue}%` : `${r.markupValue}`}
        </span>
      ),
    },
    {
      id: "minMargin",
      header: "Min মার্জিন",
      hideOnMobile: true,
      cell: (r) => <span>{r.minMarginPercent ?? "-"}%</span>,
    },
    {
      id: "maxDiscount",
      header: "Max Discount",
      hideOnMobile: true,
      cell: (r) => <span>{r.maxDiscount ?? 100}%</span>,
    },
    {
      id: "priority",
      header: "Priority",
      hideOnMobile: true,
      cell: (r) => <span className="font-mono text-xs">{r.priority}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(r)}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Global Pricing Rules"
        description="বৈশ্বিক মূল্য নির্ধারণ — Retail, Wholesale, Reseller, Distributor মার্কআপ কনফিগার করুন"
        icon={Shield}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Create Rule
          </Button>
        }
      />

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-4">
        {CHANNELS.map((ch) => (
          <div key={ch} className="rounded-xl border border-border/80 bg-card p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {ch.replace(/_/g, " ")}
            </div>
            <div className="mt-1 text-lg font-bold">
              {rules.filter((r) => r.channel === ch && r.isActive).length > 0
                ? `${rules.filter((r) => r.channel === ch && r.isActive)[0].markupValue}%`
                : "—"}
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rules}
        loading={loading}
        emptyTitle="No global rules"
        emptyDescription="Create your first global pricing rule to set channel-level markups."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Rule" : "Create Global Pricing Rule"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="Rule Name" required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Standard Retail Markup"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Channel" required>
                <select
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Markup Type">
                <select
                  value={form.markupType}
                  onChange={(e) => setForm({ ...form, markupType: e.target.value })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Markup Value" required>
                <Input
                  type="number"
                  value={form.markupValue}
                  onChange={(e) => setForm({ ...form, markupValue: Number(e.target.value) })}
                  placeholder={form.markupType === "percentage" ? "e.g. 40" : "e.g. 500"}
                />
              </FormField>
              <FormField label="Round To">
                <select
                  value={form.roundPriceTo}
                  onChange={(e) => setForm({ ...form, roundPriceTo: Number(e.target.value) })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm"
                >
                  {[1, 5, 10, 50, 100, 500, 1000].map((v) => (
                    <option key={v} value={v}>
                      Nearest {v}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Margin %">
                <Input
                  type="number"
                  value={form.minMarginPercent}
                  onChange={(e) => setForm({ ...form, minMarginPercent: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Max Discount %">
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Priority">
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Status">
                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Draft</option>
                </select>
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? "Update Rule" : "Create Rule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
