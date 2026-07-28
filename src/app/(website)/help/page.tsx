import Link from "next/link";
import { HelpCircle, Search, FileText, PhoneCall, MessageSquare, ArrowRight } from "lucide-react";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Help Center - ${BRAND.publicName}`,
  description: `Find guides, FAQs, and support channels for ${BRAND.publicName} e-commerce platform.`,
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> {BRAND.publicName} Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-2">
            How Can We Help You?
          </h1>
          <p className="text-xs text-slate-400">
            Browse our support topics or contact our 24/7 customer service desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/faq"
            className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md hover:border-amber-500/40 transition-colors group"
          >
            <HelpCircle className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-white mb-1">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Answers about order placement, Pathao delivery, and warranty policies.
            </p>
            <span className="text-xs font-semibold text-amber-400 inline-flex items-center gap-1">
              Read FAQs <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/track-order"
            className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md hover:border-amber-500/40 transition-colors group"
          >
            <FileText className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-white mb-1">Track Shipment Status</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Check real-time Pathao and Steadfast courier status using your order ID.
            </p>
            <span className="text-xs font-semibold text-amber-400 inline-flex items-center gap-1">
              Track Order <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/contact"
            className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md hover:border-amber-500/40 transition-colors group"
          >
            <PhoneCall className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-white mb-1">Contact Support Desk</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Speak directly with our support team or submit a customer service ticket.
            </p>
            <span className="text-xs font-semibold text-amber-400 inline-flex items-center gap-1">
              Contact Us <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
