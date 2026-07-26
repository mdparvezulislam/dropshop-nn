"use client";

import * as React from "react";
import { Package, CheckCircle2, FileEdit, XCircle, AlertTriangle, Archive } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/workspace/stat-card";
import type { CatalogSummaryStats } from "../actions/product-catalog-actions";
import type { CatalogTabId } from "../hooks/use-catalog-workspace";

export interface CatalogSummaryCardsProps {
  stats: CatalogSummaryStats;
  loading: boolean;
  activeTab: CatalogTabId;
  onSelectTab: (tab: CatalogTabId) => void;
}

interface SummaryCard {
  tab: CatalogTabId;
  label: string;
  value: number;
  icon: LucideIcon;
  accent: React.ComponentProps<typeof StatCard>["accent"];
}

export function CatalogSummaryCards({
  stats,
  loading,
  activeTab,
  onSelectTab,
}: CatalogSummaryCardsProps): React.ReactElement {
  const cards: SummaryCard[] = [
    { tab: "all", label: "মোট পণ্য (Total)", value: stats.total, icon: Package, accent: "primary" },
    {
      tab: "active",
      label: "সক্রিয় (Active)",
      value: stats.active,
      icon: CheckCircle2,
      accent: "success",
    },
    {
      tab: "draft",
      label: "খসড়া (Draft)",
      value: stats.draft,
      icon: FileEdit,
      accent: "warning",
    },
    {
      tab: "out_of_stock",
      label: "স্টকে নেই (Out)",
      value: stats.outOfStock,
      icon: XCircle,
      accent: "danger",
    },
    {
      tab: "low_stock",
      label: "কম স্টক (Low)",
      value: stats.lowStock,
      icon: AlertTriangle,
      accent: "warning",
    },
    {
      tab: "archived",
      label: "আর্কাইভ (Archived)",
      value: stats.archived,
      icon: Archive,
      accent: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        // Real buttons rather than click-handled divs, so the KPI filters are
        // reachable by keyboard and announced with their pressed state.
        <button
          key={card.tab}
          type="button"
          onClick={() => onSelectTab(card.tab)}
          aria-pressed={activeTab === card.tab}
          className="text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <StatCard
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            loading={loading}
          />
        </button>
      ))}
    </div>
  );
}
