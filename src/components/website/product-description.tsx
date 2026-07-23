"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
}

interface ProductDescriptionProps {
  description?: string;
  highlights?: string[];
  features?: string[];
  includedItems?: string[];
}

export function ProductDescription({
  description,
  highlights,
  features,
  includedItems,
}: ProductDescriptionProps) {
  const tabs: Tab[] = [
    ...(description ? [{ id: "description", label: "Description" }] : []),
    ...(features && features.length > 0 ? [{ id: "features", label: "Features" }] : []),
    ...(includedItems && includedItems.length > 0 ? [{ id: "includes", label: "What's Included" }] : []),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "description");

  if (tabs.length === 0) return null;

  return (
    <section className="py-8">
      <div className="border-b border-border/40 mb-6">
        <div className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-foreground/40 hover:text-foreground/60",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[120px]">
        {activeTab === "description" && description && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="prose-sm max-w-none"
          >
            <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
              {description}
            </p>
            {highlights && highlights.length > 0 && (
              <ul className="mt-4 space-y-2">
                {highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/60">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {activeTab === "features" && features && features.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                {feature}
              </li>
            ))}
          </motion.ul>
        )}

        {activeTab === "includes" && includedItems && includedItems.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {includedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
