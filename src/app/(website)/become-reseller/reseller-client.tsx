"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, DollarSign, PackageCheck, Zap, ArrowRight, Store } from "lucide-react";
import { MembershipApplicationForm } from "@/components/website/membership-application-form";
import { MembershipStatusTimeline } from "@/components/website/membership-status-timeline";
import { BusinessMembershipApplicationEntity } from "@/features/identity/domain/business-membership-entity";

interface ResellerClientProps {
  initialData?: {
    isLoggedIn?: boolean;
    activeApplication?: BusinessMembershipApplicationEntity | null;
    isMember?: boolean;
  } | null;
}

export function ResellerApplicationPageClient({ initialData }: ResellerClientProps) {
  const [editing, setEditing] = useState(false);

  const isLoggedIn = initialData?.isLoggedIn;
  const activeApp = initialData?.activeApplication;
  const isMember = initialData?.isMember;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
          <Users className="w-3.5 h-3.5 text-amber-600" /> জিরো ক্যাপিটাল ই-কমার্স বিজনেস
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          ড্রপশিপিং রিসেলার পার্টনার হন
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-2xl mx-auto leading-relaxed">
          পণ্য কেনা বা ইনভেন্টরির ঝুঁকি ছাড়াই আপনার ফেসবুক পেজ বা ওয়েবসাইটে বিক্রি শুরু করুন। আমরা সরাসরি আপনার কাস্টমারের নিকট ডেলিভারি পাঠাব।
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-2xs">
          <DollarSign className="w-7 h-7 text-amber-600 mb-2" />
          <h3 className="text-sm font-black text-slate-900 mb-1">আকর্ষণীয় প্রফিট মার্জিন</h3>
          <p className="text-xs text-slate-600 font-bold leading-relaxed">
            প্রতি অর্ডারে ২০% থেকে ৩৫% প্রফিট ইনকাম করুন এবং সরাসরি বিকাশ ওয়ালেটে পে-আউট নিন।
          </p>
        </div>
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-2xs">
          <PackageCheck className="w-7 h-7 text-amber-600 mb-2" />
          <h3 className="text-sm font-black text-slate-900 mb-1">জিরো ইনভেন্টরি ঝুঁকি</h3>
          <p className="text-xs text-slate-600 font-bold leading-relaxed">
            কোনো প্রোডাক্ট স্টক বা গুদাম রাখার প্রয়োজন নেই। আমরা ফুলফিলমেন্ট ও ডেলিভারি পরিচালনা করি।
          </p>
        </div>
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-2xs">
          <Zap className="w-7 h-7 text-amber-600 mb-2" />
          <h3 className="text-sm font-black text-slate-900 mb-1">ফ্রি মার্কেটিং কিট</h3>
          <p className="text-xs text-slate-600 font-bold leading-relaxed">
            হাই-কোয়ালিটি প্রোডাক্ট ছবি, বিজ্ঞাপন ভিডিও এবং কন্টেন্ট ডাউনলোড করে সহজে প্রচার করুন।
          </p>
        </div>
      </div>

      {/* Main Content View Switcher */}
      {!isLoggedIn ? (
        <div className="bg-white border border-slate-300 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <Store className="w-12 h-12 text-amber-600 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            রিসেলার আবেদনের জন্য লগইন করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-md mx-auto">
            আপনার যদি পূর্বে কোনো অ্যাকাউন্ট থেকে থাকে তবে লগইন করুন, অথবা একটি নতুন অ্যাকাউন্ট তৈরি করুন।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/auth/login?redirect=/become-reseller"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-6 py-3 rounded-xl shadow-xs"
            >
              লগইন করুন <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register?redirect=/become-reseller"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-3 rounded-xl shadow-xs"
            >
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </div>
        </div>
      ) : isMember ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-8 text-center space-y-4">
          <Store className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-black text-emerald-950">
            আপনি ইতোমধ্যে একজন অনুমোদিত রিসেলার!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-900 font-bold max-w-md mx-auto">
            আপনার রিসেলার ড্যাশবোর্ডে প্রবেশ করে প্রফিট কাস্টমাইজেশন, ক্যাটাগরি প্রাইসিং ও মার্কেটিং কিট উপভোগ করুন।
          </p>
          <Link
            href="/reseller"
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-8 py-3 rounded-xl shadow-md"
          >
            রিসেলার হাবে প্রবেশ করুন →
          </Link>
        </div>
      ) : activeApp && !editing ? (
        <MembershipStatusTimeline
          application={activeApp}
          onEditRequested={() => setEditing(true)}
        />
      ) : (
        <MembershipApplicationForm
          membershipType="reseller"
          existingApplication={activeApp}
          onSuccess={() => setEditing(false)}
        />
      )}
    </div>
  );
}
