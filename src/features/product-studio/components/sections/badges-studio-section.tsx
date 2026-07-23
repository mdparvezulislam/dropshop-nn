"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BadgesStudioSectionProps {
  badges?: string[];
  onChange: (badges: string[]) => void;
}

const AVAILABLE_BADGES = [
  { id: "featured", label: "Featured (ফিচার্ড)", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "trending", label: "Trending (ট্রেন্ডিং)", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { id: "flash_sale", label: "Flash Sale (ফ্ল্যাশ সেল)", color: "bg-red-500/20 text-red-300 border-red-500/40" },
  { id: "new_arrival", label: "New Arrival (নতুন আগমন)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { id: "best_seller", label: "Best Seller (সেরা বিক্রি)", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { id: "limited_edition", label: "Limited Edition (সীমিত স্টক)", color: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  { id: "hot_deal", label: "Hot Deal (হট ডিল)", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  { id: "verified_choice", label: "Verified Choice (যাচাইকৃত)", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
];

export function BadgesStudioSection({
  badges = [],
  onChange,
}: BadgesStudioSectionProps): React.ReactElement {
  const [customBadge, setCustomBadge] = React.useState("");

  const toggleBadge = (badgeId: string) => {
    if (badges.includes(badgeId)) {
      onChange(badges.filter((b) => b !== badgeId));
    } else {
      onChange([...badges, badgeId]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customBadge.trim().toLowerCase().replace(/\s+/g, "_");
    if (!trimmed || badges.includes(trimmed)) return;
    onChange([...badges, trimmed]);
    setCustomBadge("");
  };

  return (
    <StudioCollapsibleSection
      id="badges"
      title="Product Badges & Highlights"
      description="Multi-select product highlight badges replacing legacy boolean toggles"
      defaultExpanded={true}
      badge={
        badges.length > 0 ? (
          <Badge variant="default" size="xs">
            {badges.length} Badges
          </Badge>
        ) : null
      }
    >
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
          Select Active Badges:
        </label>

        {/* Badges Matrix Chips */}
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_BADGES.map((b) => {
            const active = badges.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBadge(b.id)}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all",
                  active
                    ? `${b.color} shadow-xs`
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                )}
              >
                {active ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Badge Add */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={customBadge}
              onChange={(e) => setCustomBadge(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
              placeholder="Add custom badge tag (e.g. clearance, organic)"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
          >
            Add
          </button>
        </div>
      </div>
    </StudioCollapsibleSection>
  );
}
