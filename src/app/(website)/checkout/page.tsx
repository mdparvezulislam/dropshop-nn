import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/website/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "চেকআউট",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-3 sm:py-10">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <CheckoutFlow />
      </div>
    </div>
  );
}
