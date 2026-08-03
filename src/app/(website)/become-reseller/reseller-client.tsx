"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  DollarSign,
  PackageCheck,
  Zap,
  ArrowRight,
  Store,
  CheckCircle2,
  Download,
  Truck,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Quote,
  Star,
  Sparkles,
} from "lucide-react";
import { MembershipApplicationForm } from "@/components/website/membership-application-form";
import { MembershipStatusTimeline } from "@/components/website/membership-status-timeline";
import { BusinessMembershipApplicationEntity } from "@/features/identity/domain/business-membership-entity";
import { ResellerMarginCalculator } from "@/components/website/reseller-margin-calculator";

interface ResellerClientProps {
  initialData?: {
    isLoggedIn?: boolean;
    activeApplication?: BusinessMembershipApplicationEntity | null;
    isMember?: boolean;
  } | null;
}

const RESELLER_STEPS = [
  {
    step: "০১",
    title: "ফ্রি সাইন-আপ করুন",
    desc: "মাত্র ১ মিনিটে নাম ও মোবাইল নম্বর দিয়ে রিসেলার অ্যাকাউন্ট তৈরি করুন।",
    icon: Users,
  },
  {
    step: "০২",
    title: "প্রোডাক্ট সিলেক্ট করুন",
    desc: "১০,০০০+ হোলসেল ট্রেন্ডিং গ্যাজেট ও ফ্যাশন ক্যাটালগ থেকে প্রোডাক্ট পছন্দ করুন।",
    icon: PackageCheck,
  },
  {
    step: "০৩",
    title: "নিজের দামে বিক্রি করুন",
    desc: "নিজের পেজ/গ্রুপে নিজের লাভের মার্জিন যোগ করে পোস্ট করুন ও অর্ডার নিন।",
    icon: Store,
  },
  {
    step: "০৪",
    title: "লাভ Withdraw করুন",
    desc: "ডেলিভারি হওয়ামাত্র আপনার প্রফিট সরাসরি বিকাশ বা নগদ অ্যাকাউন্টে গ্রহণ করুন।",
    icon: DollarSign,
  },
];

const RESELLER_BENEFITS = [
  {
    icon: DollarSign,
    title: "জিরো ইনভেস্টমেন্ট",
    desc: "কোনো অগ্রিম জামানত বা সিকিউরিটি মানি ছাড়াই ব্যবসা শুরু করার সুযোগ।",
  },
  {
    icon: PackageCheck,
    title: "১০,০০০+ প্রোডাক্ট ক্যাটালগ",
    desc: "ট্রেন্ডিং গ্যাজেট, ইলেকট্রনিক্স, মোবাইল অ্যাক্সেসরিজ ও ফ্যাশন কালেকশন।",
  },
  {
    icon: Download,
    title: "১-ক্লিক ক্যাটালগ এক্সপোর্ট",
    desc: "ফেসবুক পেজ ও ওয়াটসঅ্যাপ গ্রুপের জন্য ক্যাটালগ ও কন্টেন্ট এক্সপোর্ট করার সুবিধা।",
  },
  {
    icon: Zap,
    title: "ফ্রি মার্কেটিং কিট",
    desc: "হাই-কোয়ালিটি ফটো, ব্যানার ও প্রমোশনাল ভিডিও ফাইল বিনামূল্যে ডাউনলোড করুন।",
  },
  {
    icon: ShieldCheck,
    title: "সহজ Withdrawal সিস্টেম",
    desc: "বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে সাপ্তাহিক পে-আউট রিকোয়েস্ট ব্যবস্থা।",
  },
  {
    icon: Truck,
    title: "সারা বাংলাদেশে COD",
    desc: "আপনার নিজস্ব শপের ব্রান্ডিং নামে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি।",
  },
];

