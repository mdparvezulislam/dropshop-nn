"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  PackageCheck,
  Zap,
  Smartphone,
  Headphones,
  Wifi,
  Home,
  ArrowRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  badge: string;
  badgeColor: string;
  icon: typeof Sparkles;
  gradient: string;
  itemCount: string;
}

const FEATURED_COLLECTIONS: CollectionItem[] = [
  {
    id: "new-arrivals",
    title: "New Arrivals",
    subtitle: "Fresh batch products added this week",
    slug: "new-arrivals",
    badge: "Just Added",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: Sparkles,
    gradient: "from-blue-500/10 via-sky-500/5 to-transparent",
    itemCount: "120+ Products",
  },
  {
    id: "trending-now",
    title: "Trending in BD",
    subtitle: "Top-selling gadgets across social commerce",
    slug: "trending",
    badge: "Hot Demand",
    badgeColor: "bg-red-500/10 text-red-600 border-red-200",
    icon: TrendingUp,
    gradient: "from-red-500/10 via-orange-500/5 to-transparent",
    itemCount: "85+ Products",
  },
  {
    id: "business-starter",
    title: "Business Starter",
    subtitle: "High margin items for reseller store launch",
    slug: "business-starter",
    badge: "Reseller Pick",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    icon: PackageCheck,
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    itemCount: "200+ Products",
  },
  {
    id: "wholesale-picks",
    title: "Wholesale Picks",
    subtitle: "Bulk quantity discounts with low MOQ",
    slug: "wholesale-picks",
    badge: "Bulk Sourcing",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: Zap,
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    itemCount: "150+ Products",
  },
  {
    id: "mobile-accessories",
    title: "Mobile Accessories",
    subtitle: "Chargers, cases, cables, power banks & audio",
    slug: "mobile-accessories",
    badge: "Best Seller",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    icon: Smartphone,
    gradient: "from-purple-500/10 via-indigo-500/5 to-transparent",
    itemCount: "350+ Products",
  },
  {
    id: "smart-gadgets",
    title: "Smart Gadgets",
    subtitle: "Smartwatches, TWS earbuds & Bluetooth speakers",
    slug: "smart-gadgets",
    badge: "High Margin",
    badgeColor: "bg-pink-500/10 text-pink-600 border-pink-200",
    icon: Headphones,
    gradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    itemCount: "240+ Products",
  },
  {
    id: "networking-devices",
    title: "Networking Devices",
    subtitle: "WiFi 6 routers, extenders & smart switches",
    slug: "networking",
    badge: "Tech Essential",
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
    icon: Wifi,
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    itemCount: "90+ Products",
  },
  {
    id: "home-utility",
    title: "Home Utility",
    subtitle: "Innovative household tools & rechargeable gear",
    slug: "home-utility",
    badge: "Everyday Need",
    badgeColor: "bg-teal-500/10 text-teal-600 border-teal-200",
    icon: Home,
    gradient: "from-teal-500/10 via-emerald-500/5 to-transparent",
    itemCount: "180+ Products",
  },
];

export function CollectionsSection(): React.ReactElement {
  return (
    <section
      className="py-14 lg:py-20 bg-muted/30 border-y border-border/40"
      aria-label="Featured Collections"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Curated Collections
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Handpicked Sourcing Collections
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Explore specialized product collections tailored for social commerce resellers, retail
              store owners, and bulk wholesale buyers.
            </p>
          </div>

          <Link
            href="/collections"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            View All Collections
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {FEATURED_COLLECTIONS.map((col) => {
            const Icon = col.icon;
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  href={`/collections/${col.slug}`}
                  className="group flex flex-col justify-between h-full p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${col.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-white border border-border/60 shadow-xs flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border",
                          col.badgeColor,
                        )}
                      >
                        {col.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {col.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {col.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 mt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    <span>{col.itemCount}</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CollectionsSection;
