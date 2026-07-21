import Link from "next/link";
import { getPublicContentBySlugAction } from "@/features/cms/actions/content-actions";
import { Building2, ShieldCheck, Truck, Users, Award, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us - DropshopNN Bangladesh",
  description: "Learn about DropshopNN, Bangladesh's enterprise commerce operating system connecting official importers, resellers, and wholesale traders.",
};

export default async function AboutPage() {
  const cmsRes = await getPublicContentBySlugAction("page", "about");
  const content = cmsRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" /> About DropshopNN
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight mb-4">
            Enterprise Commerce OS for Bangladesh
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Unifying supply chain logistics, wholesale pricing, and automated dropshipping fulfillment for Bangladesh e-commerce.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Official Importers Only</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct sourcing from verified Bangladesh brand distributors with guaranteed 1 Year Warranty.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <Truck className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Automated Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamless API integration with Pathao & Steadfast for 24h Dhaka and 48h nationwide delivery.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <Users className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Multi-Tier Ecosystem</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering retail buyers, reseller entrepreneurs, and wholesale traders on a single platform.
            </p>
          </div>
        </div>

        {/* CMS Body */}
        {content?.bodyHtml && (
          <div
            className="prose prose-invert max-w-none bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md text-xs leading-relaxed text-slate-300"
            dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
          />
        )}
      </div>
    </div>
  );
}
