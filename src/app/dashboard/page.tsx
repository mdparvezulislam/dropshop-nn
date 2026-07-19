"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Building2,
  Store,
  Warehouse,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  FileEdit,
  Truck,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { StatusChip } from "@/shared/components/workspace/status-chip";
import { cn } from "@/shared/utils/cn";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  { label: "New product", href: "/dashboard/products/new", icon: Package },
  { label: "Onboard supplier", href: "/dashboard/suppliers/new", icon: Building2 },
  { label: "Onboard reseller", href: "/dashboard/resellers/new", icon: Store },
  { label: "Adjust stock", href: "/dashboard/inventory/adjust", icon: Warehouse },
  { label: "Update pricing", href: "/dashboard/pricing/bulk", icon: DollarSign },
];

const NEED_ATTENTION = [
  {
    title: "7 products low on stock",
    detail: "Below reorder threshold",
    href: "/dashboard/inventory/low-stock",
    tone: "warning" as const,
    icon: AlertTriangle,
  },
  {
    title: "3 suppliers pending review",
    detail: "Awaiting verification",
    href: "/dashboard/suppliers",
    tone: "info" as const,
    icon: Building2,
  },
  {
    title: "12 draft products",
    detail: "Ready to publish",
    href: "/dashboard/products",
    tone: "neutral" as const,
    icon: FileEdit,
  },
  {
    title: "2 price overrides pending",
    detail: "Reseller custom pricing",
    href: "/dashboard/pricing",
    tone: "primary" as const,
    icon: DollarSign,
  },
];

const ACTIVITY = [
  { text: "iPhone 16 Pro Max pricing updated", time: "12m ago", icon: DollarSign },
  { text: "Vertex Logistics stock adjusted +40", time: "1h ago", icon: Warehouse },
  { text: "Nova Retail Hub activated", time: "3h ago", icon: Store },
  { text: "Galaxy S24 Ultra saved as draft", time: "5h ago", icon: Package },
  { text: "Supplier Amana Distributors onboarded", time: "Yesterday", icon: Building2 },
];

const DRAFTS = [
  { name: "MacBook Pro 14 M3", sku: "APL-MBP14M3", status: "draft" },
  { name: "AirPods Pro 2 Bundle", sku: "APL-APP2-BND", status: "draft" },
  { name: "Galaxy Buds 3 Pro", sku: "SAM-GB3P", status: "pending_review" },
];

export default function WorkspaceHomePage(): React.ReactElement {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 animate-[fade-in_0.25s_ease-out]">
      {/* Greeting */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, hsl(var(--primary) / 0.18), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {dateLabel}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {greeting()}, Admin
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              Your commerce workspace — catalog, partners, inventory, and pricing in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" />4 alerts
            </Button>
            <Link href="/dashboard/products/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                New product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <section>
        <SectionHeader title="Quick actions" description="Jump into common workflows" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href + action.label}
                href={action.href}
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs",
                  "hover:border-primary/30 hover:shadow-md transition-all duration-150",
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Need attention */}
        <section className="lg:col-span-3 space-y-3">
          <SectionHeader title="Need attention" description="Items that need your decision" />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {NEED_ATTENTION.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}>
                  <Card className="h-full hover:border-primary/25 transition-colors">
                    <CardContent className="p-4 flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {item.title}
                          </p>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                        <div className="mt-2">
                          <StatusChip label="Action needed" tone={item.tone} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Draft products */}
          <Card className="mt-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm">Draft products</CardTitle>
              <Link href="/dashboard/products" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              {DRAFTS.map((d) => (
                <div
                  key={d.sku}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{d.sku}</p>
                  </div>
                  <StatusChip label={d.status} tone="warning" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Activity + alerts */}
        <section className="lg:col-span-2 space-y-5">
          <div>
            <SectionHeader title="Recent activity" />
            <Card>
              <CardContent className="p-2">
                <ul className="divide-y divide-border">
                  {ACTIVITY.map((a) => {
                    const Icon = a.icon;
                    return (
                      <li key={a.text} className="flex gap-3 px-3 py-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground leading-snug">{a.text}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {a.time}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <SectionHeader title="Supplier alerts" />
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Vertex Logistics online</p>
                    <p className="text-xs text-muted-foreground">Last sync 4 min ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Truck className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Amana lead time increased</p>
                    <p className="text-xs text-muted-foreground">Now 5 days · was 3</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Standard Trading suspended</p>
                    <p className="text-xs text-muted-foreground">Review compliance docs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
