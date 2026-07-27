import { Building2, Users, Package, TrendingUp } from "lucide-react";

interface BusinessJourneyStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const steps: BusinessJourneyStep[] = [
  {
    icon: <Package className="h-8 w-8" />,
    title: "Supplier",
    description: "Upload your products and manage inventory",
    index: 1,
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "DropshopNN",
    description: "Our platform handles everything automatically",
    index: 2,
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Reseller",
    description: "Build your business with our tools",
    index: 3,
  },
  {
    icon: <Building2 className="h-8 w-8" />,
    title: "Customer",
    description: "Receive orders and grow revenue",
    index: 4,
  },
];

export function BusinessJourneySection(): React.ReactElement {
  return (
    <section className="w-full py-16 lg:py-24 bg-[hsl(0_0%_96%)]" aria-labelledby="journey-heading">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="journey-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
          >
            Simple Business Model
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Four simple steps to grow your business on DropshopNN
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4 shadow-md">
                  {step.index}
                </div>
                <div className="mb-3 text-primary">{step.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>

              {step.index < 4 && (
                <div className="hidden lg:block absolute top-8 -right-3 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>

        <div className="hidden md:flex justify-center gap-4 mt-12 text-sm text-muted-foreground">
          <span>Each role has its own workspace and dashboard</span>
          <span className="text-primary">→</span>
          <span>Full automation and growth tools included</span>
        </div>
      </div>
    </section>
  );
}

export default BusinessJourneySection;
