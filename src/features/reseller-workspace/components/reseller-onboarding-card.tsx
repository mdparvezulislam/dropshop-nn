"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Package,
  Settings,
  X,
  ArrowRight,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ResellerOnboardingCardProps {
  businessName?: string;
  isProfileComplete?: boolean;
  hasOrders?: boolean;
}

export function ResellerOnboardingCard({
  businessName = "My Shop",
  isProfileComplete = false,
  hasOrders = false,
}: ResellerOnboardingCardProps): React.ReactElement | null {
  const [dismissed, setDismissed] = React.useState(true);

  React.useEffect(() => {
    const isHidden = localStorage.getItem("reseller_onboarding_dismissed") === "true";
    setDismissed(isHidden);
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem("reseller_onboarding_dismissed", "true");
    setDismissed(true);
  };

  const steps = [
    {
      id: "profile",
      title: "Set up Shop Profile",
      description: "Upload shop logo, contact info, & bKash number",
      completed: isProfileComplete,
      href: "/reseller/settings",
      icon: Settings,
    },
    {
      id: "catalog",
      title: "Explore Reseller Catalog",
      description: "Browse products & set your custom selling prices",
      completed: true,
      href: "/reseller/products",
      icon: Package,
    },
    {
      id: "order",
      title: "Place Your First Order",
      description: "Create customer order and earn instant profit",
      completed: hasOrders,
      href: "/reseller/orders/create",
      icon: Plus,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-card shadow-md animate-fade-in">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 90% 10%, hsl(var(--primary) / 0.25), transparent 50%)",
        }}
      />
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Hide onboarding"
      >
        <X className="w-4 h-4" />
      </button>

      <CardContent className="p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-black uppercase tracking-wider border border-primary/25">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to Reseller OS
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Welcome, {businessName}! Let&apos;s launch your sales.
            </h2>
          </div>
          <div className="shrink-0 text-right sm:text-right">
            <p className="text-xs font-bold text-muted-foreground">Setup Progress</p>
            <p className="text-lg font-black text-primary tabular-nums">{progressPercent}% Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Getting Started Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className="group relative p-4 rounded-xl border border-border/80 bg-background/60 hover:bg-background hover:border-primary/40 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/60 shrink-0" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {step.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
