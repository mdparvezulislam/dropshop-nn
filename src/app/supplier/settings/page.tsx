"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bell,
  Globe,
  Package,
  Save,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/workspace/page-header";
import { Spinner } from "@/components/ui/spinner";

export default function SupplierSettingsPage(): React.ReactElement {
  const [saving, setSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Settings saved");
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader title="Settings" description="Configure your business preferences" />

      <form onSubmit={handleSave} className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Order &amp; Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Auto-accept Orders</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Automatically accept incoming orders</span>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Allow Backorders</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accept orders for out-of-stock items</span>
                <Switch />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="processingTime" className="text-xs">Processing Time (days)</Label>
              <Input id="processingTime" type="number" min="1" defaultValue="2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shippingTime" className="text-xs">Shipping Time (days)</Label>
              <Input id="shippingTime" type="number" min="1" defaultValue="3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" /> Return &amp; Warranty
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="returnPolicy" className="text-xs">Return Policy</Label>
              <Input id="returnPolicy" placeholder="e.g. 7 days, 30 days" defaultValue="7 days" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="warrantyDays" className="text-xs">Warranty Period (days)</Label>
              <Input id="warrantyDays" type="number" min="0" defaultValue="0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">New order notifications</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low stock alerts</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment confirmations</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Purchase order updates</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">বাংলা</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Currency</Label>
              <Select defaultValue="bdt">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bdt">BDT (৳)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex justify-end">
          <Button type="submit" className="gap-1.5" disabled={saving}>
            {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
