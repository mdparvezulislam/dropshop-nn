"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, Package, Users } from "lucide-react";

const HERO_SLIDES = [
  {
    id: "1",
    title: "Premium Products at Factory Prices",
    subtitle: "Source thousands of quality products directly from verified suppliers across Bangladesh and beyond.",
    cta: "Browse Products",
    href: "/products",
    badge: "10,000+ Products",
    message: "✨ Verified Suppliers, Direct Pricing",
  },
  {
    id: "2",
    title: "Start Your Dropshipping Business Today",
    subtitle: "Zero inventory needed. List products, we handle storage, packing, and delivery across Bangladesh.",
    cta: "Become a Reseller",
    href: "/become-reseller",
    badge: "Zero Inventory Required",
    message: "💼 2,500+ Active Resellers",
  },
  {
    id: "3",
    title: "Wholesale Pricing for Bulk Buyers",
    subtitle: "Unlock tiered discounts, MOQ flexibility, and dedicated account management for wholesale partners.",
    cta: "Wholesale Program",
    href: "/become-wholesale-partner",
    badge: "Tiered Discounts",
    message: "📦 Flexible MOQ, Best Rates",
  },
];

const trustItems = [
  { icon: Truck, label: "Fast Delivery", sub: "2-5 days" },
  { icon: Shield, label: "Secure Payments", sub: "SSL protected" },
  { icon: RefreshCw, label: "Easy Returns", sub: "7-day guarantee" },
  { icon: CheckCircle2, label: "Verified Sellers", sub: "Quality assured" },
];

const businessStats = [
  { value: "10,000+", label: "Products", icon: Package },
  { value: "2,500+", label: "Resellers", icon: Users },
  { value: "100K+", label: "Orders/Month", icon: TrendingUp },
  { value: "24/7", label: "Support", icon: Shield },
];

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-[hsl(0_0%_96%)]">
      <div className="public-grid-bg absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[1000px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 pt-12 pb-16 lg:pt-20 lg:pb-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase w-fit mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    {HERO_SLIDES[current].badge}
                  </div>

                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-[hsl(222_47%_11%)]">
                    {HERO_SLIDES[current].title}
                  </h1>
                  
                  <p className="mt-6 text-lg sm:text-xl text-[hsl(215_16%_47%)] leading-relaxed max-w-xl">
                    {HERO_SLIDES[current].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-[hsl(0_0%_91%)]">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[hsl(222_47%_11%)]">{item.label}</p>
                    <p className="text-xs text-[hsl(215_16%_47%)]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {businessStats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white border border-[hsl(0_0%_91%)] p-4 text-center hover:border-primary/20 hover:shadow-md transition-all">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary mb-2 mx-auto">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-[hsl(222_47%_11%)]">{stat.value}</p>
                  <p className="text-xs text-[hsl(215_16%_47%)]">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={HERO_SLIDES[current].href}
                className="inline-flex items-center justify-center gap-2 h-14 rounded-xl bg-primary text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
              >
                {HERO_SLIDES[current].cta}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-[hsl(0_0%_91%)] text-[hsl(222_47%_11%)] font-bold px-8 hover:bg-[hsl(0_0%_96%)] hover:border-primary/30 transition-all"
              >
                Browse All Products
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-white to-primary/[0.03] border border-primary/10" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8"
                >
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {HERO_SLIDES[current].badge.charAt(0)}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-bold text-[hsl(222_47%_11%)]">
                        {HERO_SLIDES[current].message}
                      </p>
                      <p className="text-base text-[hsl(215_16%_47%)] max-w-xs mx-auto leading-relaxed">
                        {HERO_SLIDES[current].subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lg border border-[hsl(0_0%_91%)] flex items-center justify-center text-[hsl(215_16%_47%)] hover:text-primary hover:bg-primary/5 transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lg border border-[hsl(0_0%_91%)] flex items-center justify-center text-[hsl(215_16%_47%)] hover:text-primary hover:bg-primary/5 transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      i === current ? "h-2.5 w-8 bg-primary" : "h-2.5 w-2.5 bg-[hsl(0_0%_91%)] hover:bg-[hsl(215_16%_47%)]",
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
