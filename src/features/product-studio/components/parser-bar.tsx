"use client";

import * as React from "react";
import { Sparkles, ChevronDown, ChevronUp, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface ParserBarProps {
  onParse: (text: string) => void;
  onClear?: () => void;
  isParsing?: boolean;
  summary?: string[];
  className?: string;
  /** Initial placeholder text */
  placeholder?: string;
  /** Collapsed by default on mobile */
  defaultCollapsed?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────────── */

export function ParserBar({
  onParse,
  onClear,
  isParsing = false,
  summary = [],
  className,
  placeholder = "Paste product URL, supplier text, HTML, marketing copy, or any product description here…",
  defaultCollapsed = false,
}: ParserBarProps): React.ReactElement {
  const [text, setText] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [hasParsed, setHasParsed] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleParse = () => {
    if (!text.trim() || isParsing) return;
    onParse(text);
    setHasParsed(true);
  };

  const handleClear = () => {
    setText("");
    setHasParsed(false);
    onClear?.();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+Enter or Ctrl+Enter to parse
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        hasParsed
          ? "border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10"
          : "border-border bg-card",
        collapsed ? "shadow-2xs" : "shadow-xs",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-extrabold text-foreground">Smart Product Parse</span>
            <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
              Paste any product text — fields auto-populate
            </span>
          </div>
          {isParsing && <Loader2 className="h-4 w-4 animate-spin text-amber-500 shrink-0" />}
        </div>

        <div className="flex items-center gap-1.5">
          {hasParsed && summary.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 inline mr-1" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={collapsed ? "Expand parser" : "Collapse parser"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (hasParsed) setHasParsed(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
            disabled={isParsing}
          />

          {/* Parse bar footer */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {/* Summary chips */}
              {hasParsed && summary.length > 0
                ? summary.slice(0, 5).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {item}
                    </span>
                  ))
                : hasParsed && (
                    <span className="text-xs text-muted-foreground italic">
                      No attributes could be extracted. Try pasting more detailed text.
                    </span>
                  )}
              {summary.length > 5 && (
                <span className="text-[11px] text-muted-foreground font-semibold">
                  +{summary.length - 5} more
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {text.length} chars
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-semibold h-8"
                onClick={() => {
                  setText(
`Prestige 3L Multifunctional Electric Cooker with Steamer
আপনি কি ব্যাচেলর লাইফ, অফিস কিংবা পরিবারের জন্য একটি অল-ইন-ওয়ান রান্নার সহায়ক খুঁজছেন? NN Enterprise নিয়ে এলো প্রিমিয়াম কোয়ালিটির Prestige 3L Multifunctional Electric Cooker with Steamer। এই একটি কুকার দিয়েই আপনি গ্যাস সিলিন্ডার বা চুলার ঝামেলা ছাড়াই ঝটপট ভাত, নুডলস, কারি রান্না করার পাশাপাশি স্টিম মোমো বা সবজি তৈরি করতে পারবেন অত্যন্ত সহজে!

🔥 কেন নেবেন এই প্রোডাক্টটি? (Why Buy This Product?)
3.0 Litre Capacity: ৩ লিটার বড় ক্যাপাসিটি যা ৪-৫ জনের পরিবারের রান্নার জন্য একদম নিখুঁত।

2-in-1 Cook & Steam: নিচে মেইন পটে রান্না হওয়ার সাথে সাথেই ওপরের স্টিমার ট্রেইতে ডিম, মোমো কিংবা সবজি স্টিম করে নিতে পারবেন।

Non-Stick Coated Inner Pot: প্রিমিয়াম নন-স্টিক কোটেট পটের কারণে খাবার পুড়ে বা নিচে লেগে যায় না, এবং সহজে পরিষ্কার করা যায়।

1500W Powerful Heating: দ্রুত তাপ উৎপন্ন করে সময় ও বিদ্যুৎ দুটিই সাশ্রয় করে।

Automatic Warmer Function: রান্না শেষ হওয়ার পর খাবার দীর্ঘক্ষণ গরম ও তাজা রাখে।

⚙️ বিশেষ বৈশিষ্ট্য ও স্পেসিফিকেশন (Key Features & Specifications)
Brand: Prestige

Model: Multifunctional Cooker with Steamer

Capacity: 3.0 Litre

Power Consumption: 1500 Watts

Inner Pot Material: High-Grade Non-Stick Coated Alloy

Control Switch: Easy Dual Power Level Control (Cook & Warm)

Lid Type: Heat-Resistant Tempered Glass Lid with Steam Vent

Safety Feature: Overheat & Dry-Burn Protection

📖 কীভাবে ব্যবহার করবেন (How to Use)
কর্ড সংযোগ করে পাওয়ার সকেটে দিন।

ইননার পটে চাল, পানি, নুডলস বা প্রয়োজনীয় উপাদান দিন।

স্টিম করতে চাইলে ওপরের স্টিমার বসিয়ে ঢাকনা আটকে সুইচ 'Cook' মোডে দিন।

রান্না শেষ হলে এটি অটোমেটিক 'Warm' মোডে চলে যাবে বা ম্যানুয়ালি সুইচ বন্ধ করে পরিবেশন করুন।

📦 প্যাকেজে যা যা থাকছে (Package Includes)
1 x Prestige 3.0L Multi-Cooker Body

1 x Upper Steamer Basket

1 x Tempered Glass Lid

1 x Rice Measuring Cup

1 x Non-Stick Friendly Serving Spatula

1 x Power Cable & Manual

✅ NN Enterprise Quality Assurance
NN Enterprise দিচ্ছে ১০০% অরিজিনাল প্রডাক্টের গ্যারান্টি, ক্যাশ অন ডেলিভারি সুবিধা এবং 7 Days Replacement Warranty। পণ্য হাতে পেয়ে চেক করে পেমেন্ট করার নিশ্চিন্ত সুবিধা উপভোগ করুন!`
                  );
                }}
              >
                📋 Load Sample Template
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5 font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 dark:text-amber-950 shadow-xs h-8"
                onClick={handleParse}
                disabled={isParsing || !text.trim()}
              >
                <Sparkles className="h-3.5 w-3.5 fill-amber-950 dark:fill-amber-950" />
                {isParsing ? "Parsing…" : "⚡ Magic Parse"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed state — compact summary bar */}
      {collapsed && hasParsed && summary.length > 0 && (
        <div className="px-4 pb-2.5 flex items-center gap-2 flex-wrap">
          {summary.slice(0, 3).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
            >
              <CheckCircle2 className="h-2.5 w-2.5" />
              {item}
            </span>
          ))}
          {summary.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-semibold">
              +{summary.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
