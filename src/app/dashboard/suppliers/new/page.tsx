"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { createSupplierAction } from "@/features/supplier/actions/supplier-actions";
import { toast } from "sonner";
import Link from "next/link";

export default function NewSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const [businessName, setBusinessName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [businessType, setBusinessType] = React.useState("Sole Proprietorship");
  const [tradeLicense, setTradeLicense] = React.useState("");

  const [division, setDivision] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [upazila, setUpazila] = React.useState("");
  const [fullAddress, setFullAddress] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        businessName,
        ownerName,
        contactPerson,
        email,
        phone,
        businessType,
        tradeLicenseNumber: tradeLicense,
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
        contacts: [
          {
            name: contactPerson,
            role: "Primary Contact",
            email,
            phone,
            isPrimary: true,
            isEmergency: false,
          },
        ],
      };

      const res = await createSupplierAction(payload);
      if (res.success) {
        toast.success("Supplier onboarded successfully!");
        router.push("/dashboard/suppliers");
      } else {
        toast.error("Failed to onboard supplier.");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid form fields. Please double check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white flex justify-center items-center">
      <div className="w-full max-w-2xl">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Onboard Dropship Supplier</CardTitle>
            <CardDescription className="text-slate-400">
              Register a new partner, set initial profiles, and define pickup parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Business Name</label>
                  <Input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Business Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="LTD">LTD / Joint Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Owner Name</label>
                  <Input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Contact Person</label>
                  <Input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Email Address</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Phone Number</label>
                  <Input
                    type="text"
                    required
                    placeholder="+8801xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Trade License Number</label>
                <Input
                  type="text"
                  required
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h3 className="text-lg font-semibold text-white">Address Details</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Division</label>
                    <Input
                      type="text"
                      required
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">District</label>
                    <Input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Upazila</label>
                    <Input
                      type="text"
                      required
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Full Business Address
                  </label>
                  <Input
                    type="text"
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : "Onboard Supplier"}
                </Button>
                <Link
                  href="/dashboard/suppliers"
                  className="flex h-10 w-32 items-center justify-center rounded-md border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
