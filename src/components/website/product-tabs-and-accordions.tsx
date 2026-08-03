"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  FileText,
  ListFilter,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RichContentRenderer } from "@/components/editor/rich-content-renderer";

interface ProductSpecification {
  key: string;
  value: string;
  group?: string;
}

interface ProductTabsAndAccordionsProps {
  description?: string;
  specifications?: ProductSpecification[];
  /** Parser-generated feature bullets (content.features + highlights, merged upstream). */
  features?: string[];
  notice?: string;
  warranty?: string;
  returnPolicy?: string;
  tags?: string[];
}

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  tone?: "default" | "notice";
}

function SpecTable({ specifications }: { specifications: ProductSpecification[] }) {
  const groups = React.useMemo(() => {
    const map = new Map<string, ProductSpecification[]>();
    for (const spec of specifications) {
      const group = spec.group && spec.group !== "general" ? spec.group : "";
      const list = map.get(group) ?? [];
      list.push(spec);
      map.set(group, list);
    }
    return [...map.entries()];
  }, [specifications]);

  const showGroupHeaders = groups.length > 1;

  return (
    <div className="overflow-hidden border border-slate-200 rounded-2xl">
      <table className="w-full text-xs text-left">
        <tbody className="divide-y divide-slate-200">
          {groups.map(([group, specs]) => (
            <React.Fragment key={group || "general"}>
              {showGroupHeaders && (
                <tr className="bg-slate-100">
                  <th
                    colSpan={2}
                    scope="colgroup"
                    className="py-2 px-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-600"
                  >
                    {group || "সাধারণ"}
                  </th>
                </tr>
              )}
              {specs.map((spec, i) => (
                <tr
                  key={`${group}-${spec.key}-${i}`}
                  className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}
                >
                  <th
                    scope="row"
                    className="py-3 px-4 font-bold text-slate-500 w-1/3 border-r border-slate-200 text-left align-top"
                  >
                    {spec.key}
                  </th>
                  <td className="py-3 px-4 font-extrabold text-slate-900 break-words">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TruncatedDescription({ content }: { content: string }): React.ReactElement {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isLong = content.length > 400;

  return (
    <div className="space-y-2">
      <div className={cn("relative overflow-hidden transition-all duration-300", !isExpanded && isLong && "max-h-48")}>
        <RichContentRenderer content={content} />
        {!isExpanded && isLong && (
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs font-black text-amber-700 dark:text-amber-400 hover:underline pt-1 focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <span>{isExpanded ? "সংক্ষেপ করুন" : "আরও পড়ুন"}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isExpanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

/**
 * PDP content sections. One section model renders as ARIA tabs on desktop
 * and accordions on mobile. Sections only exist when their data exists.
 */
export function ProductTabsAndAccordions({
  description,
  specifications = [],
  features = [],
  notice,
  warranty,
  returnPolicy,
  tags = [],
}: ProductTabsAndAccordionsProps) {
  const sections = React.useMemo<Section[]>(() => {
    const list: Section[] = [];

    if (description || features.length > 0) {
      list.push({
        id: "description",
        label: "বিবরণ",
        icon: <FileText className="w-4 h-4" aria-hidden />,
        content: (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {description && <TruncatedDescription content={description} />}
            {features.length > 0 && (
              <div className={cn("space-y-2", description && "pt-3 border-t border-slate-100 dark:border-slate-800")}>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  মূল ফিচারসমূহ
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
      });
    }

    if (specifications.length > 0) {
      list.push({
        id: "specs",
        label: `স্পেসিফিকেশন (${specifications.length})`,
        icon: <ListFilter className="w-4 h-4" aria-hidden />,
        content: <SpecTable specifications={specifications} />,
      });
    }

    list.push({
      id: "warranty",
      label: "ডেলিভারি ও রিটার্ন পলিসি",
      icon: <ShieldCheck className="w-4 h-4" aria-hidden />,
      content: (
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                📦 ডেলিভারি চার্জ ও সময়সূচী
              </h3>
              <ul className="space-y-1 font-medium">
                <li>• <strong>ঢাকার ভেতরে:</strong> ৳৮০ (১-২ কার্যদিবস)</li>
                <li>• <strong>ঢাকার বাইরে:</strong> ৳১৫০ (২-৪ কার্যদিবস)</li>
                <li>• <strong>ক্যাশ অন ডেলিভারি:</strong> সারাদেশে সার্ভিস এভেইলএবল।</li>
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                🔄 রিটার্ন ও ওয়ারেন্টি পলিসি
              </h3>
              <p className="font-medium">
                {returnPolicy || "প্রোডাক্টে কোনো ত্রুটি থাকলে ডেলিভারি ম্যানের সামনে চেক করে ৩ দিনের মধ্যে রিটার্ন করতে পারবেন।"}
              </p>
              {warranty && <p className="font-bold text-amber-700 dark:text-amber-400 pt-1">ওয়ারেন্টি: {warranty}</p>}
            </div>
          </div>
        </div>
      ),
    });

    if (notice) {
      list.push({
        id: "notice",
        label: "গুরুত্বপূর্ণ নোটিশ",
        icon: <Sparkles className="w-4 h-4" aria-hidden />,
        tone: "notice",
        content: (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-300 p-4 rounded-2xl text-xs font-semibold">
            <p className="leading-relaxed">{notice}</p>
          </div>
        ),
      });
    }

    return list;
  }, [description, specifications, features, notice, warranty, returnPolicy]);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({});
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight"
        ? (index + 1) % sections.length
        : (index - 1 + sections.length) % sections.length;
    const target = sections[next];
    setActiveId(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  if (sections.length === 0 && tags.length === 0) return null;

  return (
    <div className="mt-5 sm:mt-8 bg-white -mx-3 sm:mx-0 border-y sm:border border-slate-200 rounded-none sm:rounded-3xl px-4 py-5 sm:p-6 sm:shadow-xs text-slate-900">
      {sections.length > 0 && (
        <>
          {/* Desktop: ARIA tabs */}
          <div className="hidden md:block">
            <div
              role="tablist"
              aria-label="প্রোডাক্ট তথ্য"
              className="flex border-b border-slate-200 gap-6 pb-0 overflow-x-auto"
            >
              {sections.map((section, index) => {
                const selected = active?.id === section.id;
                return (
                  <button
                    key={section.id}
                    ref={(el) => {
                      if (el) tabRefs.current.set(section.id, el);
                    }}
                    type="button"
                    role="tab"
                    id={`pdp-tab-${section.id}`}
                    aria-selected={selected}
                    aria-controls={`pdp-panel-${section.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveId(section.id)}
                    onKeyDown={(e) => onTabKeyDown(e, index)}
                    className={cn(
                      "text-sm font-extrabold pb-3 pt-2 transition-colors border-b-2 flex items-center gap-2 min-h-11 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-500",
                      selected
                        ? section.tone === "notice"
                          ? "border-red-600 text-red-600"
                          : "border-amber-500 text-amber-700"
                        : "border-transparent text-slate-500 hover:text-slate-900",
                    )}
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
            {sections.map((section) => (
              <div
                key={section.id}
                role="tabpanel"
                id={`pdp-panel-${section.id}`}
                aria-labelledby={`pdp-tab-${section.id}`}
                hidden={active?.id !== section.id}
                className="pt-6"
              >
                {section.content}
              </div>
            ))}
          </div>

          {/* Mobile: accordions */}
          <div className="block md:hidden space-y-3">
            {sections.map((section, index) => {
              const open = openAccordions[section.id] ?? index === 0;
              return (
                <div
                  key={section.id}
                  className={cn(
                    "border rounded-2xl overflow-hidden",
                    section.tone === "notice" ? "border-red-200 bg-red-50/50" : "border-slate-200",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`pdp-acc-${section.id}`}
                    onClick={() => setOpenAccordions((prev) => ({ ...prev, [section.id]: !open }))}
                    className={cn(
                      "w-full px-4 py-3 font-extrabold text-xs flex items-center justify-between min-h-11 focus-visible:outline-2 focus-visible:outline-amber-500",
                      section.tone === "notice" ? "text-red-900" : "bg-slate-50 text-slate-900",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={section.tone === "notice" ? "text-red-600" : "text-amber-600"}
                      >
                        {section.icon}
                      </span>
                      <span>{section.label}</span>
                    </span>
                    <ChevronDown
                      className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={`pdp-acc-${section.id}`}
                    hidden={!open}
                    className={cn(
                      "p-4 border-t",
                      section.tone === "notice" ? "border-red-200" : "border-slate-200",
                    )}
                  >
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-slate-100">
          <Tag className="w-3.5 h-3.5 text-slate-400" aria-hidden />
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
