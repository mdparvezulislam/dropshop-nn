"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createResellerAction } from "@/features/reseller/actions/reseller-actions";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function NewResellerPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    businessName: "",
    ownerName: "",
    contactPerson: "",
    email: "",
    phone: "",
    alternativePhone: "",
    businessType: "Sole Proprietorship",
    nidNumber: "",
    tradeLicenseNumber: "",
    country: "Bangladesh",
    division: "",
    district: "",
    upazila: "",
    area: "",
    postalCode: "",
    fullAddress: "",
    notes: "",
  });

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createResellerAction({
        businessName: form.businessName.trim(),
        ownerName: form.ownerName.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        alternativePhone: form.alternativePhone.trim() || undefined,
        businessType: form.businessType,
        nidNumber: form.nidNumber.trim() || undefined,
        tradeLicenseNumber: form.tradeLicenseNumber.trim() || undefined,
        notes: form.notes.trim() || undefined,
        address: {
          country: form.country,
          division: form.division,
          district: form.district,
          upazila: form.upazila,
          area: form.area,
          postalCode: form.postalCode,
          fullAddress: form.fullAddress,
        },
      });

      if (res.success && res.data) {
        toast.success("Reseller onboarded successfully");
        router.push(`/dashboard/resellers/${res.data.id}`);
      } else {
        toast.error(res.error || "Failed to create reseller");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create reseller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/resellers"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Onboard Reseller</h1>
          <p className="text-sm text-slate-400">
            Create a reseller profile — independent from suppliers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["businessName", "Business Name *", true],
                ["ownerName", "Owner Name *", true],
                ["contactPerson", "Contact Person *", true],
                ["email", "Email *", true],
                ["phone", "Phone *", true],
                ["alternativePhone", "Alternative Phone", false],
                ["nidNumber", "NID Number", false],
                ["tradeLicenseNumber", "Trade License", false],
              ] as const
            ).map(([key, label, required]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs text-slate-400">{label}</label>
                <Input
                  required={required}
                  type={key === "email" ? "email" : "text"}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Business Type *</label>
              <select
                value={form.businessType}
                onChange={(e) => set("businessType", e.target.value)}
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white"
              >
                <option>Sole Proprietorship</option>
                <option>Partnership</option>
                <option>LTD</option>
                <option>Individual</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["country", "Country *"],
                ["division", "Division *"],
                ["district", "District *"],
                ["upazila", "Upazila *"],
                ["area", "Area *"],
                ["postalCode", "Postal Code *"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs text-slate-400">{label}</label>
                <Input
                  required
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label className="text-xs text-slate-400">Full Address *</label>
              <Input
                required
                value={form.fullAddress}
                onChange={(e) => set("fullAddress", e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Link
            href="/dashboard/resellers"
            className="flex h-10 items-center justify-center rounded-md border border-slate-700 px-4 text-sm text-slate-300 hover:bg-slate-900"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Create Reseller"}
          </Button>
        </div>
      </form>
    </div>
  );
}
