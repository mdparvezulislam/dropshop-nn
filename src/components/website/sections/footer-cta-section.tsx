import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, MessageSquare, Mail, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function FooterCTASection(): React.ReactElement {
  return (
    <section
      className="w-full py-16 lg:py-24 bg-gradient-to-r from-accent via-white to-accent border-t border-border/50"
      aria-label="Support & Registration CTA"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>Dedicated Bangladeshi Business Support</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              Ready to Source & Scale Your <br />
              <span className="text-primary">Commerce Business in BD?</span>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
              Join 5,000+ active resellers, retail store owners, and suppliers already growing with
              DropshopNN enterprise automation across 64 districts.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/become-reseller">
                <Button
                  size="lg"
                  className="h-12 px-6 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Start as Reseller
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/become-wholesale-partner">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-sm font-bold border-primary/30 text-primary hover:bg-accent"
                >
                  Wholesale Account
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-foreground border-b border-border/60 pb-3">
              Direct Merchant Support Helpline
            </h3>

            <div className="space-y-3 text-xs">
              <a
                href="tel:+8801700000000"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-accent border border-border/60 transition-all group"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">+880 1700-000000</p>
                  <p className="text-muted-foreground">Phone Hotline (24/7 Available)</p>
                </div>
              </a>

              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all text-emerald-900 group"
              >
                <div className="p-2 rounded-lg bg-emerald-600 text-white group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold">WhatsApp Merchant Desk</p>
                  <p className="text-emerald-700">Instant Chat & Query Support</p>
                </div>
              </a>

              <a
                href="mailto:hello@dropshopnn.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-accent border border-border/60 transition-all group"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">hello@dropshopnn.com</p>
                  <p className="text-muted-foreground">Official Business & Partnership Email</p>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground font-semibold">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Office Hours: Saturday – Thursday (9:00 AM – 9:00 PM)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FooterCTASection;
