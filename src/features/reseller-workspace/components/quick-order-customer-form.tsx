"use client";

import * as React from "react";
import { User, Phone, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AddressParserService } from "@/features/address/services/address-parser-service";
import { CitySearchSelect } from "@/shared/components/address/city-search-select";

export interface CustomerFormData {
  phone: string;
  name: string;
  districtId?: string;
  district?: string;
  division?: string;
  upazila?: string;
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
  const addressTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [lookingUp, setLookingUp] = React.useState(false);
  const [recentCustomers, setRecentCustomers] = React.useState<any[]>([]);

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

    const clean = phoneInput.replace(/\D/g, "");
    if (clean.length >= 11) {
      setLookingUp(true);
      try {
        const { listCustomersAction } = await import(
          "@/features/customer/actions/customer-actions"
        );
        const res = await listCustomersAction(clean, 1, 1);
        if (res.success && res.data && res.data.length > 0) {
          const cust = res.data[0];
          onChange({
            ...value,
            phone: phoneInput,
            name: cust.name || value.name,
            fullAddress: cust.address || value.fullAddress,
            district: cust.district || value.district,
            upazila: cust.upazila || value.upazila,
            customerId: cust._id,
            isRepeatCustomer: true,
          });
        }
      } catch {
        // silent fallback
      } finally {
        setLookingUp(false);
      }
    }
  };

  const handleSelectRecent = (c: any) => {
    onChange({
      ...value,
      phone: c.phone || value.phone,
      name: c.name || value.name,
      fullAddress: c.address || value.fullAddress,
      district: c.district || value.district,
      upazila: c.upazila || value.upazila,
      customerId: c._id,
      isRepeatCustomer: true,
    });
  };

  const handleAddressChange = (fullAddressInput: string) => {
    // Automatically parse address on the fly to detect Dhaka/Outside delivery fee
    const parsed = AddressParserService.parseAddress(fullAddressInput);
    onChange({
      ...value,
      fullAddress: fullAddressInput,
      district: parsed.detectedDistrict || value.district || "",
      districtId: parsed.detectedDistrictId || value.districtId || "",
      upazila: parsed.detectedUpazila || value.upazila || "",
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                কাস্টমার তথ্য
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                কাস্টমারের নাম, ফোন নম্বর ও সম্পূর্ণ ঠিকানা দিন
              </p>
            </div>
          </div>

          {value.isRepeatCustomer && (
            <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1">
              পুরাতন কাস্টমার
            </span>
          )}
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
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
                className="w-full h-10 sm:h-11 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-200">
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
                className="w-full h-10 sm:h-11 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* City / District Searchable Selector */}
          <div className="sm:col-span-2">
            <CitySearchSelect
              value={value.district || ""}
              onChange={(cityName, isDhaka, deliveryFee) => {
                onChange({
                  ...value,
                  district: cityName,
                  districtId: cityName.toLowerCase(),
                });
              }}
              required
            />
          </div>

          {/* Full Delivery Address Textarea */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
            </label>
            <textarea
              ref={addressTextareaRef}
              required
              rows={3}
              value={value.fullAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="উদাহরণ: বাড়ি ১২, রোড ৫, মিরপুর, ওয়ার্ড, গ্রাম/মহল্লা, নিকটস্থ মসজিদের পাশে"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Optional Note */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-200">
              অর্ডার নোট <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
            </label>
            <input
              type="text"
              value={value.note || ""}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              placeholder="যেমন: ডেলিভারির আগে কল দিয়ে নিশ্চিত করুন"
              className="w-full h-10 sm:h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Quick Recent Customer Pickers */}
        {recentCustomers.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
              সাম্প্রতিক কাস্টমার থেকে নির্বাচন করুন:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentCustomers.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => handleSelectRecent(c)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-600 text-[11px] font-bold transition-all border border-slate-200 dark:border-slate-700/60"
                >
                  {c.name} ({c.phone})
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
