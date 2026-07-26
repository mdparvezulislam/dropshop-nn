"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Phone,
  MapPin,
  Building2,
  Store,
  FileText,
  MessageSquare,
  History,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  adminGetMembershipApplicationsAction,
  adminReviewApplicationAction,
  adminGetApplicationDetailsAction,
  adminAddApplicationNoteAction,
} from "../actions/admin-membership-actions";
import {
  BusinessMembershipApplicationEntity,
  ApplicationStatus,
} from "../domain/business-membership-entity";

export function BusinessMembershipApprovalCenter() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus | "all">("pending");
  const [membershipTypeFilter, setMembershipTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<BusinessMembershipApplicationEntity[]>([]);
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    needInfoCount: 0,
    approvalRate: 0,
    rejectionRate: 0,
  });

  // Selected Application for Detail Modal / Review Panel
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<{
    application: BusinessMembershipApplicationEntity;
    notes: Array<{ authorName: string; note: string; createdAt: Date }>;
    history: Array<{ action: string; note?: string; createdAt: Date }>;
  } | null>(null);

  // Review Form Inputs
  const [reviewAction, setReviewAction] = useState<
    "approve" | "reject" | "need_info" | "under_review" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [adminQuestion, setAdminQuestion] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [internalNote, setInternalNote] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const res = await adminGetMembershipApplicationsAction({
      status: activeTab === "all" ? undefined : activeTab,
      membershipType: membershipTypeFilter === "all" ? undefined : membershipTypeFilter,
      search: search.trim() || undefined,
    });

    if (res.success && res.data) {
      setItems(res.data.items);
      setAnalytics(res.data.analytics);
    } else {
      toast.error(res.error || "তালিকা লোড করতে ব্যর্থ হয়েছে");
    }
    setLoading(false);
  }, [activeTab, membershipTypeFilter, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSelectApp = async (id: string) => {
    setSelectedAppId(id);
    setReviewAction(null);
    setRejectionReason("");
    setAdminQuestion("");
    setReviewNotes("");

    const res = await adminGetApplicationDetailsAction(id);
    if (res.success && res.data) {
      setSelectedDetails(res.data as unknown as typeof selectedDetails);
    } else {
      toast.error(res.error || "বিস্তারিত লোড করা সম্ভব হয়নি");
    }
  };

  const handleExecuteReview = async () => {
    if (!selectedAppId || !reviewAction) return;
    setSubmittingAction(true);

    try {
      const res = await adminReviewApplicationAction({
        applicationId: selectedAppId,
        action: reviewAction,
        rejectionReason: reviewAction === "reject" ? rejectionReason : undefined,
        adminQuestion: reviewAction === "need_info" ? adminQuestion : undefined,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "অ্যাকশন সম্পন্ন করতে ব্যর্থ হয়েছে");
      } else {
        toast.success(
          reviewAction === "approve"
            ? "আবেদনটি অনুমোদিত হয়েছে এবং মেম্বারশিপ প্রদান করা হয়েছে!"
            : reviewAction === "reject"
              ? "আবেদনটি প্রত্যাখ্যান করা হয়েছে"
              : reviewAction === "need_info"
                ? "ব্যবহারকারীর নিকট তথ্যের জন্য বার্তা পাঠানো হয়েছে"
                : "আবেদনটি আন্ডার রিভিউ হিসেবে চিহ্নিত করা হয়েছে",
        );
        setSelectedAppId(null);
        setSelectedDetails(null);
        fetchApplications();
      }
    } catch {
      toast.error("অপ্রত্যাশিত ত্রুটি ঘটেছে");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedAppId || !internalNote.trim()) return;
    const res = await adminAddApplicationNoteAction({
      applicationId: selectedAppId,
      note: internalNote,
    });

    if (res.success) {
      toast.success("নোট যুক্ত হয়েছে");
      setInternalNote("");
      handleSelectApp(selectedAppId);
    } else {
      toast.error(res.error || "নোট যুক্ত করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            বিজনেস মেম্বারশিপ ও অ্যাপ্লিকেশান সেন্টার
          </h1>
          <p className="text-xs text-muted-foreground">
            রিসেলার ও হোলসেলার মেম্বারশিপ আবেদন রিভিউ, অনুমোদন, ও ম্যানুয়াল মেম্বারশিপ কন্ট্রোল।
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchApplications}
          disabled={loading}
          className="gap-1.5 self-start sm:self-auto text-xs font-bold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          রিফ্রেশ করুন
        </Button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground">মোট আবেদন</span>
          <p className="text-xl font-black">{analytics.totalApplications}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-1">
          <span className="text-[11px] font-bold text-amber-700">পেন্ডিং কিউ</span>
          <p className="text-xl font-black text-amber-600">{analytics.pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 space-y-1">
          <span className="text-[11px] font-bold text-emerald-700">অনুমোদিত</span>
          <p className="text-xl font-black text-emerald-600">{analytics.approvedCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 space-y-1">
          <span className="text-[11px] font-bold text-blue-700">তথ্য প্রয়োজন</span>
          <p className="text-xl font-black text-blue-600">{analytics.needInfoCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-purple-700">অনুমোদনের হার</span>
          <p className="text-xl font-black text-purple-600">{analytics.approvalRate}%</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(["pending", "under_review", "need_info", "approved", "rejected", "all"] as const).map(
            (tab) => {
              const labels: Record<string, string> = {
                pending: `পেন্ডিং (${analytics.pendingCount})`,
                under_review: "আন্ডার রিভিউ",
                need_info: `তথ্য প্রয়োজন (${analytics.needInfoCount})`,
                approved: `অনুমোদিত (${analytics.approvedCount})`,
                rejected: `প্রত্যাখ্যাত (${analytics.rejectedCount})`,
                all: "সকল আবেদন",
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            },
          )}
        </div>

        {/* Membership Type & Search */}
        <div className="flex items-center gap-2">
          <select
            value={membershipTypeFilter}
            onChange={(e) => setMembershipTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none"
          >
            <option value="all">সকল ধরন (All Types)</option>
            <option value="reseller">রিসেলার (Reseller)</option>
            <option value="wholesaler">হোলসেলার (Wholesaler)</option>
          </select>

          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, ফোন বা জেলা অনুসন্ধান..."
              className="h-9 pl-9 pr-3 w-full rounded-xl border border-border bg-background text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Applications Data Table / List */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">লোডিং হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            কোনো আবেদন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {items.map((app) => (
              <div
                key={app.id}
                onClick={() => handleSelectApp(app.id)}
                className="p-4 hover:bg-muted/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-foreground">
                      {app.commonFields?.fullName || app.userFullName}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                        app.membershipType === "reseller"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-purple-100 text-purple-900 border border-purple-300"
                      }`}
                    >
                      {app.membershipType}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      #{app.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-amber-500" />
                      {app.commonFields?.phone || app.userPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />
                      {app.commonFields?.district}, {app.commonFields?.upazila}
                    </span>
                    <span>মাধ্যম: {app.commonFields?.salesChannel}</span>
                    {app.wholesalerFields && (
                      <span className="font-bold text-foreground">
                        প্রতিষ্ঠান: {app.wholesalerFields.companyName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-xl border ${
                      app.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : app.status === "rejected"
                          ? "bg-red-50 text-red-800 border-red-300"
                          : app.status === "need_info"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {app.status}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL & REVIEW MODAL */}
      {selectedAppId && selectedDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-foreground shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  {selectedDetails.application.membershipType} Application
                </span>
                <h2 className="text-xl font-extrabold mt-1">
                  {selectedDetails.application.commonFields?.fullName} এর আবেদন বিস্তারিত
                </h2>
              </div>
              <button
                onClick={() => setSelectedAppId(null)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            {/* Applicant Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/40 p-4 rounded-2xl border border-border/60">
              <p>
                <span className="font-bold text-muted-foreground">ফোন:</span>{" "}
                {selectedDetails.application.commonFields?.phone}
              </p>
              <p>
                <span className="font-bold text-muted-foreground">বিকাশ:</span>{" "}
                {selectedDetails.application.commonFields?.bkashNumber}
              </p>
              <p>
                <span className="font-bold text-muted-foreground">জেলা:</span>{" "}
                {selectedDetails.application.commonFields?.district}
              </p>
              <p>
                <span className="font-bold text-muted-foreground">উপজেলা:</span>{" "}
                {selectedDetails.application.commonFields?.upazila}
              </p>
              <p className="col-span-2">
                <span className="font-bold text-muted-foreground">ঠিকানা:</span>{" "}
                {selectedDetails.application.commonFields?.fullAddress}
              </p>
              <p>
                <span className="font-bold text-muted-foreground">বিক্রয়ের মাধ্যম:</span>{" "}
                {selectedDetails.application.commonFields?.salesChannel}
              </p>
              {selectedDetails.application.commonFields?.facebookPage && (
                <p>
                  <span className="font-bold text-muted-foreground">ফেসবুক পেজ:</span>{" "}
                  {selectedDetails.application.commonFields.facebookPage}
                </p>
              )}

              {selectedDetails.application.resellerFields && (
                <>
                  <p>
                    <span className="font-bold text-muted-foreground">মাসিক আনুমানিক অর্ডার:</span>{" "}
                    {selectedDetails.application.resellerFields.monthlyOrders}
                  </p>
                  <p className="col-span-2">
                    <span className="font-bold text-muted-foreground">ক্যাটাগরি:</span>{" "}
                    {selectedDetails.application.resellerFields.productCategories?.join(", ")}
                  </p>
                </>
              )}

              {selectedDetails.application.wholesalerFields && (
                <>
                  <p>
                    <span className="font-bold text-muted-foreground">প্রতিষ্ঠানের নাম:</span>{" "}
                    {selectedDetails.application.wholesalerFields.companyName}
                  </p>
                  <p>
                    <span className="font-bold text-muted-foreground">ব্যবসার ধরন:</span>{" "}
                    {selectedDetails.application.wholesalerFields.businessType}
                  </p>
                  <p>
                    <span className="font-bold text-muted-foreground">মাসিক ক্রয়:</span>{" "}
                    {selectedDetails.application.wholesalerFields.estimatedMonthlyPurchase}
                  </p>
                  {selectedDetails.application.wholesalerFields.tradeLicense && (
                    <p>
                      <span className="font-bold text-muted-foreground">Trade License:</span>{" "}
                      {selectedDetails.application.wholesalerFields.tradeLicense}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Review Decision Buttons */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-black uppercase text-amber-600 block">
                রিভিউ সিদ্ধান্ত গ্রহণ করুন (Review Action):
              </span>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setReviewAction("approve")}
                  className={`text-xs font-extrabold gap-1.5 ${
                    reviewAction === "approve"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" /> অনুমোদন ও মেম্বারশিপ প্রদান
                </Button>

                <Button
                  size="sm"
                  onClick={() => setReviewAction("need_info")}
                  className={`text-xs font-extrabold gap-1.5 ${
                    reviewAction === "need_info"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" /> তথ্য চেয়ে পাঠাও
                </Button>

                <Button
                  size="sm"
                  onClick={() => setReviewAction("reject")}
                  className={`text-xs font-extrabold gap-1.5 ${
                    reviewAction === "reject"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-800 border border-red-300 hover:bg-red-100"
                  }`}
                >
                  <XCircle className="h-4 w-4" /> আবেদন প্রত্যাখ্যান করুন
                </Button>
              </div>

              {/* Conditional Form Inputs */}
              {reviewAction === "reject" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-red-50 border border-red-200">
                  <label className="text-xs font-black text-red-900">
                    প্রত্যাখ্যানের কারণ লিখুন (আবশ্যক):
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="যেমন: অসম্পূর্ণ ঠিকানা বা অনভিপ্রেত ফেসবুক প্রোফাইল তথ্য..."
                    className="w-full p-2.5 text-xs font-bold rounded-lg bg-white border border-red-300 text-slate-900"
                  />
                </div>
              )}

              {reviewAction === "need_info" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <label className="text-xs font-black text-blue-900">
                    ব্যবহারকারীর নিকট আপনার প্রশ্নটি লিখুন (আবশ্যক):
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={adminQuestion}
                    onChange={(e) => setAdminQuestion(e.target.value)}
                    placeholder="যেমন: অনুগ্রহ করে আপনার ব্যবসার ট্রেড লাইসেন্স বা সঠিক ফেসবুক পেজের সঠিক লিংকটি প্রদান করুন..."
                    className="w-full p-2.5 text-xs font-bold rounded-lg bg-white border border-blue-300 text-slate-900"
                  />
                </div>
              )}

              {reviewAction && (
                <div className="pt-2">
                  <Button
                    onClick={handleExecuteReview}
                    disabled={submittingAction}
                    className="w-full h-10 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {submittingAction ? "প্রসেসিং..." : "সিদ্ধান্ত সংরক্ষণ করুন"}
                  </Button>
                </div>
              )}
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-3 pt-4 border-t border-border/80">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                অভ্যন্তরীণ নোটসমূহ (Internal Notes):
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="এডমিন টিমের নোট লিখুন..."
                  className="flex-1 h-9 px-3 text-xs rounded-xl border border-border bg-background outline-none"
                />
                <Button size="sm" onClick={handleAddNote} className="h-9 px-4 text-xs font-bold">
                  নোট যোগ করুন
                </Button>
              </div>

              {selectedDetails.notes.length > 0 && (
                <div className="space-y-1.5 text-xs bg-muted/30 p-3 rounded-xl">
                  {selectedDetails.notes.map((n, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        <strong className="text-foreground">{n.authorName}:</strong> {n.note}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
