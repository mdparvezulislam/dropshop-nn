import Link from "next/link";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Flash Sale", href: "/flash-sale" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Best Sellers", href: "/best-sellers" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Size Guide", href: "/size-guide" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Become a Reseller", href: "/reseller/register" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                D
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Dropshop<span className="text-primary">NN</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/50 leading-relaxed mb-4 max-w-xs">
              Enterprise-grade dropshipping platform serving Bangladesh with premium products, wholesale pricing, and reseller programs.
            </p>
            <div className="space-y-2">
              <a href="tel:+8801700000000" className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground/70 transition-colors">
                <Phone className="h-3.5 w-3.5" />
                +880 1700-000000
              </a>
              <a href="mailto:hello@dropshopnn.com" className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground/70 transition-colors">
                <Mail className="h-3.5 w-3.5" />
                hello@dropshopnn.com
              </a>
              <div className="flex items-start gap-2 text-sm text-foreground/50">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/40">
            &copy; {new Date().getFullYear()} DropshopNN. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: Globe, href: "#", label: "Facebook" },
              { icon: Globe, href: "#", label: "Instagram" },
              { icon: Globe, href: "#", label: "YouTube" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
