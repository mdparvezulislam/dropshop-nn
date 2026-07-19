"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { updateResellerAction } from "@/features/reseller/actions/reseller-actions";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function EditResellerPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    businessName: "Nova Retail Hub",
    ownerName: "Farhana Akter",
    contactPerson: "Farhana Akter",
    email: "farhana@novaretail.com",
    phone: "+8801711002200",
    businessType: "Sole Proprietorship",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Gulshan",
    area: "Gulshan-2",
    postalCode: "1212",
    fullAddress: "House 12, Road 45, Gulshan-2, Dhaka",
    country: "Bangladesh",
  });

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateResellerAction(id, {
        businessName: form.businessName,
        ownerName: form.ownerName,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        businessType: form.businessType,
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
      if (res.success) {
        toast.success("Reseller updated");
        router.push(`/dashboard/resellers/${id}`);
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/resellers/${id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Reseller</h1>
          <p className="text-sm text-slate-400">Update profile details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["businessName", "Business Name"],
                ["ownerName", "Owner"],
                ["contactPerson", "Contact"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["businessType", "Business Type"],
                ["division", "Division"],
                ["district", "District"],
                ["upazila", "Upazila"],
                ["area", "Area"],
                ["postalCode", "Postal Code"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs text-slate-400">{label}</label>
                <Input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs text-slate-400">Full Address</label>
              <Input
                value={form.fullAddress}
                onChange={(e) => set("fullAddress", e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link
            href={`/dashboard/resellers/${id}`}
            className="flex h-10 items-center rounded-md border border-slate-700 px-4 text-sm text-slate-300"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
