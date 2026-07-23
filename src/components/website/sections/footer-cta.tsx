import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FooterCtaProps {
  title?: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function FooterCta({
  title = "Ready to Transform Your Business?",
  description = "Join thousands of businesses across Bangladesh already growing with DropshopNN",
  primaryCta = { label: "Get Started Free", href: "/products" },
  secondaryCta = { label: "Talk to Sales", href: "/contact" },
}: FooterCtaProps) {
  return (
    <section className="py-16 lg:py-24 border-t border-border/40">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-8 sm:p-12 lg:p-16 text-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
              {title}
            </h2>
            <p className="text-primary-foreground/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={primaryCta.href}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-primary font-semibold px-8 shadow-lg hover:bg-white/90 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-xl border border-white/30 text-white font-semibold px-8 hover:bg-white/10 transition-all"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
