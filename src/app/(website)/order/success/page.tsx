import Link from "next/link";
import { CheckCircle2, Package, Truck, ArrowRight, Printer, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Placed Successfully - DropshopNN Bangladesh",
  description: "Thank you for your order! Your consignment has been queued for Pathao / Steadfast delivery.",
};

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const orderNumber = id || "ORD-2026-00001";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-md shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-3xl font-extrabold text-white font-heading mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Thank you for shopping with DropshopNN. Your order has been registered and sent to supplier warehouse fulfillment.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 inline-block text-left w-full max-w-md">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800">
              <span className="text-slate-400">Order Number</span>
              <span className="font-mono font-bold text-amber-400">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-3 border-b border-slate-800">
              <span className="text-slate-400">Fulfillment Status</span>
              <span className="text-emerald-400 font-semibold">Confirmed</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-3">
              <span className="text-slate-400">Estimated Delivery</span>
              <span className="text-slate-200">24-48 Hours (Pathao Express)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/track-order?q=${orderNumber}`}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/10 inline-flex items-center gap-2"
            >
              <Truck className="w-4 h-4" /> Track Order Status
            </Link>
            <Link
              href="/products"
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
