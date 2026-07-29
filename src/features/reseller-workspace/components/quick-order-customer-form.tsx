"use client";

import * as React from "react";
import { User, Phone, MapPin, FileText, CheckCircle2, History, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export interface CustomerFormData {
  phone: string;
  name: string;
  district: string;
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

const DISTRICT_OPTIONS = [
  "Dhaka",
  "Chittagong",
  "Gazipur",
  "Narayanganj",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Cumilla",
  "Bogura",
  "Other",
];

export function QuickOrderCustomerForm({
  value,
  onChange,
}: QuickOrderCustomerFormProps): React.ReactElement {
  const [lookingUp, setLookingUp] = React.useState(false);
  const [recentCustomers, setRecentCustomers] = React.useState<any[]>([]);
  const [matchedCustomer, setMatchedCustomer] = React.useState<any | null>(null);

  // Load Recent Customers
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

  // Phone Lookup
  const handlePhoneChange = async (phoneInput: string) => {
    const nextData = { ...value, phone: phoneInput };
    onChange(nextData);

    const cleanDigits = phoneInput.replace(/\D/g, "");
    if (cleanDigits.length >= 11) {
      setLookingUp(true);
      try {
        const { listCustomersAction } = await import(
          "@/features/customer/actions/customer-actions"
        );
        const res = await listCustomersAction(phoneInput, 1, 3);
        if (res.success && res.data && res.data.length > 0) {
          const match = res.data[0];
          setMatchedCustomer(match);
          const defaultAddr = match.addresses?.[0] || {};

          onChange({
            ...value,
            phone: phoneInput,
            name: match.name || value.name,
            district: defaultAddr.city || defaultAddr.district || value.district || "Dhaka",
            fullAddress: defaultAddr.addressLine1 || defaultAddr.fullAddress || value.fullAddress,
            email: match.email || value.email,
            customerId: match.id || match._id,
            isRepeatCustomer: true,
          });

          toast.success(`পুনরাবৃত্তি কাস্টমার পাওয়া গেছে: ${match.name}`);
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
    onChange({
      phone: c.phone || "",
      name: c.name || "",
      district: addr.city || addr.district || "Dhaka",
      fullAddress: addr.addressLine1 || addr.fullAddress || "",
      email: c.email || "",
      customerId: c.id || c._id,
      isRepeatCustomer: true,
    });
    setMatchedCustomer(c);
    toast.success(`কাস্টমার ফিলআপ সম্পন্ন: ${c.name}`);
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary" /> ২. কাস্টমারের তথ্য (Step 4 &amp; 5)
          </label>
          {matchedCustomer && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px] font-black uppercase">
              <CheckCircle2 className="w-3 h-3" /> Repeat Customer
            </span>
          )}
        </div>

        {/* Recent Customers Quick Selectors */}
        {recentCustomers.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
              <History className="w-3 h-3 text-primary" /> রিসেন্ট কাস্টমার নির্বাচন করুন:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {recentCustomers.map((c) => (
                <button
                  key={c.id || c._id}
                  type="button"
                  onClick={() => handlePickRecent(c)}
                  className="px-3 py-1 rounded-xl text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground whitespace-nowrap transition-colors"
                >
                  {c.name || "Customer"} ({c.phone?.slice(-4)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phone Input with Live Lookup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center justify-between">
              <span>মোবাইল নম্বর <span className="text-destructive">*</span></span>
              {lookingUp && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={value.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground">
              কাস্টমারের নাম <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                placeholder="যেমন: মোহাম্মদ রহিম"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground">
              জেলা / Delivery District <span className="text-destructive">*</span>
            </label>
            <select
              value={value.district || "Dhaka"}
              onChange={(e) => onChange({ ...value, district: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-black text-foreground outline-none focus:border-primary"
            >
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} {d === "Dhaka" ? "(ঢাকার ভেতরে ৳৮০)" : "(ঢাকার বাইরে ৳১৫০)"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground">
              ইমেইল (ঐচ্ছিক)
            </label>
            <input
              type="email"
              value={value.email || ""}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
              placeholder="customer@gmail.com"
              className="w-full h-11 px-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" /> সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={value.fullAddress}
              onChange={(e) => onChange({ ...value, fullAddress: e.target.value })}
              placeholder="বাসা নং, রোড নং, এলাকা ও থানা লিখুন..."
              className="w-full p-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-black text-foreground">
              অর্ডার নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={value.note || ""}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              placeholder="যেমন: কালকের মধ্যে ডেলিভারি চাই / কল দিয়ে পণ্য হস্তান্তর করতে হবে"
              className="w-full h-11 px-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
