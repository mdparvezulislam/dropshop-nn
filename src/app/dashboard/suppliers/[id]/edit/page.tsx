"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  getSupplierByIdAction,
  updateSupplierAction,
} from "@/features/supplier/actions/supplier-actions";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

const CATEGORIES = [
  "manufacturer",
  "importer",
  "wholesaler",
  "distributor",
  "local_vendor",
  "dropshipping_partner",
] as const;

const BUSINESS_TYPES = ["Sole Proprietorship", "Partnership", "LTD", "LLC", "Nonprofit"];

export default function EditSupplierPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [businessName, setBusinessName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [alternativePhone, setAlternativePhone] = React.useState("");
  const [businessType, setBusinessType] = React.useState("Sole Proprietorship");
  const [supplierCategory, setSupplierCategory] = React.useState<string>("local_vendor");
  const [tradeLicense, setTradeLicense] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [facebook, setFacebook] = React.useState("");
  const [whatsApp, setWhatsApp] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);

  const [division, setDivision] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [upazila, setUpazila] = React.useState("");
  const [fullAddress, setFullAddress] = React.useState("");

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSupplierByIdAction(id).then((res) => {
      if (res.success && res.data) {
        const s = res.data as any;
        setBusinessName(s.businessName ?? "");
        setOwnerName(s.ownerName ?? "");
        setContactPerson(s.contactPerson ?? "");
        setEmail(s.email ?? "");
        setPhone(s.phone ?? "");
        setAlternativePhone(s.alternativePhone ?? "");
        setBusinessType(s.businessType ?? "Sole Proprietorship");
        setSupplierCategory(s.supplierCategory ?? "local_vendor");
        setTradeLicense(s.tradeLicenseNumber ?? "");
        setWebsite(s.website ?? "");
        setFacebook(s.facebook ?? "");
        setWhatsApp(s.whatsApp ?? "");
        setDescription(s.description ?? "");
        setTags(s.tags ?? []);
        setDivision(s.address?.division ?? "");
        setDistrict(s.address?.district ?? "");
        setUpazila(s.address?.upazila ?? "");
        setFullAddress(s.address?.fullAddress ?? "");
      } else {
        toast.error("Failed to load supplier");
      }
      setLoading(false);
    });
  }, [id]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        businessName,
        ownerName,
        contactPerson,
        email,
        phone,
        alternativePhone: alternativePhone || undefined,
        website: website || undefined,
        facebook: facebook || undefined,
        whatsApp: whatsApp || undefined,
        description: description || undefined,
        businessType,
        supplierCategory: supplierCategory as any,
        tradeLicenseNumber: tradeLicense,
        tags: tags.length > 0 ? tags : undefined,
        address: {
          country: "Bangladesh",
          division,
          district,
          upazila,
          area: upazila,
          postalCode: "1000",
          fullAddress,
          pickupAddress: fullAddress,
          returnAddress: fullAddress,
        },
      };

      const res = await updateSupplierAction(id, payload);
      if (res.success) {
        toast.success("Supplier details updated successfully!");
        router.push(`/dashboard/suppliers/${id}`);
      } else {
        toast.error(res.error ?? "Failed to update supplier.");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid form fields. Please double check inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Spinner size="lg" />
          <span>Loading supplier data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/dashboard/suppliers/${id}`}
            className="p-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Supplier</h1>
            <p className="text-sm text-slate-400">
              Modify partner settings and registration profiles
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Business Information</CardTitle>
              <CardDescription className="text-slate-400">
                Legal name, ownership, and registration details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-indigo-500"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    required
                    placeholder="+8801xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Alternative Phone</Label>
                  <Input
                    placeholder="+8801xxxxxxxxx"
                    value={alternativePhone}
                    onChange={(e) => setAlternativePhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trade License Number</Label>
                  <Input
                    required
                    value={tradeLicense}
                    onChange={(e) => setTradeLicense(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Supplier Category</Label>
                  <select
                    value={supplierCategory}
                    onChange={(e) => setSupplierCategory(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    placeholder="https://"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    placeholder="Page name or URL"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    placeholder="+8801xxxxxxxxx"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  placeholder="Brief description of the supplier business…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag…"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag} className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="hover:text-indigo-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Address Details</CardTitle>
              <CardDescription className="text-slate-400">
                Business location, pickup, and return points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Input required value={division} onChange={(e) => setDivision(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input required value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Upazila</Label>
                  <Input required value={upazila} onChange={(e) => setUpazila(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full Business Address</Label>
                <Input
                  required
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Link
              href={`/dashboard/suppliers/${id}`}
              className="flex h-10 w-32 items-center justify-center rounded-md border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium min-w-[160px]"
            >
              {saving ? <Spinner size="sm" className="mr-2" /> : null}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
