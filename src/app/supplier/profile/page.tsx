"use client";

import * as React from "react";
import { toast } from "sonner";
import { Building2, User, Phone, Mail, MapPin, Save, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/workspace/page-header";
import { Spinner } from "@/components/ui/spinner";

export default function SupplierProfilePage(): React.ReactElement {
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
      <PageHeader title="Company Profile" description="Manage your business information" />

      <form onSubmit={handleSave} className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-xs">
                Business Name
              </Label>
              <Input id="businessName" placeholder="Your business name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessType" className="text-xs">
                Business Type
              </Label>
              <Input id="businessType" placeholder="e.g. Manufacturer, Importer, Distributor" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs">
                Business Description
              </Label>
              <Input id="description" placeholder="Brief description of your business" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs">
                Website
              </Label>
              <Input id="website" type="url" placeholder="https://example.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Documents &amp; Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tradeLicense" className="text-xs">
                Trade License Number
              </Label>
              <Input id="tradeLicense" placeholder="Enter trade license" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bin" className="text-xs">
                BIN / VAT Number
              </Label>
              <Input id="bin" placeholder="Enter BIN or VAT number" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tin" className="text-xs">
                TIN Number
              </Label>
              <Input id="tin" placeholder="Enter TIN number" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson" className="text-xs">
                Contact Person
              </Label>
              <Input id="contactPerson" placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">
                  Phone
                </Label>
                <Input id="phone" type="tel" placeholder="01XXXXXXXXX" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Address
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">
                Business Address
              </Label>
              <Input id="address" placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs">
                  City
                </Label>
                <Input id="city" placeholder="City" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district" className="text-xs">
                  District
                </Label>
                <Input id="district" placeholder="District" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bankName" className="text-xs">
                  Bank Name
                </Label>
                <Input id="bankName" placeholder="Bank name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="branch" className="text-xs">
                  Branch
                </Label>
                <Input id="branch" placeholder="Branch name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="accountName" className="text-xs">
                  Account Name
                </Label>
                <Input id="accountName" placeholder="Account holder name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountNumber" className="text-xs">
                  Account Number
                </Label>
                <Input id="accountNumber" placeholder="Account number" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="routingNumber" className="text-xs">
                Routing Number
              </Label>
              <Input id="routingNumber" placeholder="Routing number" />
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
