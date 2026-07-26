import { getPublicContentBySlugAction } from "@/features/cms/actions/content-actions";
import { Scale } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Conditions - DropshopNN Bangladesh",
  description: "User agreement, reseller code of conduct, and terms of service.",
};

export default async function TermsPage() {
  const cmsRes = await getPublicContentBySlugAction("page", "terms");
  const content = cmsRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" /> User Agreement
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">Terms & Conditions</h1>
          <p className="text-xs text-slate-400 mt-1">Platform Rules & Operating Standards</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md prose prose-invert max-w-none text-xs leading-relaxed text-slate-300">
          {content?.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: content.bodyHtml }} />
          ) : (
            <div>
              <h2>Platform Agreement</h2>
              <p>
                By registering an account on DropshopNN, suppliers, reseller partners, wholesale
                buyers, and retail customers agree to follow fair trading practices and accurate
                product descriptions.
              </p>
              <h2>Reseller Code of Conduct</h2>
              <p>
                Resellers must not mislead retail customers regarding product specifications,
                delivery times, or official warranty terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
