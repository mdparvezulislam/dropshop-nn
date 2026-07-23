"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { ProductGrid } from "../product-grid";
import type { ProductCardData } from "../product-card";

interface FlashDealsSectionProps {
  products: ProductCardData[];
  title?: string;
  description?: string;
  endTime?: Date;
}

function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number }>({
    h: 0, m: 0, s: 0,
  });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endTime.getTime() - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      <Clock className="h-5 w-5 text-destructive" />
      <div className="flex items-center gap-1.5 text-lg font-mono font-bold tabular-nums">
        <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-md">{pad(timeLeft.h)}</span>
        <span className="text-destructive/60">:</span>
        <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-md">{pad(timeLeft.m)}</span>
        <span className="text-destructive/60">:</span>
        <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-md">{pad(timeLeft.s)}</span>
      </div>
    </div>
  );
}

export function FlashDealsSection({
  products,
  title = "Flash Deals",
  description = "Limited-time offers at unbeatable prices",
  endTime,
}: FlashDealsSectionProps) {
  if (products.length === 0) return null;

  const defaultEnd = new Date(Date.now() + 86400000 * 2);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-destructive" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            </div>
            <p className="text-foreground/50">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CountdownTimer endTime={endTime ?? defaultEnd} />
            </motion.div>
            <Link
              href="/flash-sale"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <ProductGrid products={products} columns={3} />

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/flash-sale"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
          >
            View All Flash Deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
