import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { PackageCheck, PencilLine, ShieldCheck, Star, Trash2 } from "lucide-react";

/**
 * Review policy page.
 *
 * There is no cross-site review aggregate on the storefront, so this page
 * deliberately carries NO ratings, counts, testimonials, or percentages — it
 * explains how reviews work and sends people to the surfaces where real
 * reviews live (individual products) and are written (/account/reviews).
 */

export const metadata: Metadata = {
  title: "রিভিউ নীতিমালা — ভেরিফায়েড ক্রেতার মতামত",
  description:
    "DropshopNN-এ রিভিউ দিতে পারেন শুধু সেই ক্রেতারা যাঁদের অর্ডার ডেলিভারি সম্পন্ন হয়েছে। রিভিউ কীভাবে কাজ করে তা জানুন।",
  alternates: { canonical: "/reviews" },
};

const STEPS: ReadonlyArray<{ title: string; description: string }> = [
  {
    title: "প্রোডাক্ট অর্ডার করুন",
    description: "যেকোনো প্রোডাক্ট অর্ডার করে ডেলিভারি বুঝে নিন।",
  },
  {
    title: "ডেলিভারি সম্পন্ন হলে",
    description:
      "অর্ডারটি ডেলিভারি হিসেবে চিহ্নিত হলে সেই প্রোডাক্টটি আপনার অ্যাকাউন্টে “রিভিউ দেওয়ার অপেক্ষায়” তালিকায় যোগ হয়।",
  },
  {
    title: "রেটিং ও মতামত দিন",
    description: "১ থেকে ৫ স্টার রেটিং, চাইলে শিরোনাম ও বিস্তারিত অভিজ্ঞতা লিখে জমা দিন।",
  },
  {
    title: "প্রোডাক্ট পেজে প্রকাশ",
    description: "আপনার রিভিউ সংশ্লিষ্ট প্রোডাক্ট পেজে “ভেরিফায়েড ক্রয়” চিহ্নসহ দেখা যায়।",
  },
];

const RULES: ReadonlyArray<{ icon: typeof ShieldCheck; title: string; description: string }> = [
  {
    icon: PackageCheck,
    title: "ক্রয় ছাড়া রিভিউ নেই",
    description:
      "প্রতিটি রিভিউ একটি নির্দিষ্ট ডেলিভারি সম্পন্ন অর্ডারের সঙ্গে যুক্ত। কেনা ছাড়া রিভিউ দেওয়ার কোনো উপায় নেই — তাই প্রতিটি রিভিউই ভেরিফায়েড।",
  },
  {
    icon: Star,
    title: "প্রতি অর্ডার আইটেমে একটি রিভিউ",
    description:
      "একই অর্ডারের একটি প্রোডাক্টে একবারই রিভিউ দেওয়া যায়, যাতে রেটিংয়ের গড় কৃত্রিমভাবে বাড়ানো না যায়।",
  },
  {
    icon: PencilLine,
    title: "সম্পাদনার অধিকার আপনার",
    description:
      "মত বদলালে নিজের রিভিউ যেকোনো সময় সম্পাদনা করতে পারবেন — রেটিং, শিরোনাম ও বিস্তারিত সবই।",
  },
  {
    icon: Trash2,
    title: "মুছে ফেলার অধিকারও আপনার",
    description:
      "নিজের দেওয়া রিভিউ যেকোনো সময় মুছে ফেলতে পারবেন। মুছে ফেলা রিভিউ প্রোডাক্টের রেটিং থেকেও বাদ যায়।",
  },
];

export default function ReviewPolicyPage(): ReactElement {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-10 text-slate-900">
      <div className="mx-auto max-w-(--content-max) space-y-10 px-3 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            শুধু ভেরিফায়েড ক্রেতার রিভিউ
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">রিভিউ নীতিমালা</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
            DropshopNN-এ কোনো সাজানো বা কেনা রিভিউ নেই। রিভিউ দিতে পারেন কেবল সেই ক্রেতারা, যাঁদের
            অর্ডার সত্যিই ডেলিভারি হয়েছে। তাই প্রতিটি প্রোডাক্টের রেটিং যা দেখছেন, তা প্রকৃত
            ক্রেতার মতামত থেকেই তৈরি।
          </p>
        </header>

        <section aria-labelledby="how-heading" className="space-y-4">
          <h2 id="how-heading" className="text-lg font-black">
            রিভিউ কীভাবে কাজ করে
          </h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-800"
                >
                  {["১", "২", "৩", "৪"][index]}
                </span>
                <h3 className="mt-3 text-sm font-black">{step.title}</h3>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="rules-heading" className="space-y-4">
          <h2 id="rules-heading" className="text-lg font-black">
            যে নিয়মগুলো আমরা মেনে চলি
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {RULES.map((rule) => (
              <li
                key={rule.title}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <rule.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                <div>
                  <h3 className="text-sm font-black">{rule.title}</h3>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                    {rule.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="where-heading"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
        >
          <h2 id="where-heading" className="text-lg font-black">
            রিভিউ কোথায় দেখবেন
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            রিভিউ ও রেটিং প্রতিটি প্রোডাক্টের নিজস্ব পেজে দেখানো হয় — সেখানে গড় রেটিং, স্টার
            বিভাজন এবং ক্রেতাদের লেখা মতামত একসঙ্গে পাবেন। এখানে সাইটজুড়ে কোনো সম্মিলিত স্কোর
            দেখানো হয় না, কারণ প্রতিটি প্রোডাক্টের অভিজ্ঞতা আলাদা।
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center rounded-xl bg-amber-500 px-5 text-xs font-black text-slate-950 shadow-xs transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              প্রোডাক্ট ব্রাউজ করুন
            </Link>
            <Link
              href="/account/reviews"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-black text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              আমার রিভিউ
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-black text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              আমার অর্ডার
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