const RESELLER_TESTIMONIALS = [
  {
    name: "মাহমুদুল হাসান",
    shop: "Gadget Hub BD",
    location: "ঢাকা",
    monthlyIncome: "৳৪৫,০০০+/মাস",
    quote:
      "NN Enterprise এর সাহায্যে স্টক ছাড়া ফেসবুকে গ্যাজেটের ব্যবসা করছি। সবচেয়ে ভালো বিষয় হলো ডেলিভারি নিয়ে কোনো চিন্তা করতে হয় না, তারা সব সামলায়।",
    rating: 5,
  },
  {
    name: "সাবরিনা আক্তার",
    shop: "Smart Collection",
    location: "চট্টগ্রাম",
    monthlyIncome: "৳২৮,০০০+/মাস",
    quote:
      "ছাত্রী অবস্থায় নিজের পড়াশোনার খরচ চালানোর সেরা উপায় এটা। প্রোডাক্ট কোয়ালিটি অনেক ভালো এবং কাস্টমাররা অনেক সন্তুষ্ট থাকে।",
    rating: 5,
  },
  {
    name: "আরিফুল ইসলাম",
    shop: "Tech Store BD",
    location: "বগুড়া",
    monthlyIncome: "৳৬২,০০০+/মাস",
    quote:
      "আমি ঢাকার বাইরে থেকেও সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে প্রোডাক্ট বিক্রি করতে পারছি। উইথড্রয়াল প্রসেস অনেক ফাস্ট।",
    rating: 5,
  },
];

const RESELLER_FAQS = [
  {
    q: "ড্রপশিপিং রিসেলিং কীভাবে কাজ করে?",
    a: "আপনি আমাদের ক্যাটালগ থেকে প্রোডাক্ট পছন্দ করে আপনার ফেসবুক পেজ, গ্রুপ বা পরিচিতদের কাছে নিজের দামে বিক্রি করবেন। অর্ডার পাওয়ার পর আমাদের ড্যাশবোর্ডে কাস্টমারের ঠিকানা দিয়ে অর্ডার প্লেস করবেন। আমরা কাস্টমারের কাছে ডেলিভারি করে আপনার প্রফিট আপনার ওয়ালেটে জমা করে দেব।",
  },
  {
    q: "পার্সেল পাঠানোর সময় কি আপনাদের কোম্পানির নাম থাকবে?",
    a: "না! পার্সেলের ইনভয়েস ও লেবেলে আপনার ফেসবুক পেজ/শপের নাম এবং ফোন নম্বর ব্যবহার করা হবে। কাস্টমার বুঝতেই পারবে না যে এটি ড্রপশিপিং করা হয়েছে।",
  },
  {
    q: "লাভের টাকা কখন এবং কীভাবে পাব?",
    a: "কাস্টমার কুরিয়ার থেকে পণ্য বুঝে পেয়ে টাকা পরিশোধ হওয়ামাত্র প্রফিট আপনার ওয়ালেটে অ্যাপ্রুভ হবে। সর্বনিম্ন ৫০০ টাকা হলেই বিকাশ বা নগদ অ্যাকাউন্টে ক্যাশআউট করতে পারবেন।",
  },
  {
    q: "রেজিস্ট্রেশন করতে কি কোনো ফি লাগে?",
    a: "না, রিসেলার হিসেবে রেজিস্ট্রেশন সম্পূর্ণ ফ্রী। কোনো গোপন বা সার্ভিস চার্জ নেই।",
  },
];

