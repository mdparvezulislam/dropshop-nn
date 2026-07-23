import { Store, ShoppingCart, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Store,
    title: "Browse & Select",
    description: "Explore thousands of products from verified suppliers. Add items to your store with one click.",
  },
  {
    icon: ShoppingCart,
    title: "Customer Orders",
    description: "When a customer places an order, we automatically fulfill it from our supplier network.",
  },
  {
    icon: TrendingUp,
    title: "Earn Profits",
    description: "We handle inventory, packaging, and shipping. You keep the profit margin.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(222_47%_11%)]">
            How It Works
          </h2>
          <p className="mt-3 text-lg text-[hsl(215_16%_47%)] max-w-2xl mx-auto">
            Start your dropshipping journey in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-[hsl(0_0%_91%)] border-t-2 border-dashed border-[hsl(0_0%_91%)] pointer-events-none" style={{ borderTopStyle: "dashed" }} />
              )}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative z-10 border-2 border-primary/20">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm z-20">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-lg font-bold text-[hsl(222_47%_11%)] mb-2">{step.title}</h3>
              <p className="text-sm text-[hsl(215_16%_47%)] leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
