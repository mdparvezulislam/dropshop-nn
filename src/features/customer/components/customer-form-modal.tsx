"use client";

import * as React from "react";
import { X, Save, User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BD_DISTRICTS, type BdDistrict } from "@/config/bd-districts";
import { toast } from "sonner";

export interface CustomerModalData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  district: string;
  upazila?: string;
  address?: string;
}

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerModalData | null;
  onSuccess: () => void;
}

export function CustomerFormModal({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerFormModalProps): React.ReactElement | null {
  const [submitting, setSubmitting] = React.useState(false);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [district, setDistrict] = React.useState("Sunamganj (সুনামগঞ্জ)");
  const [upazila, setUpazila] = React.useState("");
  const [address, setAddress] = React.useState("");

  React.useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setPhone(customer.phone || "");
      setEmail(customer.email || "");
      setDistrict(customer.district || "Dhaka (ঢাকা)");
      setUpazila(customer.upazila || "");
      setAddress(customer.address || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setDistrict("Sunamganj (সুনামগঞ্জ)");
      setUpazila("");
      setAddress("");
    }
  }, [customer, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("কাস্টমারের নাম এবং মোবাইল নম্বর প্রদান করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const { saveCustomerProfileAction } = await import(
        "@/features/customer/actions/customer-actions"
      );

      const res = await saveCustomerProfileAction({
        id: customer?.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        district: district.trim(),
        upazila: upazila.trim(),
        address: address.trim(),
      });

      if (res.success) {
        toast.success(
          customer?.id
            ? "কাস্টমারের তথ্য সফলভাবে আপডেট করা হয়েছে!"
            : "নতুন কাস্টমার সফলভাবে যুক্ত করা হয়েছে!",
        );
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error || "সংরক্ষণ করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("একটি সমস্যা ঘটেছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {customer?.id ? "কাস্টমার তথ্য আপডেট করুন" : "+ নতুন কাস্টমার যোগ করুন"}
            </h2>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
              প্রয়োজনীয় তথ্য পরিবর্তন করে সংরক্ষণ করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold">
          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-slate-800 dark:text-slate-200 font-bold block">
              নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sharmin Begum"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-1">
            <label className="text-slate-800 dark:text-slate-200 font-bold block">
              ফোন নম্বর <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01822028755"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-1">
            <label className="text-slate-800 dark:text-slate-200 font-bold block">
              ইমেইল
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sharmin23@gmail.com"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* District & Upazila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-800 dark:text-slate-200 font-bold block">
                জেলা
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              >
                {BD_DISTRICTS.map((d) => (
                  <option key={d.id} value={`${d.nameEn} (${d.name})`}>
                    {d.nameEn} ({d.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-800 dark:text-slate-200 font-bold block">
                ডেলিভারি এরিয়া
              </label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                placeholder="sunamganj, jagannathpur"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Full Address */}
          <div className="space-y-1">
            <label className="text-slate-800 dark:text-slate-200 font-bold block">
              ঠিকানা
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Sylhet,sunamganj, jagannathpur,Har Gram"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Submit Button (Matching Screenshot Red Button) */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md transition-all"
            >
              {submitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
