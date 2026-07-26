"use client";

import * as React from "react";
import { Percent, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  listCampaignsAction,
  createCampaignAction,
  deleteCampaignAction,
} from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { SectionHeader } from "@/components/workspace/section-header";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";

type Campaign = {
  id: string;
  name: string;
  campaignType: string;
  productId: string;
  campaignPrice: number;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  autoRestore: boolean;
};

export default function CampaignPricingPage(): React.ReactElement {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    campaignType: "flash_sale",
    productId: "",
    campaignPrice: 0,
    effectiveFrom: "",
    effectiveTo: "",
    timezone: "Asia/Dhaka",
    autoRestore: true,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listCampaignsAction();
    if (res.success)
      setCampaigns(
        ((res.data ?? []) as any[]).map((c: any) => ({
          ...c,
          effectiveFrom: c.effectiveFrom?.toString() ?? new Date().toISOString(),
          effectiveTo: c.effectiveTo?.toString() ?? new Date().toISOString(),
        })),
      );
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const activeCampaigns = campaigns.filter(
    (c) => c.isActive && new Date(c.effectiveFrom) <= now && new Date(c.effectiveTo) >= now,
  );

  const handleCreate = async () => {
    try {
      await createCampaignAction({
        ...form,
        effectiveFrom: new Date(form.effectiveFrom),
        effectiveTo: new Date(form.effectiveTo),
        variantSku: undefined,
        priority: 100,
        description: undefined,
      });
      toast.success("Campaign created");
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaignAction(id);
      toast.success("Deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: DataTableColumn<Campaign>[] = [
    {
      id: "name",
      header: "Campaign",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.name}</div>
          <Badge variant="soft" size="xs">
            {r.campaignType.replace(/_/g, " ")}
          </Badge>
        </div>
      ),
    },
    {
      id: "price",
      header: "Campaign Price",
      cell: (r) => (
        <span className="font-semibold">{formatCentsToCurrency(r.campaignPrice, "BDT")}</span>
      ),
    },
    {
      id: "from",
      header: "From",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-xs">{new Date(r.effectiveFrom).toLocaleDateString()}</span>
      ),
    },
    {
      id: "to",
      header: "To",
      hideOnMobile: true,
      cell: (r) => <span className="text-xs">{new Date(r.effectiveTo).toLocaleDateString()}</span>,
    },
    {
      id: "status",
      header: "",
      cell: (r) => {
        const n = new Date();
        const f = new Date(r.effectiveFrom);
        const t = new Date(r.effectiveTo);
        const status = !r.isActive
          ? "inactive"
          : n < f
            ? "scheduled"
            : n > t
              ? "expired"
              : "active";
        return (
          <Badge
            variant={status === "active" ? "success" : status === "scheduled" ? "warning" : "muted"}
            size="xs"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
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
        title="Campaign Pricing"
        description="ক্যাম্পেইন মূল্য নির্ধারণ — Flash Sale, Festival, Seasonal ক্যাম্পেইন"
        icon={Percent}
        action={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Campaign
          </Button>
        }
      />
      {activeCampaigns.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {activeCampaigns.slice(0, 4).map((c) => (
            <Card key={c.id} className="border-warning/30 bg-warning/5">
              <CardContent className="p-3 flex items-center gap-3">
                <Zap className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <div className="text-xs font-bold">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatCentsToCurrency(c.campaignPrice, "BDT")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        emptyTitle="No campaigns"
        emptyDescription="Create time-windowed campaign pricing for flash sales and promotions."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="Campaign Name" required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Eid Flash Sale"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Type">
                <select
                  value={form.campaignType}
                  onChange={(e) => setForm({ ...form, campaignType: e.target.value })}
                  className="h-9.5 w-full rounded-lg border border-input bg-card px-3 text-sm"
                >
                  {["campaign", "flash_sale", "festival", "seasonal", "clearance"].map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Product ID" required>
                <Input
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  placeholder="ObjectId"
                />
              </FormField>
            </div>
            <FormField label="Campaign Price (cents)" required>
              <Input
                type="number"
                value={form.campaignPrice}
                onChange={(e) => setForm({ ...form, campaignPrice: Number(e.target.value) })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date" required>
                <Input
                  type="datetime-local"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                />
              </FormField>
              <FormField label="End Date" required>
                <Input
                  type="datetime-local"
                  value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="Timezone">
              <Input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoRestore}
                onChange={(e) => setForm({ ...form, autoRestore: e.target.checked })}
                className="rounded border-border"
              />
              Auto-restore original price after campaign ends
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
