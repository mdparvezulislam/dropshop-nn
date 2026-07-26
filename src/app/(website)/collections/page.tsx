import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPublicCollectionsAction } from "@/features/catalog/actions/public-actions";
import { SITE_NAME, SITE_URL } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `প্রোডাক্ট কালেকশন - ${SITE_NAME}`,
  description: `${SITE_NAME} এর সকল প্রোডাক্ট কালেকশন ব্রাউজ করুন।`,
  alternates: { canonical: `${SITE_URL}/collections` },
};

export default async function CollectionsPage(): Promise<ReactElement> {
  const result = await getPublicCollectionsAction();

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

  const collections = result.data;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden /> কালেকশন হাব
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            প্রোডাক্ট কালেকশন
          </h1>
          <p className="text-xs font-bold text-slate-600 sm:text-sm">
            বাছাই করা প্রোডাক্ট কালেকশন এক জায়গায় দেখুন।
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="mx-auto max-w-md space-y-3 py-16 text-center">
            <h2 className="text-lg font-black text-slate-900">কোনো কালেকশন পাওয়া যায়নি</h2>
            <p className="text-sm font-bold text-slate-600">
              এই মুহূর্তে কোনো কালেকশন প্রকাশিত নেই। কিছুক্ষণ পরে আবার দেখুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-300 bg-white transition-all duration-300 hover:border-amber-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                <div>
                  {collection.image && (
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="space-y-2 p-6">
                    <h2 className="text-xl font-black text-slate-900 transition-colors group-hover:text-amber-600">
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="line-clamp-2 text-xs font-bold leading-relaxed text-slate-600">
                        {collection.description}
                      </p>
                    )}
                    <p className="text-[11px] font-black text-slate-600 tabular-nums">
                      {collection.productCount} টি প্রোডাক্ট
                    </p>
                  </div>
                </div>

                <span className="mx-6 mb-5 inline-flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-extrabold text-amber-600">
                  <span>কালেকশন দেখুন</span>
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
