"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  User,
  Store,
  PackageOpen,
  TrendingUp,
  BarChart3,
  Percent,
  Gift,
  Truck,
  ArrowRight,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

function GuestHighlights() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { icon: Gift, title: "Exclusive Discounts", desc: "Get member-only prices on thousands of products" },
        { icon: Truck, title: "Free Shipping", desc: "On orders over ৳2,000 — no minimums for members" },
        { icon: TrendingUp, title: "Track Orders", desc: "Real-time tracking for all your purchases" },
        { icon: Percent, title: "Flash Sale Alerts", desc: "Be the first to know about limited-time deals" },
      ].map((item) => (
        <div key={item.title} className="p-5 rounded-xl border border-border/60 bg-card hover:border-primary/20 transition-all">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-3">
            <item.icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
          <p className="text-xs text-foreground/50">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

function CustomerHighlights() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Orders", value: "3", icon: Truck },
          { label: "Wishlist", value: "12 items", icon: Gift },
          { label: "Saved", value: "৳1,250", icon: Percent },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-border/60 bg-card text-center">
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mx-auto mb-2">
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-foreground/50">{stat.label}</p>
          </div>
        ))}
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-6 hover:bg-primary/90 transition-colors"
      >
        Go to Dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ResellerHighlights() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Profit Margin", value: "Up to 25%", icon: Percent },
          { label: "Products", value: "5,000+", icon: PackageOpen },
          { label: "Marketing Kit", value: "Ready to use", icon: BarChart3 },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-border/60 bg-card text-center">
            <div className="p-2 rounded-lg text-primary w-fit mx-auto mb-2">
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-foreground/50">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/reseller"
          className="inline-flex items-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-6 hover:bg-primary/90 transition-colors"
        >
          Reseller Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/reseller/marketing"
          className="inline-flex items-center gap-2 h-10 rounded-lg border border-border/60 text-foreground/70 text-sm font-semibold px-6 hover:bg-muted/60 transition-colors"
        >
          Marketing Kit
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function WholesaleHighlights() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "MOQ Deals", value: "Low MOQ", icon: PackageOpen },
          { label: "Wholesale Pricing", value: "Up to 40% off", icon: Percent },
          { label: "Bulk Shipping", value: "Discounted rates", icon: Truck },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-border/60 bg-card text-center">
            <div className="p-2 rounded-lg text-primary w-fit mx-auto mb-2">
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-foreground/50">{stat.label}</p>
          </div>
        ))}
      </div>
      <Link
        href="/wholesale"
        className="inline-flex items-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-6 hover:bg-primary/90 transition-colors"
      >
        Wholesale Dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function RoleHighlights() {
  const { userRole } = usePermissions();

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {!userRole
                ? "Join Our Community"
                : userRole === "reseller"
                  ? "Your Reseller Toolkit"
                  : userRole === "wholesaler"
                    ? "Wholesale Benefits"
                    : "Your Account Overview"}
            </h2>
            <p className="mt-2 text-foreground/50">
              {!userRole
                ? "Create an account and unlock exclusive benefits"
                : "Everything you need to manage your business"}
            </p>
          </div>

          {!userRole && <GuestHighlights />}
          {(userRole === "admin" || userRole === "user") && <CustomerHighlights />}
          {userRole === "reseller" && <ResellerHighlights />}
          {userRole === "wholesaler" && <WholesaleHighlights />}
        </motion.div>
      </div>
    </section>
  );
}
