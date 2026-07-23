"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { User, Bell, Save, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/workspace/page-header";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export default function ResellerSettingsPage(): React.ReactElement {
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [businessName, setBusinessName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [code, setCode] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const { getMyResellerProfileAction } = await import(
          "@/features/reseller/actions/reseller-actions"
        );
        const res = await getMyResellerProfileAction();
        if (res.success && res.data) {
          const r = res.data as any;
          setBusinessName(r.businessName ?? "");
          setOwnerName(r.ownerName ?? "");
          setEmail(r.email ?? "");
          setPhone(r.phone ?? "");
          setContactPerson(r.contactPerson ?? "");
          setStatus(r.status ?? "");
          setCode(r.code ?? "");
        } else {
          toast.error(res.error ?? "Could not load shop profile");
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { updateMyResellerProfileAction } = await import(
        "@/features/reseller/actions/reseller-actions"
      );
      const res = await updateMyResellerProfileAction({
        businessName,
        ownerName,
        email,
        phone,
        contactPerson: contactPerson || ownerName,
      });
      if (res.success) toast.success("Shop profile saved");
      else toast.error(res.error ?? "Save failed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader
        title="Shop Settings"
        description="Manage your reseller business profile"
        actions={
          code ? (
            <Badge variant="outline" className="font-mono">
              {code}
            </Badge>
          ) : undefined
        }
      />

      <form onSubmit={handleSave} className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 text-primary" /> Business profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {status && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Status{" "}
                <Badge variant="outline" className="capitalize">
                  {status}
                </Badge>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-xs">
                Business name
              </Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerName" className="text-xs">
                Owner name
              </Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson" className="text-xs">
                Contact person
              </Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" /> Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <p className="text-xs text-muted-foreground">
              Channel preferences are managed in your account preference center (Notification
              Engine).
            </p>
            <Link href="/account/notifications">
              <Button type="button" variant="outline" size="sm">
                Open notification preferences
              </Button>
            </Link>
            <div className="flex items-center justify-between opacity-60">
              <span className="text-sm">Order updates</span>
              <Switch checked disabled aria-readonly />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end lg:col-span-2">
          <Button type="submit" className="gap-1.5" disabled={saving}>
            {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save shop profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
