"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Layers, ShieldCheck, ArrowRight, Truck } from "lucide-react";
import { MembershipApplicationForm } from "@/components/website/membership-application-form";
import { MembershipStatusTimeline } from "@/components/website/membership-status-timeline";
import { BusinessMembershipApplicationEntity } from "@/features/identity/domain/business-membership-entity";

interface WholesalerClientProps {
  initialData?: {
    isLoggedIn?: boolean;
    activeApplication?: BusinessMembershipApplicationEntity | null;
    isMember?: boolean;
  } | null;
}

export function WholesalerApplicationPageClient({ initialData }: WholesalerClientProps) {
  const [editing, setEditing] = useState(false);

  const isLoggedIn = initialData?.isLoggedIn;
  const activeApp = initialData?.activeApplication;
  const isMember = initialData?.isMember;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
          <Building2 className="w-3.5 h-3.5 text-amber-600" /> বি২বি ডাইরেক্ট বাল্ক সোর্সিং
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          হোলসেল ও বি২বি পার্টনারশিপ
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-2xl mx-auto leading-relaxed">
          আপনার খুচরা দোকান, অনলাইন শপ বা ডিস্ট্রিবিউশন বিজনেসের জন্য সরাসরি ডাইরেক্ট ইম্পোর্টার রেটে ইলেকট্রনিক্স ও গ্যাজেট বাল্ক ক্রয় করুন।
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-2xs">
          <Building2 className="w-7 h-7 text-amber-600 mb-2" />
          <h3 className="text-sm font-black text-slate-900 mb-1">ডাইরেক্ট ইম্পোর্টার রেট</h3>
          <p className="text-xs text-slate-600 font-bold leading-relaxed">
            কোনো মধ্যস্বত্বভোগী ছাড়াই সরাসরি কারখানা ও ডিস্ট্রিবিউটর মূল্যে কেনাকাটা করুন।
          </p>
        </div>
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-2xs">
          <Layers className="w-7 h-7 text-amber-600 mb-2" />
          <h3 className="text-sm font-black text-slate-900 mb-1">বাল্ক টিয়ার ডিসকাউন্ট</h3>
          <p className="text-xs text-slate-600 font-bold leading-relaxed">
            বেশি পরিমাণের অর্ডারে সর্বোচ্চ ২০% পর্যন্ত অতিরিক্ত মেগা ডিসকাউন্ট পাওয়ার সুবিধা।
          </p>
        </div>
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-2xs">
          <Truck className="w-7 h-7 text-amber-600 mb-2" />
          <h3 className="text-sm font-black text-slate-900 mb-1">নিরাপদ ডোরস্টেপ ডেলিভারি</h3>
          <p className="text-xs text-slate-600 font-bold leading-relaxed">
            সারা বাংলাদেশে Steadfast ও কাস্টম ট্রান্সপোর্টের মাধ্যমে দ্রুত ও নিরাপদ শিপিং।
          </p>
        </div>
      </div>

      {/* Main Content View Switcher */}
      {!isLoggedIn ? (
        <div className="bg-white border border-slate-300 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <Building2 className="w-12 h-12 text-amber-600 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            হোলসেল আবেদনের জন্য লগইন করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-md mx-auto">
            আপনার যদি পূর্বে কোনো অ্যাকাউন্ট থেকে থাকে তবে লগইন করুন, অথবা একটি নতুন অ্যাকাউন্ট তৈরি করুন।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/auth/login?redirect=/become-wholesale-partner"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-6 py-3 rounded-xl shadow-xs"
            >
              লগইন করুন <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register?redirect=/become-wholesale-partner"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-3 rounded-xl shadow-xs"
            >
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </div>
        </div>
      ) : isMember ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-8 text-center space-y-4">
          <Building2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-black text-emerald-950">
            আপনি ইতোমধ্যে একজন অনুমোদিত হোলসেলার!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-900 font-bold max-w-md mx-auto">
            আপনার হোলসেল পোর্টালে প্রবেশ করে বাল্ক অর্ডার টিয়ার প্রাইসিং ও অফিসিয়াল ইনভয়েসিং সুবিধা ব্যবহার করুন।
          </p>
          <Link
            href="/wholesale"
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-8 py-3 rounded-xl shadow-md"
          >
            হোলসেল পোর্টালে প্রবেশ করুন →
          </Link>
        </div>
      ) : activeApp && !editing ? (
        <MembershipStatusTimeline
          application={activeApp}
          onEditRequested={() => setEditing(true)}
        />
      ) : (
        <MembershipApplicationForm
          membershipType="wholesaler"
          existingApplication={activeApp}
          onSuccess={() => setEditing(false)}
        />
      )}
    </div>
  );
}
