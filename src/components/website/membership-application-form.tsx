"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Globe,
  Share2,
  Store,
  Building2,
  Send,
  CheckCircle2,
  Package,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  submitMembershipApplicationAction,
  submitApplicationWithRegistrationAction,
  updateMembershipApplicationAction,
} from "@/features/identity/actions/membership-application-actions";
import { BusinessMembershipApplicationEntity } from "@/features/identity/domain/business-membership-entity";
import { DistrictSelect } from "@/components/website/checkout/district-select";
import { ThanaSelect } from "@/components/website/checkout/thana-select";
import { BD_DISTRICTS, type BdDistrict } from "@/config/bd-districts";

interface MembershipApplicationFormProps {
  membershipType: string;
  existingApplication?: BusinessMembershipApplicationEntity | null;
  isLoggedIn?: boolean;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  "গ্যাজেট ও ইলেকট্রনিক্স",
  "অডিও ও হেডফোন",
  "স্মার্টওয়াচ ও ব্যান্ড",
  "মোবাইল অ্যাক্সেসরিজ",
  "হোম অ্যাপ্লায়েন্স",
  "কম্পিউটার ও আইটি",
];

const sanitizeUrl = (urlStr?: string): string | undefined => {
  if (!urlStr || !urlStr.trim()) return undefined;
  const trimmed = urlStr.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export function MembershipApplicationForm({
  membershipType,
  existingApplication,
  isLoggedIn = true,
  onSuccess,
}: MembershipApplicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Account Registration State (for non-logged in users)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Common Fields State
  const [fullName, setFullName] = useState(existingApplication?.commonFields?.fullName || "");
  const [phone, setPhone] = useState(existingApplication?.commonFields?.phone || "");
  const [bkashNumber, setBkashNumber] = useState(
    existingApplication?.commonFields?.bkashNumber || "",
  );

  // District & Thana State
  const initialDistName = existingApplication?.commonFields?.district || "Dhaka";
  const matchedDist = BD_DISTRICTS.find(
    (d) => d.name.toLowerCase() === initialDistName.toLowerCase() || d.nameEn.toLowerCase() === initialDistName.toLowerCase()
  ) || BD_DISTRICTS[0];

  const [districtId, setDistrictId] = useState(matchedDist.id);
  const [district, setDistrict] = useState(matchedDist.name);
  const [upazila, setUpazila] = useState(existingApplication?.commonFields?.upazila || "");
  const [fullAddress, setFullAddress] = useState(
    existingApplication?.commonFields?.fullAddress || "",
  );
  const [facebookProfile, setFacebookProfile] = useState(
    existingApplication?.commonFields?.facebookProfile || "",
  );
  const [facebookPage, setFacebookPage] = useState(
    existingApplication?.commonFields?.facebookPage || "",
  );
  const [website, setWebsite] = useState(existingApplication?.commonFields?.website || "");
  const [salesChannel, setSalesChannel] = useState(
    existingApplication?.commonFields?.salesChannel || "Facebook Page",
  );

  // Reseller Fields State
  const [monthlyOrders, setMonthlyOrders] = useState<"0-20" | "20-50" | "50-100" | "100+">(
    existingApplication?.resellerFields?.monthlyOrders || "0-20",
  );
  const [productCategories, setProductCategories] = useState<string[]>(
    existingApplication?.resellerFields?.productCategories || ["গ্যাজেট ও ইলেকট্রনিক্স"],
  );

  // Wholesaler Fields State
  const [companyName, setCompanyName] = useState(
    existingApplication?.wholesalerFields?.companyName || "",
  );
  const [businessType, setBusinessType] = useState<
    "Retail Shop" | "Online Shop" | "Distributor" | "Dealer" | "Importer" | "Other"
  >(existingApplication?.wholesalerFields?.businessType || "Retail Shop");
  const [estimatedMonthlyPurchase, setEstimatedMonthlyPurchase] = useState<
    "২০,০০০+" | "৫০,০০০+" | "১,০০,০০০+" | "৫,০০,০০০+"
  >(existingApplication?.wholesalerFields?.estimatedMonthlyPurchase || "২০,০০০+");
  const [tradeLicense, setTradeLicense] = useState(
    existingApplication?.wholesalerFields?.tradeLicense || "",
  );
  const [binNumber, setBinNumber] = useState(
    existingApplication?.wholesalerFields?.binNumber || "",
  );
  const [tinNumber, setTinNumber] = useState(
    existingApplication?.wholesalerFields?.tinNumber || "",
  );
  const [userAnswer, setUserAnswer] = useState(existingApplication?.userAnswer || "");

  const isReseller = membershipType === "reseller";

  const handleCategoryToggle = (cat: string) => {
    setProductCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleDistrictChange = (bdDist: BdDistrict) => {
    setDistrictId(bdDist.id);
    setDistrict(bdDist.name);
    setUpazila(""); // reset upazila when district changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।");
      return;
    }
    if (!phone.trim()) {
      toast.error("অনুগ্রহ করে মোবাইল নম্বর লিখুন।");
      return;
    }
    if (!bkashNumber.trim()) {
      toast.error("অনুগ্রহ করে বিকাশ নম্বর লিখুন।");
      return;
    }
    if (!fullAddress.trim()) {
      toast.error("অনুগ্রহ করে সম্পূর্ণ ঠিকানা লিখুন।");
      return;
    }

    if (!isLoggedIn && !existingApplication) {
      if (!email.trim() || !password.trim()) {
        toast.error("রেজিস্ট্রেশনের জন্য ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক।");
        return;
      }
      if (password.length < 6) {
        toast.error("পাসওয়ার্ড সর্বনিম্ন ৬ অক্ষরের হতে হবে।");
        return;
      }
    }

    setLoading(true);

    try {
      const commonFields = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        bkashNumber: bkashNumber.trim(),
        district,
        upazila,
        fullAddress: fullAddress.trim(),
        facebookProfile: sanitizeUrl(facebookProfile),
        facebookPage: sanitizeUrl(facebookPage),
        website: sanitizeUrl(website),
        salesChannel,
      };

      const resellerFields = isReseller
        ? {
            monthlyOrders,
            productCategories,
          }
        : undefined;

      const wholesalerFields = !isReseller
        ? {
            companyName: companyName.trim() || fullName,
            businessType,
            estimatedMonthlyPurchase,
            tradeLicense: tradeLicense.trim() || undefined,
            binNumber: binNumber.trim() || undefined,
            tinNumber: tinNumber.trim() || undefined,
          }
        : undefined;

      if (existingApplication) {
        const res = await updateMembershipApplicationAction({
          applicationId: existingApplication.id,
          commonFields,
          resellerFields,
          wholesalerFields,
          userAnswer: userAnswer.trim() || undefined,
        });

        if (!res.success) {
          toast.error(res.error || "আপডেট ব্যর্থ হয়েছে");
        } else {
          toast.success("আবেদনটি সফলভাবে সংশোধন করে জমা দেওয়া হয়েছে!");
          if (onSuccess) onSuccess();
          router.refresh();
        }
      } else if (!isLoggedIn) {
        const res = await submitApplicationWithRegistrationAction({
          email: email.trim(),
          password,
          membershipType,
          commonFields,
          resellerFields,
          wholesalerFields,
        });

        if (!res.success) {
          toast.error(res.error || "নিবন্ধন ও আবেদন জমাদানে সমস্যা হয়েছে");
        } else {
          toast.success("অভিনন্দন! আপনার অ্যাকাউন্ট তৈরি ও আবেদন জমা সম্পন্ন হয়েছে।");
          if (onSuccess) onSuccess();
          router.push("/account/reseller");
        }
      } else {
        const res = await submitMembershipApplicationAction({
          membershipType,
          commonFields,
          resellerFields,
          wholesalerFields,
        });

        if (!res.success) {
          toast.error(res.error || "আবেদন জমাদানে সমস্যা হয়েছে");
        } else {
          toast.success("অভিনন্দন! আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে।");
          if (onSuccess) onSuccess();
          router.push("/account/reseller");
        }
      }
    } catch {
      toast.error("আবেদন প্রক্রিয়াকরণে অপ্রত্যাশিত ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-10 shadow-xs text-slate-900 space-y-8"
    >
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
          {isReseller ? "রিসেলার আবেদন ফরম" : "হোলসেলার আবেদন ফরম"}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          {isReseller
            ? "জিরো ইনভেস্টমেন্টে ড্রপশিপিং শুরু করুন"
            : "বি২বি পাইকারি মেম্বারশিপের জন্য আবেদন করুন"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
          অনুগ্রহ করে আপনার সঠিক তথ্য প্রদান করুন। এডমিন টিম ১-২ ঘণ্টার মধ্যে আবেদনটি রিভিউ করবে।
        </p>
      </div>

      {/* Admin Information Request Question Prompt */}
      {existingApplication?.status === "need_info" && existingApplication.adminQuestion && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-300 space-y-2">
          <label className="text-xs font-black text-blue-900 block">
            এডমিনের প্রশ্ন: {existingApplication.adminQuestion}
          </label>
          <textarea
            required
            rows={2}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="প্রশ্নটির বিস্তারিত উত্তর এখানে লিখুন..."
            className="w-full p-3 text-xs font-bold rounded-xl bg-white border border-blue-300 text-slate-900 outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Account Registration Section for Non-Logged-In Users */}
      {!isLoggedIn && !existingApplication && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
            <User className="w-4 h-4 text-amber-600" />
            অ্যাকাউন্ট তৈরির তথ্য (নতুন রিসেলারদের জন্য)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-900">
                ইমেইল এড্রেস <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-900">
                পাসওয়ার্ড <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="সর্বনিম্ন ৬ অক্ষর"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Personal & Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-amber-600 uppercase tracking-wider border-b border-slate-100 pb-2">
          ১. ব্যক্তিগত ও যোগাযোগের তথ্য
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" /> পূর্ণ নাম{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="যেমন: মোহাম্মদ রহিম"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> মোবাইল নম্বর{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" /> বিকাশ নম্বর (প্রফিট ক্যাশআউটের জন্য) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Location & Address (Searchable District & Thana) */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-amber-600 uppercase tracking-wider border-b border-slate-100 pb-2">
          ২. ঠিকানা ও জেলা তথ্য
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> জেলা <span className="text-red-500">*</span>
            </label>
            <DistrictSelect
              value={districtId}
              onChange={handleDistrictChange}
              placeholder="জেলা খুঁজুন বা নির্বাচন করুন..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> উপজেলা / থানা <span className="text-red-500">*</span>
            </label>
            <ThanaSelect
              districtId={districtId}
              value={upazila}
              onChange={setUpazila}
              placeholder="থানা / উপজেলা নির্বাচন করুন..."
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="বাসা নং, রোড নং, এলাকা বিস্তারিত লিখুন..."
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Business & Sales Channel Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-amber-600 uppercase tracking-wider border-b border-slate-100 pb-2">
          ৩. ব্যবসা ও বিক্রয়ের তথ্য
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-600" /> আপনি কীভাবে পণ্য বিক্রি করেন? <span className="text-red-500">*</span>
            </label>
            <select
              value={salesChannel}
              onChange={(e) => setSalesChannel(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            >
              <option value="Facebook Page">Facebook Page</option>
              <option value="Facebook Live">Facebook Live</option>
              <option value="Facebook Profile">Facebook Profile</option>
              <option value="TikTok">TikTok</option>
              <option value="Website">Website</option>
              <option value="Physical Shop">Physical Shop</option>
              <option value="Marketplace">Marketplace</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-slate-400" /> ফেসবুক পেজ লিংক (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={facebookPage}
              onChange={(e) => setFacebookPage(e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-slate-400" /> ফেসবুক প্রোফাইল লিংক (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={facebookProfile}
              onChange={(e) => setFacebookProfile(e.target.value)}
              placeholder="https://facebook.com/yourprofile"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> ওয়েবসাইট লিংক (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourstore.com"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Reseller Specific Fields */}
        {isReseller && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-600" /> বর্তমানে মাসে আনুমানিক কতটি অর্ডার পান?
              </label>
              <select
                value={monthlyOrders}
                onChange={(e) =>
                  setMonthlyOrders(e.target.value as "0-20" | "20-50" | "50-100" | "100+")
                }
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-amber-500"
              >
                <option value="0-20">0-20 টি (নতুন শুরু করছি)</option>
                <option value="20-50">20-50 টি</option>
                <option value="50-100">50-100 টি</option>
                <option value="100+">100+ টি (রেগুলার বিক্রয়কারী)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 block">
                কোন ধরনের পণ্য বিক্রি করতে চান? (পছন্দ করুন):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const selected = productCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                        selected
                          ? "bg-amber-50 border-amber-400 text-amber-950 font-black shadow-2xs"
                          : "bg-slate-50 border-slate-300 text-slate-700 hover:border-amber-300"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${selected ? "bg-amber-500 border-amber-600 text-white" : "border-slate-300"}`}
                      >
                        {selected && <CheckCircle2 className="w-3 h-3" />}
                      </span>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wholesaler Specific Fields */}
        {!isReseller && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" /> প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="আপনার প্রতিষ্ঠানের নাম"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900">ব্যবসার ধরণ</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-amber-500"
                >
                  <option value="Retail Shop">Retail Shop</option>
                  <option value="Online Shop">Online Shop</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Dealer">Dealer</option>
                  <option value="Importer">Importer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900">মাসে আনুমানিক ক্রয়ের পরিমাণ</label>
                <select
                  value={estimatedMonthlyPurchase}
                  onChange={(e) => setEstimatedMonthlyPurchase(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-amber-500"
                >
                  <option value="২০,০০০+">২০,০০০+</option>
                  <option value="৫০,০০০+">৫০,০০০+</option>
                  <option value="১,০০,০০০+">১,০০,০০০+</option>
                  <option value="৫,০০,০০০+">৫,০০,০০০+</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900">ট্রেড লাইসেন্স (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  placeholder="ট্রেড লাইসেন্স নম্বর"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900">BIN নম্বর (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={binNumber}
                  onChange={(e) => setBinNumber(e.target.value)}
                  placeholder="BIN নম্বর"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900">TIN নম্বর (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="TIN নম্বর"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-13 min-h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md gap-2"
        >
          <Send className="w-4 h-4" />
          {loading
            ? "জমাদান প্রসেসিং হচ্ছে..."
            : existingApplication
              ? "সংশোধিত আবেদন জমা দিন"
              : "আবেদন জমা দিন"}
        </Button>
      </div>
    </form>
  );
}
