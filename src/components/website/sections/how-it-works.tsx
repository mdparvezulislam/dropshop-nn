import { ShoppingBag, Store, PackageOpen } from "lucide-react";

interface HowItWorksProps {
  title?: string;
  description?: string;
}

const roles = [
  {
    role: "Customer",
    icon: ShoppingBag,
    steps: [
      "Browse our catalog of premium products",
      "Add items to your cart and checkout securely",
      "Receive tracking and enjoy fast delivery",
    ],
    cta: { label: "Start Shopping", href: "/products" },
  },
  {
    role: "Reseller",
    icon: Store,
    steps: [
      "Register and get approved as a reseller",
      "Access exclusive reseller pricing on thousands of products",
      "Dropship directly to your customers with automated fulfillment",
    ],
    cta: { label: "Become a Reseller", href: "/reseller/register" },
  },
  {
    role: "Wholesale Buyer",
    icon: PackageOpen,
    steps: [
      "Get approved for wholesale purchasing",
      "Buy in bulk at discounted wholesale prices",
      "Scale your business with MOQ-based pricing tiers",
    ],
    cta: { label: "Wholesale Registration", href: "/wholesale/register" },
  },
];

export function HowItWorks({
  title = "How It Works",
  description = "Choose your path and start growing your business",
}: HowItWorksProps) {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-foreground/50">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.role}
              className="p-6 rounded-xl border border-border/60 bg-card relative"
            >
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                <role.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-4">{role.role}</h3>
              <ol className="space-y-3 mb-6">
                {role.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/60">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <a
                href={role.cta.href}
                className="inline-flex items-center justify-center w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {role.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
