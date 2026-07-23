"use client";

import { useState } from "react";
import { Star, CheckCircle2, Truck, RotateCcw, Building2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Specification {
  key: string;
  value: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
}

interface QAItem {
  id: string;
  question: string;
  author: string;
  answer?: string;
  date: string;
}

interface ProductTabsSectionProps {
  description?: string;
  highlights?: string[];
  specifications?: Specification[];
  reviews?: Review[];
  qaList?: QAItem[];
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "মোহাব্বাত চৌধুরী",
    rating: 5,
    date: "2026-07-15",
    comment: "১০০% অরিজিনাল প্রোডাক্ট। ফাস্ট চার্জিং খুব সুন্দর কাজ করছে। ডেলিভারি ২ দিনেই পেয়েছি!",
    verified: true,
    helpfulCount: 14,
  },
  {
    id: "rev-2",
    author: "ফারিয়া আক্তার",
    rating: 5,
    date: "2026-07-10",
    comment: "প্যাকেজিং দারুণ ছিল। সাউন্ড কোয়ালিটি এবং বেস খুব সুন্দর। রেকমেন্ড করব।",
    verified: true,
    helpfulCount: 8,
  },
];

const MOCK_QA: QAItem[] = [
  {
    id: "qa-1",
    question: "এই প্রোডাক্টটির কতদিনের ওয়ারেন্টি আছে?",
    author: "আরিফুল ইসলাম",
    answer: "ধন্যবাদ। এই প্রোডাক্টটিতে ১ বছরের অফিসিয়াল ওয়ারেন্টি রয়েছে।",
    date: "2026-07-18",
  },
  {
    id: "qa-2",
    question: "চট্টগ্রামে কতদিনে ডেলিভারি হবে?",
    author: "রফিকুল হাসান",
    answer: "Pathao / Steadfast কুরিয়ারের মাধ্যমে ২-৩ কার্যদিবসের মধ্যে চট্টগ্রাম পৌঁছাবে।",
    date: "2026-07-12",
  },
];

