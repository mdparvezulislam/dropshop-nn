import Link from "next/link";
import { ArrowRight, Store, PackageCheck, Building2, CheckCircle2 } from "lucide-react";
import { BRAND } from "@/config/brand";

const roles = [
  {
    title: "Reseller & Dropshipper Track",
    subtitle: "Zero Inventory Risk",
    description:
      "Launch your Facebook, Instagram, or Website shop with 10,000+ ready-to-sell products. Set your own prices and keep 100% of your retail margin.",
    icon: Store,
    href: "/become-reseller",
    cta: "Start Dropshipping Now",
    badge: "Most Popular",
    benefits: [
      "Zero upfront inventory cost",
      "1-Click product sync & marketing kit",
      "Automated Pathao/Steadfast delivery",
      "Instant profit wallet withdrawal",
    ],
  },
  {
    title: "Wholesale & Bulk Buyer Track",
    subtitle: "Direct Factory Sourcing",
    description:
      "Bulk purchasing power with tiered discount matrices. Access factory-direct inventory, tax invoices, and dedicated account management.",
    icon: PackageCheck,
    href: "/become-wholesale-partner",
    cta: "Wholesale Partner Portal",
    badge: "Bulk Savings",
    benefits: [
      "Factory tier pricing (-35%)",
      "Flexible MOQ start from 10 pcs",
      "Dedicated BD account manager",
      "Custom packaging & branding",
    ],
  },
  {
    title: "Direct Supplier Track",
    subtitle: "Nationwide Distribution",
    description:
      "List your inventory on Bangladesh's premier commerce OS. Reach 5,000+ active resellers and wholesale buyers across 64 districts.",
    icon: Building2,
    href: "/become-supplier",
    cta: "Join as Verified Supplier",
    badge: "High Growth",
    benefits: [
      "Reach 5,000+ active sellers",
      "Automated stock & order sync",
      "Guaranteed weekly payouts",
      "Full inventory analytics hub",
    ],
  },
];

export function RoleHighlights() {
  return (
    <section className="py-16 lg:py-24 bg-card border-y border-border/60">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary px-3.5 py-1 rounded-full bg-accent border border-primary/20">
            Partner Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Who Is {BRAND.publicName} Built For?
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Select your commerce track to start sourcing, selling, or supplying products across
            Bangladesh with enterprise automation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role) => (
            <div
              key={role.title}
              className="rounded-3xl bg-white border border-border/80 p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-accent text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <role.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-accent px-2.5 py-1 rounded-md border border-primary/20">
                    {role.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs font-bold text-primary/80 mt-0.5">{role.subtitle}</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>

                <ul className="space-y-2.5 pt-2 border-t border-border/50">
                  {role.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-xs text-foreground/80 font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-border/50">
                <Link
                  href={role.href}
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98]"
                >
                  {role.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RoleHighlights;
