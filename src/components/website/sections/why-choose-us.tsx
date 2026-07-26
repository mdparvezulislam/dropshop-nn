import { Shield, Zap, Users, BarChart3, Globe, Timer } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Verified Suppliers",
    description:
      "All suppliers are verified for authenticity and quality. Your trust is our priority.",
  },
  {
    icon: Zap,
    title: "Automated Fulfillment",
    description: "Orders are processed and dispatched automatically. No manual handling needed.",
  },
  {
    icon: Users,
    title: "190+ Countries",
    description: "Sell to customers worldwide. We handle the logistics cross-border.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track sales, profits, and performance with enterprise-grade dashboards.",
  },
  {
    icon: Globe,
    title: "Bilingual Support",
    description: "Full Bangla and English support for all platform features and communications.",
  },
  {
    icon: Timer,
    title: "2-5 Day Delivery",
    description: "Fast and reliable delivery across Bangladesh. Real-time tracking included.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 lg:py-24 bg-[hsl(0_0%_96%)]">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(222_47%_11%)]">
            Why Choose DropshopNN
          </h2>
          <p className="mt-3 text-lg text-[hsl(215_16%_47%)] max-w-2xl mx-auto">
            We provide everything you need to start and grow your dropshipping business
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl bg-white border border-[hsl(0_0%_91%)] p-6 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(222_47%_11%)] mb-2">{benefit.title}</h3>
              <p className="text-sm text-[hsl(215_16%_47%)] leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
