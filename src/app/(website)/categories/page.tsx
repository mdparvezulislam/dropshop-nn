import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FolderTree, Layers } from "lucide-react";
import { getPublicCategoriesAction } from "@/features/catalog/actions/public-actions";
import { SITE_NAME, SITE_URL } from "@/config/site";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `সকল ক্যাটাগরি - ${SITE_NAME}`,
  description: `${SITE_NAME} এর সকল প্রোডাক্ট ক্যাটাগরি এক জায়গায় ব্রাউজ করুন।`,
  alternates: { canonical: `${SITE_URL}/categories` },
};

interface CategoryGroup {
  parent: PublicCategoryInfo;
  children: PublicCategoryInfo[];
}

function groupCategories(categories: PublicCategoryInfo[]): CategoryGroup[] {
  const parents = categories.filter((category) => category.parentCategoryId === null);
  const parentIds = new Set(parents.map((parent) => parent.id));
  // A child whose parent isn't publicly listed still needs to be reachable,
  // so it surfaces as its own top-level card.
  const orphans = categories.filter(
    (category) => category.parentCategoryId !== null && !parentIds.has(category.parentCategoryId),
  );

  const childrenByParent = new Map<string, PublicCategoryInfo[]>();
  for (const category of categories) {
    if (category.parentCategoryId === null || !parentIds.has(category.parentCategoryId)) continue;
    const list = childrenByParent.get(category.parentCategoryId) ?? [];
    list.push(category);
    childrenByParent.set(category.parentCategoryId, list);
  }

  return [...parents, ...orphans].map((parent) => ({
    parent,
    children: childrenByParent.get(parent.id) ?? [],
  }));
}

export default async function CategoriesPage(): Promise<ReactElement> {
  const result = await getPublicCategoriesAction();

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

  const groups = groupCategories(result.data);

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
            <FolderTree className="h-3.5 w-3.5 text-amber-600" aria-hidden /> প্রোডাক্ট ডিরেক্টরি
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            সকল ক্যাটাগরি ব্রাউজ করুন
          </h1>
          <p className="text-xs font-bold text-slate-600 sm:text-sm">
            ক্যাটাগরি অনুযায়ী প্রোডাক্ট খুঁজে নিন।
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="mx-auto max-w-md space-y-3 py-16 text-center">
            <h2 className="text-lg font-black text-slate-900">কোনো ক্যাটাগরি পাওয়া যায়নি</h2>
            <p className="text-sm font-bold text-slate-600">
              এই মুহূর্তে কোনো ক্যাটাগরি প্রকাশিত নেই। কিছুক্ষণ পরে আবার দেখুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map(({ parent, children }) => (
              <section
                key={parent.id}
                aria-label={parent.name}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-300 bg-white p-6 transition-all duration-300 hover:border-amber-400 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
                      {parent.image ? (
                        <Image
                          src={parent.image}
                          alt={parent.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-amber-600">
                          <Layers className="h-6 w-6" aria-hidden />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-black text-slate-900 transition-colors group-hover:text-amber-600">
                        {parent.name}
                      </h2>
                      <p className="text-[11px] font-black text-slate-600 tabular-nums">
                        {parent.productCount} টি প্রোডাক্ট
                      </p>
                    </div>
                  </div>

                  {parent.description && (
                    <p className="line-clamp-2 text-xs font-bold leading-relaxed text-slate-600">
                      {parent.description}
                    </p>
                  )}

                  {children.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                        >
                          {child.name}
                          <span className="text-[10px] font-black text-amber-700 tabular-nums">
                            {child.productCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href={`/category/${parent.slug}`}
                  className="inline-flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                >
                  <span>প্রোডাক্ট দেখুন</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                </Link>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
