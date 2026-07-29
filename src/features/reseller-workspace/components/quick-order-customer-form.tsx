"use client";

import * as React from "react";
import { User, Phone, MapPin, CheckCircle2, History, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DistrictSelect } from "@/components/website/checkout/district-select";
import { ThanaSelect } from "@/components/website/checkout/thana-select";
import { BD_DISTRICTS, type BdDistrict } from "@/config/bd-districts";

export interface CustomerFormData {
  phone: string;
  name: string;
  districtId: string;
  district: string;
  division: string;
  upazila: string;
  fullAddress: string;
  email?: string;
  note?: string;
  customerId?: string;
  isRepeatCustomer?: boolean;
}

export interface QuickOrderCustomerFormProps {
  value: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
}

export function QuickOrderCustomerForm({
  value,
  onChange,
}: QuickOrderCustomerFormProps): React.ReactElement {
  const [lookingUp, setLookingUp] = React.useState(false);
  const [recentCustomers, setRecentCustomers] = React.useState<any[]>([]);
  const [matchedCustomer, setMatchedCustomer] = React.useState<any | null>(null);

  // Load Recent Customers on mount
  React.useEffect(() => {
    async function loadRecent() {
      try {
        const { listCustomersAction } = await import(
          "@/features/customer/actions/customer-actions"
        );
        const res = await listCustomersAction("", 1, 5);
        if (res.success && res.data) {
          setRecentCustomers(res.data);
        }
      } catch {
        // silent fallback
      }
    }
    loadRecent();
  }, []);

  // Phone Lookup & Auto-fill
  const handlePhoneChange = async (phoneInput: string) => {
    const nextData = { ...value, phone: phoneInput };
    onChange(nextData);

    const cleanDigits = phoneInput.replace(/\D/g, "");
    if (cleanDigits.length >= 10) {
      setLookingUp(true);
      try {
        const { lookupCustomerByPhoneAction } = await import(
          "@/features/customer/actions/customer-actions"
        );
        const res = await lookupCustomerByPhoneAction(phoneInput);
        if (res.success && res.data) {
          const match = res.data;
          setMatchedCustomer(match);

          const distName = match.district || value.district || "Dhaka";
          const matchedBdDist =
            BD_DISTRICTS.find(
              (d) =>
                d.name.toLowerCase() === distName.toLowerCase() ||
                d.nameEn.toLowerCase() === distName.toLowerCase(),
            ) || BD_DISTRICTS[0];

          onChange({
            ...value,
            phone: phoneInput,
            name: match.name || value.name,
            districtId: matchedBdDist.id,
            district: matchedBdDist.name,
            division: matchedBdDist.division,
            upazila: match.upazila || value.upazila || "",
            fullAddress: match.address || value.fullAddress || "",
            email: match.email || value.email,
            customerId: match.id,
            isRepeatCustomer: true,
          });

          toast.success(`কাস্টমারের তথ্য অটো-ফিল করা হয়েছে: ${match.name}`);
        } else {
          setMatchedCustomer(null);
        }
      } catch {
        setMatchedCustomer(null);
      } finally {
        setLookingUp(false);
      }
    } else {
      setMatchedCustomer(null);
    }
  };

  const handlePickRecent = (c: any) => {
    const addr = c.addresses?.[0] || {};
    const distName = addr.city || addr.district || "Dhaka";
    const matchedBdDist = BD_DISTRICTS.find(
      (d) => d.name.toLowerCase() === distName.toLowerCase() || d.nameEn.toLowerCase() === distName.toLowerCase()
    ) || BD_DISTRICTS[0];

    onChange({
      phone: c.phone || "",
      name: c.name || "",
      districtId: matchedBdDist.id,
      district: matchedBdDist.name,
      division: matchedBdDist.division,
      upazila: addr.upazila || "",
      fullAddress: addr.addressLine1 || addr.fullAddress || "",
      email: c.email || "",
      customerId: c.id || c._id,
      isRepeatCustomer: true,
    });
    setMatchedCustomer(c);
    toast.success(`কাস্টমার ফিলআপ সম্পন্ন: ${c.name}`);
  };

  const handleDistrictChange = (bdDist: BdDistrict) => {
    onChange({
      ...value,
      districtId: bdDist.id,
      district: bdDist.name,
      division: bdDist.division,
      upazila: "", // reset upazila when district changes
    });
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardContent className="p-2.5 sm:p-5 space-y-2.5 sm:space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" /> ২. কাস্টমারের ঠিকানা ও তথ্য
          </label>
          {matchedCustomer && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[9px] font-black uppercase">
              <CheckCircle2 className="w-3 h-3" /> Repeat Customer
            </span>
          )}
        </div>

        {/* Recent Customers Quick Selectors */}
        {recentCustomers.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <History className="w-3 h-3 text-primary" /> রিসেন্ট কাস্টমার নির্বাচন করুন:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {recentCustomers.map((c) => (
                <button
                  key={c.id || c._id}
                  type="button"
                  onClick={() => handlePickRecent(c)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-border bg-muted/40 hover:bg-muted text-foreground whitespace-nowrap transition-colors"
                >
                  {c.name || "Customer"} ({c.phone?.slice(-4)})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Phone Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800 flex items-center justify-between">
              <span>মোবাইল নম্বর <span className="text-rose-500">*</span></span>
              {lookingUp && <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />}
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={value.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full h-10 sm:h-11 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800">
              কাস্টমারের নাম <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                placeholder="যেমন: মোহাম্মদ রহিম"
                className="w-full h-10 sm:h-11 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* District Searchable Select (64 Districts) */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800">
              জেলা (District) <span className="text-rose-500">*</span>
            </label>
            <DistrictSelect
              value={value.districtId || "dhaka"}
              onChange={handleDistrictChange}
              placeholder="জেলা খুঁজুন বা নির্বাচন করুন..."
            />
          </div>

          {/* Thana / Upazila Select */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800">
              থানা / উপজেলা (Upazila) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
            </label>
            <ThanaSelect
              districtId={value.districtId || "dhaka"}
              value={value.upazila || ""}
              onChange={(thana) => onChange({ ...value, upazila: thana })}
              placeholder="থানা / উপজেলা নির্বাচন করুন..."
            />
          </div>

          {/* Full Delivery Address Textarea */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-black text-slate-800 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" /> সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={value.fullAddress}
              onChange={(e) => onChange({ ...value, fullAddress: e.target.value })}
              placeholder="বাসা নং, রোড নং, এলাকা ও ল্যান্ডমার্ক লিখুন..."
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Email & Note */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800">
              ইমেইল (ঐচ্ছিক)
            </label>
            <input
              type="email"
              value={value.email || ""}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
              placeholder="customer@gmail.com"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800">
              অর্ডার নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={value.note || ""}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              placeholder="যেমন: কল দিয়ে ডেলিভারি দিন"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
