import Link from "next/link";
import { Building, Award, ShieldCheck, ArrowRight, Package, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Become a Wholesale Partner - DropshopNN B2B",
  description: "Bulk wholesale pricing, low MOQ orders, and direct importer access for Bangladesh shopkeepers.",
};

export default function BecomeWholesalePartnerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Building className="w-3.5 h-3.5" /> B2B Wholesale Platform
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight mb-4">
            Source Bulk Gadgets at Direct Import Prices
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Designed for physical retail shop owners and major online stores. Low MOQ starting from 5 units per SKU with formal VAT invoicing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <Package className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Low MOQ Lots</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flexible order quantities start at just 5 units, allowing higher inventory turnover.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Official Warranty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All wholesale lots come with official Bangladesh importer replacement warranty tags.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <TrendingUp className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Tax & VAT Invoices</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download formal tax invoices and credit terms for corporate trade accounting.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-3">Apply for Wholesale Account Access</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Register your business trade license to unlock tier-1 wholesale pricing.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
          >
            Apply for Wholesale Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
