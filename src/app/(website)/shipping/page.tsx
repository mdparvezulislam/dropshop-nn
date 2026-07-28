import { getPublicContentBySlugAction } from "@/features/cms/actions/content-actions";
import { Truck } from "lucide-react";
import { RichContentRenderer } from "@/components/editor/rich-content-renderer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shipping & Courier Policy - DropshopNN",
  description:
    "Pathao Express and Steadfast Courier delivery timelines, shipping rates, and Cash on Delivery guidelines across BD.",
};

export default async function ShippingPage() {
  const cmsRes = await getPublicContentBySlugAction("page", "shipping");
  const content = cmsRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Truck className="w-3.5 h-3.5" /> Courier Logistics Guidelines
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">
            Shipping & Courier Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">24h Dhaka Metro / 48h Nationwide Delivery</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
          {content?.bodyHtml ? (
            <RichContentRenderer content={content.bodyHtml} />
          ) : (
            <div>
              <h2>Dhaka Metro Delivery</h2>
              <p>
                Orders within Dhaka City are fulfilled via Pathao Express Courier with standard
                delivery within 24 hours.
              </p>
              <h2>Nationwide Delivery</h2>
              <p>
                District and Upazila deliveries are handled via Steadfast Courier with full
                Cash-on-Delivery (COD) support within 48 to 72 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
