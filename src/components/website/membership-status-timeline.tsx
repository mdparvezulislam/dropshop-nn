"use client";

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Edit3,
  XCircle,
  FileText,
  User,
  Phone,
  CreditCard,
  MapPin,
  Store,
  Package,
  Calendar,
  Share2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessMembershipApplicationEntity } from "@/features/identity/domain/business-membership-entity";

interface MembershipStatusTimelineProps {
  application: BusinessMembershipApplicationEntity;
  onEditRequested?: () => void;
}

export function MembershipStatusTimeline({
  application,
  onEditRequested,
}: MembershipStatusTimelineProps) {
  const isApproved = application.status === "approved";
  const isRejected = application.status === "rejected";
  const isNeedInfo = application.status === "need_info";
  const isPending = application.status === "pending" || application.status === "under_review";

  const typeLabel = application.membershipType === "reseller" ? "রিসেলার" : "হোলসেলার";

  return (
    <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xs text-slate-900 space-y-6">
      {/* Header Status & Report Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {typeLabel} আবেদন রিপোর্ট #{application.id.slice(-6).toUpperCase()}
            </span>
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(application.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            আবেদন সারসংক্ষেপ ও ট্র্যাকিং
          </h2>
        </div>

        {isApproved && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> অনুমোদিত (Approved &amp; Active)
          </span>
        )}

        {isPending && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-black shadow-2xs animate-pulse">
            <Clock className="w-4 h-4 text-amber-600" /> অপেক্ষমাণ (Admin Approval Required)
          </span>
        )}

        {isNeedInfo && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-300 text-xs font-black shadow-2xs">
            <HelpCircle className="w-4 h-4 text-blue-600" /> অতিরিক্ত তথ্য প্রয়োজন (Action Required)
          </span>
        )}

        {isRejected && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 text-red-900 border border-red-300 text-xs font-black shadow-2xs">
            <XCircle className="w-4 h-4 text-red-600" /> প্রত্যাখ্যাত (Rejected)
          </span>
        )}
      </div>

      {/* Admin Action Required Banner */}
      {isNeedInfo && application.adminQuestion && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-300 space-y-2 text-xs font-bold text-blue-950">
          <div className="flex items-center gap-1.5 font-black text-blue-900">
            <HelpCircle className="w-4 h-4 text-blue-600" /> এডমিন টিম আপনার নিকট জানতে চেয়েছেন:
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

      {/* Interactive Timeline Stepper */}
      <div className="py-1">
        <p className="text-xs font-black text-slate-900 mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-600" /> আবেদন পর্যালোচনার বর্তমান ধাপ:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Step 1 */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1">
            <span className="text-[10px] font-black text-emerald-800 uppercase">ধাপ ১</span>
            <p className="text-xs font-black text-emerald-950 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> জমা হয়েছে
            </p>
          </div>

          {/* Step 2 */}
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

          {/* Step 3 */}
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

          {/* Step 4 */}
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

      {/* Complete Application Submission Report Card */}
      <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
          <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-600" /> জমাকৃত আবেদনের বিস্তারিত তথ্য (SUBMISSION REPORT)
          </h3>
          {!isApproved && onEditRequested && (
            <Button
              onClick={onEditRequested}
              size="sm"
              variant="outline"
              className="h-8 text-xs font-black border-amber-300 bg-white text-slate-900 hover:bg-amber-100 gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" /> তথ্য সংশোধন (Edit Draft)
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-800">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">আবেদনকারীর নাম</span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-amber-600" /> {application.commonFields.fullName}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block">মোবাইল নম্বর</span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> {application.commonFields.phone}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block">বিকাশ নম্বর (ক্যাশআউট ওয়ালেট)</span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" /> {application.commonFields.bkashNumber}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block">জেলা ও উপজেলা</span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> {application.commonFields.district}, {application.commonFields.upazila}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-500 block">সম্পূর্ণ ঠিকানা</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {application.commonFields.fullAddress}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block">বিক্রয়ের মাধ্যম</span>
            <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-0.5">
              <Store className="w-3.5 h-3.5 text-amber-600" /> {application.commonFields.salesChannel}
            </span>
          </div>

          {application.resellerFields && (
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">মাসিক আনুমানিক অর্ডার</span>
              <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-0.5">
                <Package className="w-3.5 h-3.5 text-amber-600" /> {application.resellerFields.monthlyOrders} টি
              </span>
            </div>
          )}

          {Boolean(application.resellerFields?.productCategories?.length) && (
            <div className="sm:col-span-2">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">পছন্দকৃত ক্যাটাগরি:</span>
              <div className="flex flex-wrap gap-1.5">
                {application.resellerFields?.productCategories?.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-0.5 rounded-lg bg-white border border-amber-300 text-amber-950 text-[11px] font-black"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {application.commonFields.facebookPage && (
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">ফেসবুক পেজ</span>
              <a
                href={application.commonFields.facebookPage}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-600 hover:underline truncate block mt-0.5"
              >
                {application.commonFields.facebookPage}
              </a>
            </div>
          )}

          {application.commonFields.website && (
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">ওয়েবসাইট</span>
              <a
                href={application.commonFields.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-600 hover:underline truncate block mt-0.5"
              >
                {application.commonFields.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {!isApproved && onEditRequested && (
        <div className="pt-2 flex justify-end">
          <Button
            onClick={onEditRequested}
            className="w-full sm:w-auto h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs gap-2"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            {isNeedInfo ? "চাওয়া তথ্য প্রদান ও আবেদন সংশোধন করুন" : "আবেদন তথ্য সংশোধন করুন (Edit Details)"}
          </Button>
        </div>
      )}
    </div>
  );
}
