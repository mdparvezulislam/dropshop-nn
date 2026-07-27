"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroBanner {
  id: number;
  title: string;
  subtitle: string;
  cta?: { text: string; href: string };
}

const banners: HeroBanner[] = [
  {
    id: 1,
    title: "Premium Products Across Bangladesh",
    subtitle: "Direct from verified suppliers to your door",
    cta: { text: "Browse Now", href: "/products" },
  },
  {
    id: 2,
    title: "Grow Your Business",
    subtitle: "Join 2,000+ successful resellers",
    cta: { text: "Start Selling", href: "/become-reseller" },
  },
  {
    id: 3,
    title: "Wholesale Solutions",
    subtitle: "Bulk pricing for business buyers",
    cta: { text: "Learn More", href: "/become-wholesale-partner" },
  },
];

const stats = [
  { label: "Active Sellers", value: "2,000+" },
  { label: "Products", value: "50,000+" },
  { label: "Daily Orders", value: "10,000+" },
  { label: "Support Hours", value: "24/7" },
];

export function HeroSectionPremium(): React.ReactElement {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const banner = banners[current];

  return (
    <section className="w-full py-0 bg-white relative overflow-hidden" aria-label="Hero section">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          {/* Left Column - Content */}
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight"
              >
                Source, Sell
                <br />
                <span className="text-primary">&amp; Scale</span>
                <br />
                Across Bangladesh
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-[hsl(215_16%_47%)] leading-relaxed"
              >
                Enterprise commerce platform connecting suppliers, resellers, and customers.
                Automate, scale, and grow your business.
              </motion.p>
            </div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: "✓", label: "Original Products", desc: "100% verified" },
                { icon: "🚚", label: "Fast Delivery", desc: "24-48 hours" },
                { icon: "🔒", label: "Secure Checkout", desc: "Multiple methods" },
                { icon: "💰", label: "Best Prices", desc: "Direct from suppliers" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-[hsl(215_16%_47%)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button size="lg" className="text-base font-semibold h-12">
                Browse Products
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-base font-semibold h-12">
                Become a Reseller
              </Button>
            </motion.div>

            {/* Business Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-4 gap-4 pt-8 border-t border-[hsl(0_0%_91%)]"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-[hsl(215_16%_47%)] mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Banner Carousel */}
          <motion.div
            key={`banner-${current}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="relative h-96 lg:h-full min-h-[500px] rounded-2xl overflow-hidden border border-[hsl(0_0%_91%)] shadow-lg bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-6">
                {current === 0 && "🛍️"}
                {current === 1 && "📈"}
                {current === 2 && "📦"}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">{banner.subtitle}</h3>
              <p className="text-sm text-[hsl(215_16%_47%)] max-w-xs mb-6">{banner.title}</p>
              {banner.cta && (
                <Button size="sm" variant="outline">
                  {banner.cta.text}
                </Button>
              )}
            </div>

            {/* Carousel Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrent(i);
                    setAutoPlay(false);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === current ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60",
                  )}
                  aria-label={`Go to banner ${i + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-10">
              <button
                onClick={() => {
                  setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
                  setAutoPlay(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-sm"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setCurrent((prev) => (prev + 1) % banners.length);
                  setAutoPlay(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-sm"
                aria-label="Next banner"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
