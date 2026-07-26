"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Calculator,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const WHOLESALE_BENEFITS = [
  {
    icon: Calculator,
    title: "Tiered Volume Discounts",
    desc: "Unlock lower per-unit cost based on order quantity matrix.",
  },
  {
    icon: Shield,
    title: "Verified Importer Guarantee",
    desc: "Direct factory sourcing with authentic warranty certificates.",
  },
  {
    icon: FileText,
    title: "Tax & Vat Invoicing",
    desc: "Full legal B2B documentation, trade invoices & BIN compliance.",
  },
  {
    icon: Users,
    title: "Dedicated B2B Manager",
    desc: "Personal account manager for custom quotes & priority stock allocation.",
  },
];

export function WholesaleSection(): React.ReactElement {
  return (
    <section
      className="py-16 lg:py-24 bg-white border-b border-border/50"
      aria-label="Wholesale Solutions"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700">
              <Building2 className="h-3.5 w-3.5" />
              <span>Enterprise Wholesale Hub</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              Buy Bulk at Factory Prices for Your <br />
              <span className="text-primary">Retail & Wholesale Business</span>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              Designed specifically for Bangladeshi shop owners, electronics retailers, and regional
              distributors. Access wholesale tier pricing, flexible Minimum Order Quantities (MOQ),
              and nationwide delivery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {WHOLESALE_BENEFITS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1.5"
                  >
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/become-wholesale-partner">
                <Button
                  size="lg"
                  className="h-12 px-6 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  Apply as Wholesale Buyer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-sm font-bold border-amber-600/30 text-amber-700 hover:bg-amber-50"
                >
                  Request Custom Quote
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Visual Card Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6"
          >
            <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 border border-amber-500/20 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">
                    Live Wholesale Pricing Matrix
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sample tier discount table for verified buyers
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                  Active MOQ: 10 Pcs
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/60 font-semibold">
                  <span className="text-foreground">Retail Single Price (1 Pc)</span>
                  <span className="text-muted-foreground line-through">৳ 1,250</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-amber-500/40 font-bold text-amber-800">
                  <span>Tier 1 Wholesale (10 - 49 Pcs)</span>
                  <span>৳ 850 / pc (-32%)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-amber-600 text-white font-extrabold shadow-sm">
                  <span>Tier 2 Master Wholesale (50+ Pcs)</span>
                  <span>৳ 720 / pc (-42%)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Instant Credit Wallet & Cash on Delivery Available</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Wholesale accounts gain access to bulk checkout pipelines, automated PO
                  management, and fast courier dispatch across all 64 districts.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default WholesaleSection;
