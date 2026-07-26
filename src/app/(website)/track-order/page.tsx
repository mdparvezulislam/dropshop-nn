import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { TrackOrderForm } from "@/components/website/orders/track-order-form";

export const metadata: Metadata = {
  title: "অর্ডার ট্র্যাক করুন",
  description: "অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে আপনার অর্ডারের সর্বশেষ অবস্থা দেখুন।",
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-10">
      <div className="mx-auto px-4 max-w-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-7 h-7 text-amber-600" aria-hidden />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">অর্ডার ট্র্যাক করুন</h1>
          <p className="text-sm font-medium text-slate-600">
            অর্ডার নম্বর ও অর্ডারে ব্যবহৃত মোবাইল নম্বর দিয়ে সর্বশেষ অবস্থা দেখুন।
          </p>
        </div>
        <TrackOrderForm />
      </div>
    </div>
  );
}
