"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BadgesStudioSectionProps {
  badges?: string[];
  onChange: (badges: string[]) => void;
}

const AVAILABLE_BADGES = [
  {
    id: "featured",
    label: "Featured (ফিচার্ড)",
    color:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
  },
  {
    id: "trending",
    label: "Trending (ট্রেন্ডিং)",
    color:
      "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
  },
  {
    id: "flash_sale",
    label: "Flash Sale (ফ্ল্যাশ সেল)",
    color:
      "bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40",
  },
  {
    id: "new_arrival",
    label: "New Arrival",
    color:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
  },
  {
    id: "best_seller",
    label: "Best Seller (সেরা বিক্রি)",
    color:
      "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
  },
  {
    id: "limited_edition",
    label: "Limited Edition (সীমিত স্টক)",
    color:
      "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/40",
  },
  {
    id: "hot_deal",
    label: "Hot Deal (হট ডিল)",
    color:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40",
  },
  {
    id: "verified_choice",
    label: "Verified Choice (যাচাইকৃত)",
    color:
      "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40",
  },
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
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
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
                    : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground",
                )}
              >
                {active ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Badge Add */}
        <div className="flex items-center space-x-2 pt-2 border-t border-border">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={customBadge}
              onChange={(e) => setCustomBadge(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
              placeholder="Add custom badge tag (e.g. clearance, organic)"
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-xl text-foreground font-medium text-xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-3.5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-bold text-xs rounded-xl transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </StudioCollapsibleSection>
  );
}