export function ResellerApplicationPageClient({ initialData }: ResellerClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const isLoggedIn = initialData?.isLoggedIn;
  const activeApp = initialData?.activeApplication;
  const isMember = initialData?.isMember;

  const scrollToSignup = () => {
    document.getElementById("reseller-signup-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
      {/* ── 1. Hero Section ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 p-6 sm:p-12 text-center text-white shadow-xl space-y-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 50% 0%, hsl(38 92% 50% / 0.35), transparent 70%)",
          }}
        />

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
            <Users className="w-4 h-4 text-amber-400" /> জিরো ক্যাপিটাল ড্রপশিপিং বিজনেস
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            স্টক ছাড়াই নিজের ব্যবসা শুরু করুন
          </h1>

          <p className="text-xs sm:text-base text-slate-300 font-bold max-w-2xl mx-auto leading-relaxed">
            পণ্য কেনা বা ইনভেন্টরির ঝুঁকি ছাড়াই আপনার ফেসবুক পেজ বা ওয়েবসাইটে প্রোডাক্ট বিক্রি করুন। আমরা সরাসরি আপনার কাস্টমারের নিকট ডেলিভারি পাঠাব।
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToSignup}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-sm transition-all shadow-md touch-manipulation"
            >
              <span>রিসেলার হিসেবে যুক্ত হন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-black text-sm transition-all"
            >
              <span>কীভাবে কাজ করে দেখুন</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. How It Works (4 Visual Steps) ───────────────────── */}
      <div id="how-it-works" className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            সহজ প্রসেস
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            কীভাবে কাজ করে (৪টি সহজ স্টেপ)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESELLER_STEPS.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-black text-slate-300 dark:text-slate-700 font-mono">
                    {st.step}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{st.title}</h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Reseller Profit Margin Calculator ────────────────── */}
      <ResellerMarginCalculator />

      {/* ── 4. Reseller Benefits Grid ──────────────────────────── */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            কেন NN Enterprise
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            রিসেলার পার্টনারদের বিশেষ সুবিধাসমূহ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESELLER_BENEFITS.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{b.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Reseller Success Stories (Testimonials) ─────────── */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            সাকসেস স্টোরি
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            সফল রিসেলারদের মতামত
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {RESELLER_TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{t.name}</h4>
                  <p className="text-[11px] font-bold text-slate-500">{t.shop} • {t.location}</p>
                </div>
                <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  {t.monthlyIncome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Application Form Section ────────────────────────── */}
      <div id="reseller-signup-form" className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            রেজিস্ট্রেশন
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            আজই রিসেলার হিসেবে যুক্ত হন
          </h2>
        </div>

        {!isLoggedIn ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                <Store className="w-5 h-5 text-amber-600 shrink-0" />
                <span>পূর্বেই অ্যাকাউন্ট থেকে থাকলে সরাসরি লগইন করুন:</span>
              </div>
              <Link
                href="/auth/login?redirect=/become-reseller"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs shrink-0"
              >
                লগইন করুন <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <MembershipApplicationForm
              membershipType="reseller"
              isLoggedIn={false}
              onSuccess={() => router.refresh()}
            />
          </div>
        ) : isMember ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto">
            <Store className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-200">
              আপনি ইতোমধ্যে একজন অনুমোদিত রিসেলার!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 font-bold max-w-md mx-auto">
              আপনার রিসেলার ড্যাশবোর্ডে প্রবেশ করে প্রফিট কাস্টমাইজেশন, ক্যাটাগরি প্রাইসিং ও মার্কেটিং
              কিট উপভোগ করুন।
            </p>
            <Link
              href="/reseller"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-8 py-3 rounded-xl shadow-md"
            >
              রিসেলার ড্যাশবোর্ডে যান →
            </Link>
          </div>
        ) : activeApp && !editing ? (
          <div className="max-w-3xl mx-auto">
            <MembershipStatusTimeline
              application={activeApp}
              onEditRequested={() => setEditing(true)}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <MembershipApplicationForm
              membershipType="reseller"
              existingApplication={activeApp}
              onSuccess={() => setEditing(false)}
            />
          </div>
        )}
      </div>

      {/* ── 7. Reseller FAQ Accordion ───────────────────────────── */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            সাধারণ কিছু প্রশ্নের উত্তর
          </h2>
        </div>

        <div className="space-y-3">
          {RESELLER_FAQS.map((faq, i) => {
            const isOpen = activeFaqIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 gap-3"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ResellerApplicationPageClient;
