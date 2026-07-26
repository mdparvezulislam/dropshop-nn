import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award } from "lucide-react";
import { getPublicBrandsAction } from "@/features/catalog/actions/public-actions";
import { SITE_NAME, SITE_URL } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `সকল ব্র্যান্ড - ${SITE_NAME}`,
  description: `${SITE_NAME} এ উপলব্ধ সকল ব্র্যান্ডের প্রোডাক্ট ব্রাউজ করুন।`,
  alternates: { canonical: `${SITE_URL}/brands` },
};

export default async function BrandsPage(): Promise<ReactElement> {
  const result = await getPublicBrandsAction();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] py-16 text-slate-900">
        <div className="mx-auto max-w-xl space-y-4 px-4 text-center">
          <h1 className="text-2xl font-black">ডেটা লোড করা যায়নি</h1>
          <p className="text-sm font-bold text-slate-600">কিছুক্ষণ পরে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }

  const brands = result.data;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
            <Award className="h-3.5 w-3.5 text-amber-600" aria-hidden /> ব্র্যান্ড ডিরেক্টরি
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            সকল ব্র্যান্ড
          </h1>
          <p className="text-xs font-bold text-slate-600 sm:text-sm">
            ব্র্যান্ড অনুযায়ী প্রোডাক্ট খুঁজে নিন।
          </p>
        </div>

        {brands.length === 0 ? (
          <div className="mx-auto max-w-md space-y-3 py-16 text-center">
            <h2 className="text-lg font-black text-slate-900">কোনো ব্র্যান্ড পাওয়া যায়নি</h2>
            <p className="text-sm font-bold text-slate-600">
              এই মুহূর্তে কোনো ব্র্যান্ড প্রকাশিত নেই। কিছুক্ষণ পরে আবার দেখুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-300 bg-white p-6 transition-all duration-300 hover:border-amber-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                <div>
                  <div className="mb-4 flex h-16 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 transition-transform group-hover:scale-105">
                    {brand.logo ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} লোগো`}
                          fill
                          sizes="(max-width: 640px) 80vw, 240px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-lg font-black text-amber-600">{brand.name}</span>
                    )}
                  </div>
                  <h2 className="mb-1 text-lg font-black text-slate-900 transition-colors group-hover:text-amber-600">
                    {brand.name}
                  </h2>
                  {brand.description && (
                    <p className="mb-2 line-clamp-2 text-xs font-bold leading-relaxed text-slate-600">
                      {brand.description}
                    </p>
                  )}
                  <p className="mb-4 text-[11px] font-black text-slate-600 tabular-nums">
                    {brand.productCount} টি প্রোডাক্ট
                  </p>
                </div>

                <span className="inline-flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-extrabold text-amber-600">
                  <span>প্রোডাক্ট দেখুন</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
