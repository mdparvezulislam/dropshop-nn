import Link from "next/link";
import { HelpCircle, ChevronDown, ShieldCheck, Truck, Percent, RefreshCw } from "lucide-react";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Frequently Asked Questions (FAQ) - ${BRAND.publicName}`,
  description:
    "Find answers to common questions about ordering, dropshipping, Pathao delivery, warranties, and wholesale MOQ.",
};

const FAQS = [
  {
    category: "Ordering & Delivery",
    questions: [
      {
        q: "How fast is delivery in Bangladesh?",
        a: "Orders in Dhaka Metro are delivered within 24 hours via Pathao Express. Nationwide delivery to other districts takes 48 to 72 hours via Steadfast Courier.",
      },
      {
        q: "Are all products original with warranty?",
        a: `Yes! 100% of products listed on ${BRAND.publicName} are sourced directly from authorized Bangladesh brand importers with 1 Year Official Replacement Warranty.`,
      },
    ],
  },
  {
    category: "Reseller & Wholesale",
    questions: [
      {
        q: `How does ${BRAND.publicName} reselling work?`,
        a: `Resellers can list our products on their own Facebook page or website at retail price. When an order comes in, place the order on ${BRAND.publicName} with your customer's shipping address. We fulfill and ship directly to your customer, and credit your profit margin to your wallet.`,
      },
      {
        q: "What is the Minimum Order Quantity (MOQ) for Wholesale Buyers?",
        a: "Wholesale tier accounts enjoy discounted bulk pricing with an MOQ starting at 5 to 10 units per SKU depending on the product line.",
      },
    ],
  },
  {
    category: "Returns & Warranty",
    questions: [
      {
        q: "What is the return & replacement policy?",
        a: "We offer a 7-day hassle-free replacement warranty for defective or damaged items. Simply submit a ticket with a video/photo proof through your account.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Help Center & Knowledgebase
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-slate-400">
            Everything you need to know about our commerce platform, courier shipping, and reseller
            program.
          </p>
        </div>

        <div className="space-y-8">
          {FAQS.map((group, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md"
            >
              <h2 className="text-lg font-bold text-amber-400 font-heading mb-4 border-b border-slate-800 pb-3">
                {group.category}
              </h2>
              <div className="space-y-4">
                {group.questions.map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4"
                  >
                    <h3 className="text-sm font-bold text-white mb-2">{item.q}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
