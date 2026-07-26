"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Sliders,
  Check,
  X,
  Edit2,
  Archive,
  Power,
  Layers,
  Users,
  Clock,
  TrendingUp,
  Boxes,
  DollarSign,
  Store,
  Building2,
  Truck,
  Building,
  Share2,
  Factory,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  adminGetMembershipTypesAction,
  adminCreateMembershipTypeAction,
  adminUpdateMembershipTypeAction,
  adminArchiveMembershipTypeAction,
  adminToggleMembershipTypeActiveAction,
} from "../actions/admin-membership-actions";
import {
  BusinessMembershipTypeEntity,
  MembershipBenefits,
} from "../domain/business-membership-entity";
import { BusinessMembershipApprovalCenter } from "./business-membership-approval-center";
import { UsersAdmin } from "./users-admin";

const ICON_MAP: Record<string, any> = {
  User: UserCheck,
  Store: Store,
  Building2: Building2,
  Boxes: Boxes,
  Truck: Truck,
  Building: Building,
  Share2: Share2,
  Factory: Factory,
  UserCheck: UserCheck,
};

export function BusinessMembershipDashboardComponent() {
  const [activeSubTab, setActiveSubTab] = useState<
    "types" | "users" | "applications" | "analytics"
  >("types");
  const [loading, setLoading] = useState<boolean>(true);
  const [types, setTypes] = useState<BusinessMembershipTypeEntity[]>([]);

  // Type Create / Edit Modal State
  const [editingType, setEditingType] = useState<BusinessMembershipTypeEntity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form state
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [banglaName, setBanglaName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("UserCheck");
  const [color, setColor] = useState("amber");
  const [priority, setPriority] = useState(10);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Benefits state
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [ruleType, setRuleType] = useState("standard");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [marginPercent, setMarginPercent] = useState(15);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    const res = await adminGetMembershipTypesAction();
    if (res.success && res.data) {
      setTypes(res.data);
    } else {
      toast.error(res.error || "মেম্বারশিপ টাইপ লোড করা সম্ভব হয়নি");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const openCreateModal = () => {
    setEditingType(null);
    setSlug("");
    setName("");
    setBanglaName("");
    setDescription("");
    setIcon("UserCheck");
    setColor("amber");
    setPriority(10);
    setApprovalRequired(true);
    setIsActive(true);
    setFeatures(["Catalog Access"]);
    setRuleType("standard");
    setDiscountPercent(10);
    setMarginPercent(15);
    setMinimumOrderAmount(0);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (t: BusinessMembershipTypeEntity) => {
    setEditingType(t);
    setSlug(t.slug);
    setName(t.name);
    setBanglaName(t.banglaName);
    setDescription(t.description);
    setIcon(t.icon || "UserCheck");
    setColor(t.color || "amber");
    setPriority(t.priority || 0);
    setApprovalRequired(t.approvalRequired);
    setIsActive(t.isActive);
    setFeatures(t.benefits?.features || []);
    setRuleType(t.benefits?.pricingRules?.ruleType || "standard");
    setDiscountPercent(t.benefits?.pricingRules?.discountPercent || 0);
    setMarginPercent(t.benefits?.pricingRules?.marginPercent || 0);
    setMinimumOrderAmount(t.benefits?.minimumOrderAmount || 0);
    setIsCreateModalOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const benefitsData: Partial<MembershipBenefits> = {
      features,
      pricingRules: {
        ruleType,
        discountPercent,
        marginPercent,
      },
      minimumOrderAmount,
      discountRules: {
        minQty: 1,
        discountPercent,
      },
      accessRules: [slug],
      dashboardVisibility: true,
      marketingAccess: true,
    };

    if (editingType) {
      const res = await adminUpdateMembershipTypeAction(editingType.id, {
        name,
        banglaName,
        description,
        icon,
        color,
        priority: Number(priority),
        approvalRequired,
        isActive,
        benefits: benefitsData,
      });

      if (res.success) {
        toast.success(`মেম্বারশিপ টাইপ ${name} আপডেট হয়েছে`);
        setIsCreateModalOpen(false);
        fetchTypes();
      } else {
        toast.error(res.error || "আপডেট ব্যর্থ হয়েছে");
      }
    } else {
      const res = await adminCreateMembershipTypeAction({
        slug,
        name,
        banglaName,
        description,
        icon,
        color,
        priority: Number(priority),
        approvalRequired,
        isActive,
        benefits: benefitsData,
      });

      if (res.success) {
        toast.success(`নতুন মেম্বারশিপ টাইপ ${name} তৈরি হয়েছে`);
        setIsCreateModalOpen(false);
        fetchTypes();
      } else {
        toast.error(res.error || "তৈরি করতে সমস্যা হয়েছে");
      }
    }
    setSubmitting(false);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const res = await adminToggleMembershipTypeActiveAction(id, !current);
    if (res.success) {
      toast.success(`মেম্বারশিপ টাইপ ${!current ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`);
      fetchTypes();
    } else {
      toast.error(res.error || "স্ট্যাটাস পরিবর্তন ব্যর্থ");
    }
  };

  const handleArchive = async (id: string, typeName: string) => {
    if (!window.confirm(`আপনি কি সত্যিই ${typeName} মেম্বারশিপ টাইপটি আরকাইভ করতে চান?`)) return;
    const res = await adminArchiveMembershipTypeAction(id);
    if (res.success) {
      toast.success(`${typeName} আরকাইভ করা হয়েছে`);
      fetchTypes();
    } else {
      toast.error(res.error || "আরকাইভ করা যায়নি");
    }
  };

  const addFeatureTag = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeatureTag = (f: string) => {
    setFeatures(features.filter((item) => item !== f));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-800 border-amber-300 font-extrabold text-[10px]"
            >
              BUSINESS MEMBERSHIP REGISTRY
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              BUSINESS-MEMBERSHIP-001A
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
            বিজনেস মেম্বারশিপ হাব ও টাইপ রেজিস্ট্রি
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            সিস্টেম রোল (System Role) থেকে সম্পূর্ণ পৃথকিকৃত বিজনেস মেম্বারশিপ আর্কিটেকচার।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTypes}
            disabled={loading}
            className="gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </Button>
          <Button
            size="sm"
            onClick={openCreateModal}
            className="gap-1.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-2xs"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            নতুন মেম্বারশিপ টাইপ তৈরি করুন
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1 border-b border-border/80 overflow-x-auto">
        {[
          { id: "types" as const, label: "মেম্বারশিপ টাইপসমূহ (Registry)", icon: Layers },
          {
            id: "applications" as const,
            label: "আবেদন ও রিভিউ সেন্টার (Approvals)",
            icon: ShieldCheck,
          },
          { id: "users" as const, label: "ব্যবহারকারীর মেম্বারশিপ ও রোল (Users)", icon: Users },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-extrabold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? "border-amber-500 text-amber-600 bg-amber-50/50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <IconComp className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MEMBERSHIP TYPES REGISTRY */}
      {activeSubTab === "types" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((t) => {
              const IconComponent = ICON_MAP[t.icon] || Sparkles;
              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
                    t.isActive
                      ? "bg-card border-border/80 shadow-2xs hover:shadow-md hover:border-amber-400"
                      : "bg-muted/30 border-dashed border-border opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-foreground">{t.banglaName}</h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-mono bg-slate-100"
                          >
                            {t.slug}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">{t.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        title="সম্পাদনা করুন"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(t.id, t.isActive)}
                        title={t.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          t.isActive
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(t.id, t.name)}
                        title="আরকাইভ করুন"
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {t.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-3 rounded-2xl border border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">
                        অনুমোদন প্রয়োজন?
                      </span>
                      <span className="font-extrabold text-foreground">
                        {t.approvalRequired ? "হ্যাঁ (Required)" : "না (Instant)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">
                        প্রাইসিং ডিসকাউন্ট:
                      </span>
                      <span className="font-extrabold text-amber-600">
                        {t.benefits?.pricingRules?.discountPercent || 0}% Discount
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">
                        সর্বনিম্ন অর্ডার:
                      </span>
                      <span className="font-extrabold text-foreground">
                        ৳{t.benefits?.minimumOrderAmount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">
                        অগ্রাধিকার (Priority):
                      </span>
                      <span className="font-extrabold text-foreground">Level {t.priority}</span>
                    </div>
                  </div>

                  {t.benefits?.features && t.benefits.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.benefits.features.map((f, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS & APPROVALS */}
      {activeSubTab === "applications" && <BusinessMembershipApprovalCenter />}

      {/* TAB 3: USERS & MEMBERSHIPS */}
      {activeSubTab === "users" && <UsersAdmin />}

      {/* CREATE / EDIT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveType}
            className="bg-card border border-border rounded-3xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto text-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {editingType ? "Edit Membership Type" : "New Membership Type"}
                </span>
                <h2 className="text-xl font-extrabold mt-1">
                  {editingType
                    ? `${editingType.banglaName} সম্পাদনা`
                    : "নতুন মেম্বারশিপ টাইপ তৈরি করুন"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                ✕ বন্ধ
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">
                  Unique Slug (ইংরেজিতে, e.g. dealer):
                </label>
                <Input
                  required
                  disabled={!!editingType}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. dealer"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">English Name:</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Authorized Dealer"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">
                  বাংলা নাম (Bangla Name):
                </label>
                <Input
                  required
                  value={banglaName}
                  onChange={(e) => setBanglaName(e.target.value)}
                  placeholder="যেমন: অথরাইজড ডিলার"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">
                  অ্যানিমেটেড আইকন (Icon):
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background outline-none"
                >
                  {Object.keys(ICON_MAP).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-extrabold text-muted-foreground">বিবরণ (Description):</label>
                <Input
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="এই মেম্বারশিপের বর্ণনা লিখুন..."
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">
                  ডিসকাউন্ট হার (Discount %):
                </label>
                <Input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">
                  সর্বনিম্ন অর্ডার টাকা (Min Order BDT):
                </label>
                <Input
                  type="number"
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="flex items-center gap-2 col-span-2 pt-1">
                <input
                  type="checkbox"
                  id="appReq"
                  checked={approvalRequired}
                  onChange={(e) => setApprovalRequired(e.target.checked)}
                  className="rounded border-border text-amber-500"
                />
                <label htmlFor="appReq" className="font-bold text-foreground">
                  এডমিন ম্যানুয়াল অনুমোদন আবশ্যক (Approval Required)
                </label>
              </div>
            </div>

            {/* Features Tags */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-black text-amber-600 block">
                মেম্বারশিপ সুবিধাসমূহ (Features & Perks):
              </label>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="নতুন সুবিধা লিখুন (e.g. Priority Support)"
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addFeatureTag}
                  className="h-9 text-xs font-bold"
                >
                  যোগ করুন
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {features.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1"
                  >
                    {f}
                    <X
                      className="h-3.5 w-3.5 cursor-pointer text-amber-700 hover:text-amber-900"
                      onClick={() => removeFeatureTag(f)}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {submitting ? "সংরক্ষণ হচ্ছে..." : "মেম্বারশিপ টাইপ সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BusinessMembershipDashboardComponent;
