import { getPublicContentBySlugAction } from "@/features/cms/actions/content-actions";
import { RefreshCcw } from "lucide-react";
import { RichContentRenderer } from "@/components/editor/rich-content-renderer";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Refund & Return Policy - ${BRAND.publicName}`,
  description: "Learn about 7-day replacement warranty and wallet refund guidelines in Bangladesh.",
};

export default async function RefundPage() {
  const cmsRes = await getPublicContentBySlugAction("page", "refund");
  const content = cmsRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <RefreshCcw className="w-3.5 h-3.5" /> Returns & Guarantee
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">
            Refund & Return Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">7-Day Hassle Free Replacement Warranty</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
          {content?.bodyHtml ? (
            <RichContentRenderer content={content.bodyHtml} />
          ) : (
            <div>
              <h2>7-Day Defective Item Replacement</h2>
              <p>
                If a product delivered to your customer is physically damaged or non-functional upon
                unboxing, {BRAND.publicName} provides a full replacement within 7 days of delivery.
              </p>
              <h2>Wallet Refund Process</h2>
              <p>
                Refunds for cancelled or returned orders are credited directly to your reseller
                wallet or original bKash/Nagad payment method within 24 to 48 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
