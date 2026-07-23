"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  Building2,
  User,
  Clock,
  ArrowRight,
  History,
  PlusCircle,
} from "lucide-react";
import { MembershipStatusTimeline } from "@/components/website/membership-status-timeline";
import { MembershipApplicationForm } from "@/components/website/membership-application-form";
import {
  BusinessMembershipEntity,
  BusinessMembershipApplicationEntity,
} from "@/features/identity/domain/business-membership-entity";

interface UserMembershipsClientProps {
  userMemberships: BusinessMembershipEntity[];
  applications: BusinessMembershipApplicationEntity[];
  history: Array<{
    _id: unknown;
    action: string;
    membershipType: string;
    note?: string;
    createdAt: Date | string;
  }>;
}

export function UserMembershipsClient({
  userMemberships,
  applications,
  history,
}: UserMembershipsClientProps) {
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  const activeTypes = userMemberships
    .filter((m) => m.status === "active")
    .map((m) => m.membershipType);

  const isCustomer = true; // All registered users are Customer by default
  const isReseller = activeTypes.includes("reseller");
  const isWholesaler = activeTypes.includes("wholesaler");

  const editingApp = applications.find((a) => a.id === editingAppId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> বিজনেস মেম্বারশিপ কন্ট্রোল সেন্টার
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          আমার বিজনেস মেম্বারশিপসমূহ
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-bold">
          আপনার বর্তমান মেম্বারশিপসমূহ, আবেদনের স্ট্যাটাস ও ইতিহাস এখান থেকে পরিচালনা করুন।
        </p>
      </div>

      {/* 1. CURRENT ACTIVE MEMBERSHIPS CARDS */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          ১. আপনার সক্রিয় মেম্বারশিপসমূহ (Active Memberships):
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Customer Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
                <User className="w-5 h-5 text-slate-700" />
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Customer</h3>
              <p className="text-xs text-slate-600 font-bold">খুচরা ক্রেতা মেম্বারশিপ</p>
            </div>
          </div>

          {/* Reseller Card */}
          <div
            className={`p-5 rounded-2xl border shadow-2xs space-y-2 ${
              isReseller ? "bg-amber-50/60 border-amber-300" : "bg-white border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <Store className="w-5 h-5 text-amber-600" />
              </span>
              {isReseller ? (
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Reseller Partner</h3>
              <p className="text-xs text-slate-600 font-bold">ড্রপশিপিং ও কাস্টম প্রফিট</p>
            </div>
            {isReseller ? (
              <Link
                href="/reseller"
                className="inline-flex items-center gap-1 text-xs font-black text-amber-700 hover:text-amber-800 pt-1"
              >
                রিসেলার হাব →
              </Link>
            ) : (
              <Link
                href="/become-reseller"
                className="inline-flex items-center gap-1 text-xs font-black text-amber-600 hover:underline pt-1"
              >
                + আবেদন করুন
              </Link>
            )}
          </div>

          {/* Wholesaler Card */}
          <div
            className={`p-5 rounded-2xl border shadow-2xs space-y-2 ${
              isWholesaler ? "bg-amber-50/60 border-amber-300" : "bg-white border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <Building2 className="w-5 h-5 text-amber-600" />
              </span>
              {isWholesaler ? (
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Wholesaler B2B</h3>
              <p className="text-xs text-slate-600 font-bold">পাইকারি ও বাল্ক অর্ডার</p>
            </div>
            {isWholesaler ? (
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-1 text-xs font-black text-amber-700 hover:text-amber-800 pt-1"
              >
                হোলসেল পোর্টাল →
              </Link>
            ) : (
              <Link
                href="/become-wholesale-partner"
                className="inline-flex items-center gap-1 text-xs font-black text-amber-600 hover:underline pt-1"
              >
                + আবেদন করুন
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* EDIT FORM MODAL / PANEL */}
      {editingApp && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-amber-600 uppercase tracking-wider">
              আবেদন সম্পাদনা ফরম:
            </h2>
            <button
              onClick={() => setEditingAppId(null)}
              className="text-xs font-black text-slate-500 hover:text-slate-900 underline"
            >
              বাতিল করুন
            </button>
          </div>
          <MembershipApplicationForm
            membershipType={editingApp.membershipType}
            existingApplication={editingApp}
            onSuccess={() => setEditingAppId(null)}
          />
        </div>
      )}

      {/* 2. APPLICATIONS STATUS LIST */}
      {!editingApp && applications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            ২. আপনার মেম্বারশিপ আবেদনসমূহ ও টাইমলাইন:
          </h2>
          <div className="space-y-6">
            {applications.map((app) => (
              <MembershipStatusTimeline
                key={app.id}
                application={app}
                onEditRequested={() => setEditingAppId(app.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. MEMBERSHIP HISTORY AUDIT TRAIL */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-300 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-600" /> ৩. মেম্বারশিপ হিস্ট্রি ও অ্যাকশন লগ:
          </h2>

          <div className="divide-y divide-slate-200 text-xs">
            {history.map((h, index) => (
              <div key={index} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-slate-900">
                    {h.membershipType.toUpperCase()} - {h.action.toUpperCase()}
                  </p>
                  {h.note && <p className="text-slate-600 font-bold mt-0.5">{h.note}</p>}
                </div>
                <span className="text-[10px] font-bold text-slate-500 shrink-0">
                  {new Date(h.createdAt).toLocaleDateString("bn-BD")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
