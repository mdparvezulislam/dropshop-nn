"use client";

import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { BRAND } from "@/config/brand";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "reseller" | "wholesale";
}

const FAQS: FAQItem[] = [
  {
    id: "1",
    category: "general",
    question: `${BRAND.publicName} কি এবং কিভাবে অর্ডার করব?`,
    answer:
      `${BRAND.publicName} হলো বাংলাদেশের একটি বিশ্বস্ত অনলাইন শপিং ও কমার্স প্ল্যাটফর্ম। আপনি ওয়েবসাইটের প্রোডাক্ট ক্যাটালগ থেকে যেকোনো প্রোডাক্ট বেছে নিয়ে 'কার্টে যোগ করুন' বা 'সরাসরি কিনুন' বাটনে ক্লিক করে সহজেই অর্ডার সম্পন্ন করতে পারবেন।`,
  },
  {
    id: "2",
    category: "general",
    question: "ডেলিভারি চার্জ ও সময় কত?",
    answer:
      "ঢাকার ভেতরে সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৬৪ জেলায় ২-৩ কার্যদিবসের মধ্যে পাথাও ও স্টিডফাস্ট কুরিয়ারের মাধ্যমে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি দেওয়া হয়।",
  },
  {
    id: "3",
    category: "reseller",
    question: "রিসেলার হিসেবে কিভাবে কাজ শুরু করব?",
    answer:
      "আমাদের 'রিসেলার হন' পেজে গিয়ে ফ্রী রেজিস্টার করুন। রেজিস্ট্রেশন সম্পন্ন হলে আপনি আপনার নিজস্ব দামে প্রোডাক্টগুলো গ্রাহকদের কাছে বিক্রি করতে পারবেন এবং প্রফিট সহজেই উইথড্র করতে পারবেন।",
  },
  {
    id: "4",
    category: "reseller",
    question: "রিসেলিং করতে কোনো অগ্রিম ইনভেস্টমেন্ট লাগে?",
    answer:
      "না, কোনো অগ্রিম ইনভেস্টমেন্ট ছাড়াই আপনি হাজার হাজার অরিজিনাল প্রোডাক্ট সোর্স ও রিয়েলটাইম অর্ডার প্লেস করতে পারবেন। কাস্টমার কুরিয়ারে টাকা পরিশোধ করার সাথে সাথে আপনার প্রফিট ওয়ালেটে যুক্ত হবে।",
  },
  {
    id: "5",
    category: "wholesale",
    question: "পাইকারি বা বাল্ক অর্ডারের প্রসেস কি?",
    answer:
      "বাল্ক বা পাইকারি অর্ডারের জন্য আমাদের 'হোলসেলার হন' পোর্টালে যুক্ত হোন। এখানে বড় অর্ডারের ওপর বিশেষ ফ্যাক্টরি রেট ও ডিসকাউন্ট অফার পাওয়া যায়।",
  },
  {
    id: "6",
    category: "general",
    question: "প্রোডাক্টের ওয়ারেন্টি ও রিটার্ন পলিসি কি?",
    answer:
      "আমরা ১০০% অরিজিনাল গ্যাজেট ও অফিশিয়াল ওয়ারেন্টি গ্যারান্টি দিই। যেকোনো ড্যামেজ বা ভুল প্রোডাক্টে রয়েছে সহজ ৭ দিনের রিটার্ন পলিসি।",
  },
];

const CATEGORIES = [
  { id: "general", label: "সাধারণ বিষয়াবলী" },
  { id: "reseller", label: "রিসেলার গাইড" },
  { id: "wholesale", label: "পাইকারি ও বাল্ক" },
] as const;

export function FAQSection(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<"general" | "reseller" | "wholesale">("general");
  const filteredFaqs = FAQS.filter((faq) => faq.category === activeCategory);
  const [activeId, setActiveId] = useState<string>("1");

  return (
    <section
      className="w-full py-10 sm:py-16 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8 max-w-xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black text-amber-600 dark:text-amber-400">
            <HelpCircle className="h-4 w-4 text-amber-500" aria-hidden />
            <span>সাধারণ জিজ্ঞাসাসমূহ</span>
          </div>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100"
          >
            সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
            {BRAND.publicName} প্ল্যাটফর্ম ব্যবহারের প্রয়োজনীয় নির্দেশিকা
          </p>
        </div>

        {/* 3 Tab Buttons */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                const firstMatch = FAQS.find((f) => f.category === cat.id);
                setActiveId(firstMatch ? firstMatch.id : "");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion Items */}
        <div className="max-w-2xl mx-auto space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = activeId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveId(isOpen ? "" : faq.id)}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-amber-500"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
