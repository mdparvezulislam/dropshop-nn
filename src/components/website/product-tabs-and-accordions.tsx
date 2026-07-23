"use client";

import * as React from "react";
import { ChevronDown, FileText, ListFilter, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ProductSpecification {
  key: string;
  value: string;
  group?: string;
}

interface ProductTabsAndAccordionsProps {
  description?: string;
  specifications?: ProductSpecification[];
  notice?: string;
  highlights?: string[];
}

export function ProductTabsAndAccordions({
  description,
  specifications = [],
  notice,
  highlights = [],
}: ProductTabsAndAccordionsProps) {
  const [activeTab, setActiveTab] = React.useState<"description" | "specs" | "notice">("description");
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({
    description: true,
    specs: true,
    notice: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs text-slate-900">
      {/* DESKTOP TABS LAYOUT (Hidden on Mobile) */}
      <div className="hidden md:block">
        <div className="flex border-b border-slate-200 space-x-6 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={cn(
              "text-sm font-extrabold pb-3 transition-colors border-b-2 flex items-center space-x-2 min-h-[44px]",
              activeTab === "description"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>বিবরণ (Product Details)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={cn(
              "text-sm font-extrabold pb-3 transition-colors border-b-2 flex items-center space-x-2 min-h-[44px]",
              activeTab === "specs"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            <ListFilter className="w-4 h-4" />
            <span>স্পেসিফিকেশন (Specifications)</span>
          </button>

          {notice && (
            <button
              type="button"
              onClick={() => setActiveTab("notice")}
              className={cn(
                "text-sm font-extrabold pb-3 transition-colors border-b-2 flex items-center space-x-2 min-h-[44px]",
                activeTab === "notice"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>নোটিশ ও শর্তাবলী (Notices)</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="pt-6">
          {activeTab === "description" && (
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              {description ? (
                <div
                  className="prose prose-slate max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <p className="text-slate-400 font-medium">পণ্যের বিবরণ পাওয়া যায়নি।</p>
              )}

              {highlights.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Key Highlights:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 font-medium">
                    {highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div>
              {specifications.length > 0 ? (
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-200">
                      {specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                          <td className="py-3 px-4 font-bold text-slate-500 w-1/3 border-r border-slate-200">
                            {spec.key}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium py-4">কোন স্পেসিফিকেশন তথ্য যোগ করা হয়নি।</p>
              )}
            </div>
          )}

          {activeTab === "notice" && notice && (
            <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-2xl text-xs font-semibold space-y-2">
              <div className="flex items-center space-x-2 text-red-600 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>গুরুত্বপূর্ণ নোটিশ</span>
              </div>
              <p className="leading-relaxed">{notice}</p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE ACCORDIONS LAYOUT (Visible on Mobile Only) */}
      <div className="block md:hidden space-y-3">
        {/* Accordion 1: Description */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion("description")}
            className="w-full px-4 py-3 bg-slate-50 text-slate-900 font-extrabold text-xs flex items-center justify-between min-h-[44px]"
          >
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>বিবরণ (Product Details)</span>
            </span>
            <ChevronDown
              className={cn("w-4 h-4 transition-transform", openAccordions.description && "rotate-180")}
            />
          </button>
          {openAccordions.description && (
            <div className="p-4 text-xs text-slate-700 leading-relaxed border-t border-slate-200">
              {description ? (
                <div
                  className="prose prose-slate max-w-none text-slate-700 text-xs"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <p className="text-slate-400">পণ্যের বিবরণ পাওয়া যায়নি।</p>
              )}
            </div>
          )}
        </div>

        {/* Accordion 2: Specifications */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion("specs")}
            className="w-full px-4 py-3 bg-slate-50 text-slate-900 font-extrabold text-xs flex items-center justify-between min-h-[44px]"
          >
            <span className="flex items-center space-x-2">
              <ListFilter className="w-4 h-4 text-red-600" />
              <span>স্পেসিফিকেশন ({specifications.length})</span>
            </span>
            <ChevronDown
              className={cn("w-4 h-4 transition-transform", openAccordions.specs && "rotate-180")}
            />
          </button>
          {openAccordions.specs && (
            <div className="p-2 border-t border-slate-200">
              {specifications.length > 0 ? (
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-200">
                      {specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                          <td className="py-2.5 px-3 font-bold text-slate-500 w-1/3 border-r border-slate-200 text-[11px]">
                            {spec.key}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900 text-[11px]">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 p-2">কোন স্পেসিফিকেশন তথ্য নেই।</p>
              )}
            </div>
          )}
        </div>

        {/* Accordion 3: Notice */}
        {notice && (
          <div className="border border-red-200 bg-red-50/50 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("notice")}
              className="w-full px-4 py-3 text-red-900 font-extrabold text-xs flex items-center justify-between min-h-[44px]"
            >
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>গুরুত্বপূর্ণ নোটিশ</span>
              </span>
              <ChevronDown
                className={cn("w-4 h-4 transition-transform", openAccordions.notice && "rotate-180")}
              />
            </button>
            {openAccordions.notice && (
              <div className="p-4 text-xs text-red-800 leading-relaxed border-t border-red-200 font-medium">
                {notice}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
