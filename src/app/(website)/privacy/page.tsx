import { getPublicContentBySlugAction } from "@/features/cms/actions/content-actions";
import { ShieldCheck } from "lucide-react";
import { RichContentRenderer } from "@/components/editor/rich-content-renderer";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Privacy Policy - ${BRAND.publicName}`,
  description:
    `${BRAND.publicName} privacy policy regarding customer data protection, order processing, and payment security.`,
};

export default async function PrivacyPage() {
  const cmsRes = await getPublicContentBySlugAction("page", "privacy");
  const content = cmsRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Legal & Security Policy
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last updated: July 2026</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
          {content?.bodyHtml ? (
            <RichContentRenderer content={content.bodyHtml} />
          ) : (
            <div>
              <h2>1. Information We Collect</h2>
              <p>
                {BRAND.publicName} collects user account details, shipping addresses, phone numbers, and
                transactional records to process e-commerce orders and courier delivery across
                Bangladesh.
              </p>
              <h2>2. How We Protect Your Data</h2>
              <p>
                All sensitive information is encrypted using SSL/TLS protocols and stored securely
                in MongoDB database clusters with strict role-based access control.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