export function ProductTabsSection({
  description = "বাংলাদেশের বাজারের জন্য সেরা কোয়ালিটির ইলেকট্রনিক্স প্রোডাক্ট। উচ্চ পারফরম্যান্স এবং টেকসই বিল্ড কোয়ালিটি।",
  highlights = ["১০০% অরিজিনাল গ্যারান্টি", "১ বছরের ওয়ারেন্টি সুবিধা", "দ্রুত সারা বাংলাদেশে ডেলিভারি", "সহজ রিটার্ন পলিসি"],
  specifications = [
    { key: "ব্র্যান্ড", value: "DropshopNN Premium" },
    { key: "মডেল", value: "DS-2026-PRO" },
    { key: "ইনপুট ভোল্টেজ", value: "100-240V AC, 50/60Hz" },
    { key: "আউটপুট পাওয়ার", value: "65W Max Fast Charge" },
    { key: "ওয়ারেন্টি", value: "১ বছর অফিসিয়াল গ্যারান্টি" },
  ],
  reviews = MOCK_REVIEWS,
  qaList = MOCK_QA,
}: ProductTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "reviews" | "qa" | "shipping" | "wholesale">("overview");
  const [newQuestion, setNewQuestion] = useState("");

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    toast.success("আপনার প্রশ্নটি জমা নেওয়া হয়েছে। খুব শীঘ্রই উত্তর দেওয়া হবে!");
    setNewQuestion("");
  };

  return (
    <div className="mt-12 bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-xs text-slate-900">
      {/* Tabs Header Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "overview" ? "bg-amber-500 text-white shadow-xs" : "text-slate-800 hover:bg-slate-100 border border-slate-300"
          }`}
        >
          বিবরণ (Overview)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "specs" ? "bg-amber-500 text-white shadow-xs" : "text-slate-800 hover:bg-slate-100 border border-slate-300"
          }`}
        >
          স্পেসিফিকেশন ({specifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "reviews" ? "bg-amber-500 text-white shadow-xs" : "text-slate-800 hover:bg-slate-100 border border-slate-300"
          }`}
        >
          রিভিউ ({reviews.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "qa" ? "bg-amber-500 text-white shadow-xs" : "text-slate-800 hover:bg-slate-100 border border-slate-300"
          }`}
        >
          প্রশ্ন ও উত্তর ({qaList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shipping")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "shipping" ? "bg-amber-500 text-white shadow-xs" : "text-slate-800 hover:bg-slate-100 border border-slate-300"
          }`}
        >
          ডেলিভারি & রিটার্ন
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("wholesale")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "wholesale" ? "bg-amber-500 text-white shadow-xs" : "text-slate-800 hover:bg-slate-100 border border-slate-300"
          }`}
        >
          পাইকারি তথ্য (Wholesale)
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="pt-6">
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
              {description}
            </p>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                মূল সুবিধাসমূহ (Key Features)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-black text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Specs Tab */}
        {activeTab === "specs" && (
          <div className="max-w-2xl">
            <div className="rounded-2xl border border-slate-300 overflow-hidden divide-y divide-slate-200">
              {specifications.map((s, i) => (
                <div key={i} className="grid grid-cols-3 p-3.5 text-xs">
                  <span className="font-bold text-slate-600">{s.key}</span>
                  <span className="col-span-2 font-black text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-300">
              <div className="text-center">
                <span className="block text-3xl font-black text-amber-900">4.8</span>
                <span className="text-[10px] font-black text-amber-950">গড় রেটিং</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {reviews.length} টি ভেরিফাইড রিভিউ এর ভিত্তিতে
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-slate-300 space-y-2 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{r.author}</span>
                      {r.verified && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> ভেরিফাইড ক্রয়
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{r.date}</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Q&A Tab */}
        {activeTab === "qa" && (
          <div className="space-y-6 max-w-3xl">
            <form onSubmit={handleAskQuestion} className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-amber-500" />
                আপনার কোনো প্রশ্ন আছে?
              </h4>
              <textarea
                required
                rows={2}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="প্রোডাক্ট সম্পর্কে জানতে আপনার প্রশ্নটি লিখুন..."
                className="w-full p-3 text-xs font-bold rounded-xl bg-white border border-slate-300 outline-none focus:border-amber-500 text-slate-900"
              />
              <Button size="sm" type="submit" className="h-8.5 px-4 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white">
                প্রশ্ন জমা দিন
              </Button>
            </form>

            <div className="space-y-4">
              {qaList.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-300 space-y-2 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">প্রশ্ন: {q.question}</span>
                    <span className="text-[10px] font-bold text-slate-500">{q.date}</span>
                  </div>
                  {q.answer && (
                    <div className="p-3 rounded-xl bg-amber-50 text-xs text-amber-950 font-bold border border-amber-200">
                      উত্তর: {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Shipping & Returns */}
        {activeTab === "shipping" && (
          <div className="space-y-4 max-w-2xl text-xs font-bold text-slate-800 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-2">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-amber-500" />
                ডেলিভারি চার্জ ও সময়সীমা
              </h4>
              <p>ঢাকার ভেতরে: ৳৬০ (২৪-৪৮ ঘন্টা)</p>
              <p>ঢাকার বাইরে (৬৪ জেলা): ৳১২০ (২-৩ কার্যদিবস)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-2">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                রিটার্ন ও রিফান্ড পলিসি
              </h4>
              <p>প্রোডাক্টে সমস্যা থাকলে ডেলিভারির ৭ দিনের মধ্যে সহজেই রিটার্ন ও এক্সচেঞ্জ করতে পারবেন।</p>
            </div>
          </div>
        )}

        {/* 6. Wholesale Info */}
        {activeTab === "wholesale" && (
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 max-w-2xl shadow-md">
            <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              পাইকারি ও বাল্ক অর্ডার গাইডলাইন
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-bold">
              আমরা সরাসরি ডাইরেক্ট ইম্পোর্টার এবং ব্র্যান্ড ডিস্ট্রিবিউটর রেটে পাইকারি বিক্রি করে থাকি। পাইকারি অর্ডারের ক্ষেত্রে মিনিমাম ১০ পিস অর্ডার করতে হবে।
            </p>
            <div className="pt-2">
              <Button size="sm" className="h-9 px-4 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white">
                হোলসেল অ্যাকাউন্ট আবেদন করুন
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductTabsSection;
