"use client";

import { CheckCircle2, Clock, AlertCircle, HelpCircle, Edit3, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessMembershipApplicationEntity } from "@/features/identity/domain/business-membership-entity";

interface MembershipStatusTimelineProps {
  application: BusinessMembershipApplicationEntity;
  onEditRequested?: () => void;
}

export function MembershipStatusTimeline({ application, onEditRequested }: MembershipStatusTimelineProps) {
  const isApproved = application.status === "approved";
  const isRejected = application.status === "rejected";
  const isNeedInfo = application.status === "need_info";
  const isPending = application.status === "pending" || application.status === "under_review";

  const typeLabel = application.membershipType === "reseller" ? "রিসেলার" : "হোলসেলার";

  return (
    <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xs text-slate-900 space-y-6">
      {/* Header Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {typeLabel} আবেদন আইডি: #{application.id.slice(-6).toUpperCase()}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            আবেদন স্ট্যাটাস ও ট্র্যাকিং
          </h2>
        </div>

        {isApproved && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> অনুমোদিত (Approved)
          </span>
        )}

        {isPending && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-black shadow-2xs animate-pulse">
            <Clock className="w-4 h-4 text-amber-600" /> পর্যালোচনায় রয়েছে (Under Review)
          </span>
        )}

        {isNeedInfo && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-300 text-xs font-black shadow-2xs">
            <HelpCircle className="w-4 h-4 text-blue-600" /> অতিরিক্ত তথ্য প্রয়োজন
          </span>
        )}

        {isRejected && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 text-red-900 border border-red-300 text-xs font-black shadow-2xs">
            <XCircle className="w-4 h-4 text-red-600" /> প্রত্যাখ্যাত (Rejected)
          </span>
        )}
      </div>

      {/* Admin Feedback Box */}
      {isNeedInfo && application.adminQuestion && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-300 space-y-2 text-xs font-bold text-blue-950">
          <div className="flex items-center gap-1.5 font-black text-blue-900">
            <HelpCircle className="w-4 h-4 text-blue-600" /> एडমিন টিম আপনার নিকট জানতে চেয়েছেন:
          </div>
          <p className="bg-white p-3 rounded-xl border border-blue-200 text-slate-900 font-extrabold">
            {application.adminQuestion}
          </p>
        </div>
      )}

      {isRejected && application.rejectionReason && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 space-y-2 text-xs font-bold text-red-950">
          <div className="flex items-center gap-1.5 font-black text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600" /> আবেদন প্রত্যাখ্যানের কারণ:
          </div>
          <p className="bg-white p-3 rounded-xl border border-red-200 text-slate-900 font-extrabold">
            {application.rejectionReason}
          </p>
        </div>
      )}

      {/* Interactive Timeline Progress Stepper */}
      <div className="py-2">
        <p className="text-xs font-black text-slate-900 mb-4">আবেদন পর্যালোচনার ধাপসমূহ:</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Step 1: Submitted */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1">
            <span className="text-[10px] font-black text-emerald-800 uppercase">ধাপ ১</span>
            <p className="text-xs font-black text-emerald-950 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> জমা হয়েছে
            </p>
          </div>

          {/* Step 2: Under Review */}
          <div
            className={`p-3 rounded-2xl border space-y-1 ${
              isApproved || isNeedInfo || isRejected || application.status === "under_review"
                ? "bg-emerald-50 border-emerald-300"
                : "bg-amber-50 border-amber-300"
            }`}
          >
            <span className="text-[10px] font-black text-slate-600 uppercase">ধাপ ২</span>
            <p className="text-xs font-black text-slate-900">এডমিন রিভিউ</p>
          </div>

          {/* Step 3: Information Check */}
          <div
            className={`p-3 rounded-2xl border space-y-1 ${
              isNeedInfo
                ? "bg-blue-50 border-blue-300 text-blue-950 font-black"
                : isApproved
                ? "bg-emerald-50 border-emerald-300"
                : "bg-slate-100 border-slate-300 text-slate-600"
            }`}
          >
            <span className="text-[10px] font-black uppercase">ধাপ ৩</span>
            <p className="text-xs font-black">তথ্য যাচাই</p>
          </div>

          {/* Step 4: Final Decision */}
          <div
            className={`p-3 rounded-2xl border space-y-1 ${
              isApproved
                ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-black"
                : isRejected
                ? "bg-red-50 border-red-300 text-red-950 font-black"
                : "bg-slate-100 border-slate-300 text-slate-600"
            }`}
          >
            <span className="text-[10px] font-black uppercase">ধাপ ৪</span>
            <p className="text-xs font-black">চূড়ান্ত সিদ্ধান্ত</p>
          </div>
        </div>
      </div>

      {/* Submitted Details Summary Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
        <p className="font-black text-slate-900 border-b border-slate-200 pb-2">আবেদনের সারসংক্ষেপ:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 font-bold">
          <p><span className="text-slate-500 font-semibold">নাম:</span> {application.commonFields.fullName}</p>
          <p><span className="text-slate-500 font-semibold">মোবাইল:</span> {application.commonFields.phone}</p>
          <p><span className="text-slate-500 font-semibold">বিকাশ:</span> {application.commonFields.bkashNumber}</p>
          <p><span className="text-slate-500 font-semibold">জেলা:</span> {application.commonFields.district}, {application.commonFields.upazila}</p>
          <p><span className="text-slate-500 font-semibold">বিক্রয়ের মাধ্যম:</span> {application.commonFields.salesChannel}</p>
          {application.resellerFields && (
            <p><span className="text-slate-500 font-semibold">মাসিক আনুমানিক অর্ডার:</span> {application.resellerFields.monthlyOrders}</p>
          )}
          {application.wholesalerFields && (
            <p><span className="text-slate-500 font-semibold">প্রতিষ্ঠানের নাম:</span> {application.wholesalerFields.companyName}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isApproved && onEditRequested && (
        <div className="pt-2">
          <Button
            onClick={onEditRequested}
            className="w-full sm:w-auto h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs"
          >
            <Edit3 className="w-4 h-4 mr-2 text-amber-400" />
            {isNeedInfo ? "চাওয়া তথ্য প্রদান ও আবেদন সংশোধন করুন" : "আবেদন সংশোধন করে পুনঃজমা দিন"}
          </Button>
        </div>
      )}
    </div>
  );
}
