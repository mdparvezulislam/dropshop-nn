"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  User,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Save,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";

export default function WholesaleProfilePage(): React.ReactElement {
  const [saving, setSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Profile updated");
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader title="Business Profile" description="Manage your wholesale account information" />

      <form onSubmit={handleSave} className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-xs">Business Name</Label>
              <Input id="businessName" placeholder="Your business name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessType" className="text-xs">Business Type</Label>
              <Input id="businessType" placeholder="e.g. Retailer, Distributor" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs">Website</Label>
              <Input id="website" type="url" placeholder="https://example.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tradeLicense" className="text-xs">Trade License Number</Label>
              <Input id="tradeLicense" placeholder="Enter trade license" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bin" className="text-xs">BIN / VAT Number</Label>
              <Input id="bin" placeholder="Enter BIN or VAT number" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tin" className="text-xs">TIN Number</Label>
              <Input id="tin" placeholder="Enter TIN number" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson" className="text-xs">Contact Person</Label>
              <Input id="contactPerson" placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone" className="text-xs">Phone</Label>
              <Input id="contactPhone" type="tel" placeholder="01XXXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="text-xs">Email</Label>
              <Input id="contactEmail" type="email" placeholder="email@example.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Business Address
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">Address</Label>
              <Input id="address" placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs">City</Label>
                <Input id="city" placeholder="City" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district" className="text-xs">District</Label>
                <Input id="district" placeholder="District" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex justify-end">
          <Button type="submit" className="gap-1.5" disabled={saving}>
            {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
