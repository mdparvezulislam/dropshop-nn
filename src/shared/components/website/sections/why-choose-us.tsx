import { Shield, Zap, HeadphonesIcon, Package, BarChart3, Globe } from "lucide-react";

interface WhyChooseUsProps {
  title?: string;
  description?: string;
}

const features = [
  {
    icon: Package,
    title: "Premium Products",
    description: "Curated selection of high-quality products from verified suppliers across Bangladesh.",
  },
  {
    icon: Zap,
    title: "Automated Fulfillment",
    description: "End-to-end order automation from placement to delivery tracking.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security with SSL encryption and secure payment processing.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Comprehensive analytics dashboard with sales, inventory, and profit tracking.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Dedicated support team available around the clock for all your questions.",
  },
  {
    icon: Globe,
    title: "Pan-Bangladesh Coverage",
    description: "Nationwide shipping network with reliable delivery to all districts.",
  },
];

export function WhyChooseUs({
  title = "Why Choose DropshopNN",
  description = "The enterprise commerce platform built for Bangladesh",
}: WhyChooseUsProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-foreground/50">{description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-border/60 bg-card hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
