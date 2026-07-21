import Link from "next/link";
import { Users, ShieldCheck, Zap, ArrowRight, DollarSign, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Become a Reseller Partner - DropshopNN Bangladesh",
  description: "Start your zero-investment dropshipping business in Bangladesh. Access wholesale rates, stock-free fulfillment, and marketing kits.",
};

export default function BecomeResellerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" /> Zero Capital Business
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight mb-4">
            Start Reselling Tech Accessories Today
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sell authentic gadgets on your Facebook page or website without buying stock upfront. We store, pack, and courier your orders directly to your customers.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <DollarSign className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">High Profit Margins</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn 20% to 35% profit per order with instant wallet payouts straight to your bKash account.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <PackageCheck className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Zero Inventory Risk</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never worry about dead stock or warehouse storage fees. We handle all stock logistics.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <Zap className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Free Marketing Kits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download HD product images, ad videos, and proven Facebook sales copy with one click.
            </p>
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 sm:p-12 text-center text-slate-950 shadow-2xl shadow-amber-500/10">
          <h2 className="text-2xl sm:text-4xl font-black font-heading mb-3">Ready to Build Your E-commerce Brand?</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-900 max-w-lg mx-auto mb-6">
            Join over 2,500 active reseller partners earning daily passive income across Bangladesh.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-colors shadow-xl"
          >
            Register Reseller Account Free <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
