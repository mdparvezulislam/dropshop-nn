import Link from "next/link";
import { Truck, ShieldCheck, ArrowRight, Store, DollarSign } from "lucide-react";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Become a Supplier Partner - ${BRAND.publicName}`,
  description:
    `List your inventory on Bangladesh's leading dropshipping and wholesale platform. Reach 2,500+ active resellers.`,
};

export default function BecomeSupplierPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Store className="w-3.5 h-3.5" /> Supplier Distribution Network
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight mb-4">
            Expand Your Brand Distribution Across BD
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Are you an official brand importer or electronics manufacturer in Bangladesh? Connect
            your warehouse stock to 2,500+ active reseller stores automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <Store className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">2,500+ Reseller Force</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your products are promoted instantly across thousands of Facebook pages and e-commerce
              stores.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <Truck className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Automated Pickup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pathao & Steadfast riders pick up sold packages directly from your warehouse hub.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <DollarSign className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Guaranteed Weekly Payouts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Timely bank settlements for fulfilled orders directly into your corporate bank
              account.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-3">
            Become a Supplier Partner
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Submit your company trade license and BIN number to get onboarded as an official
            supplier.
          </p>
          <Link
            href="/contact?type=supplier"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
          >
            Apply for Supplier Onboarding <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
