"use client";

import * as React from "react";
import { Package, CheckCircle2, FileEdit, XCircle, AlertTriangle, Flame } from "lucide-react";
import { StatCard } from "@/components/workspace/stat-card";
import type { CatalogSummaryStats } from "../actions/product-catalog-actions";

export interface CatalogSummaryCardsProps {
  stats: CatalogSummaryStats;
  loading: boolean;
  activeTab: string;
  onSelectTab: (tab: any) => void;
}

export function CatalogSummaryCards({
  stats,
  loading,
  activeTab,
  onSelectTab,
}: CatalogSummaryCardsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div onClick={() => onSelectTab("all")} className="cursor-pointer">
        <StatCard
          label="মোট পণ্য (Total)"
          value={stats.total}
          icon={Package}
          accent="primary"
          loading={loading}
        />
      </div>
      <div onClick={() => onSelectTab("active")} className="cursor-pointer">
        <StatCard
          label="সক্রিয় (Active)"
          value={stats.active}
          icon={CheckCircle2}
          accent="success"
          loading={loading}
        />
      </div>
      <div onClick={() => onSelectTab("draft")} className="cursor-pointer">
        <StatCard
          label="খসড়া (Draft)"
          value={stats.draft}
          icon={FileEdit}
          accent="warning"
          loading={loading}
        />
      </div>
      <div onClick={() => onSelectTab("out_of_stock")} className="cursor-pointer">
        <StatCard
          label="স্টকে নেই (Out)"
          value={stats.outOfStock}
          icon={XCircle}
          accent="danger"
          loading={loading}
        />
      </div>
      <div onClick={() => onSelectTab("low_stock")} className="cursor-pointer">
        <StatCard
          label="কম স্টক (Low)"
          value={stats.lowStock}
          icon={AlertTriangle}
          accent="warning"
          loading={loading}
        />
      </div>
      <div onClick={() => onSelectTab("campaign")} className="cursor-pointer">
        <StatCard
          label="ক্যাম্পেইন (Campaign)"
          value={stats.campaign}
          icon={Flame}
          accent="primary"
          loading={loading}
        />
      </div>
    </div>
  );
}
