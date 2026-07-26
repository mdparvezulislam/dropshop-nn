import Link from "next/link";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import { Search, Truck, Clock, CheckCircle2, AlertCircle, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Track Order Status - DropshopNN Bangladesh",
  description:
    "Track your shipment status in real-time with Pathao Courier & Steadfast integration.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function TrackOrderPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let order = null;
  if (query) {
    const repo = new OrderRepository();
    if (query.startsWith("ORD-")) {
      order = await repo.findByOrderNumber(query);
    } else {
      const results = await repo.find({
        $or: [
          { "customer.phone": query },
          { "customer.email": query.toLowerCase() },
          { orderNumber: query },
        ],
      });
      order = results[0] || null;
    }
  }

  const steps = [
    { key: "pending", label: "Order Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Truck className="w-3.5 h-3.5" /> Real-time Logistics Tracking
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight mb-2">
            Track Your Order
          </h1>
          <p className="text-xs text-slate-400">
            Enter your Order Number (e.g. ORD-2026-00001), Phone Number, or Email address to view
            courier status.
          </p>
        </div>

        {/* Search Bar */}
        <form method="GET" className="mb-10 max-w-xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Order # (ORD-2026-00001) or Phone (017...)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-11 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          </div>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
          >
            Track Order
          </button>
        </form>

        {/* Results Card */}
        {query && (
          <div>
            {!order ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center backdrop-blur-md">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No order found</h3>
                <p className="text-xs text-slate-400">
                  We could not locate any order matching &quot;{query}&quot;. Please verify your
                  order ID or phone number.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-8">
                {/* Summary Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Consignment
                    </span>
                    <h2 className="text-2xl font-extrabold text-white font-mono">
                      {order.orderNumber}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Recipient: {order.shipping?.receiverName} ({order.shipping?.district})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {order.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Total: ৳{(order.pricing.grandTotal / 100).toLocaleString("en-BD")} BDT
                    </p>
                  </div>
                </div>

                {/* Logistics Info */}
                {order.shippingInfo && (
                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Courier Partner:</span>{" "}
                      <strong className="text-amber-400">{order.shippingInfo.courierName}</strong>
                    </div>
                    {order.shippingInfo.trackingNumber && (
                      <div>
                        <span className="text-slate-400">Tracking Code:</span>{" "}
                        <strong className="text-slate-200 font-mono">
                          {order.shippingInfo.trackingNumber}
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline Progress */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-6">Delivery Progress</h3>
                  <div className="relative flex items-center justify-between border-t border-slate-800 pt-6">
                    {steps.map((s, idx) => {
                      const isComplete =
                        idx <= steps.findIndex((st) => st.key === order.status) ||
                        order.status === "delivered" ||
                        order.status === "completed";
                      return (
                        <div
                          key={s.key}
                          className="flex flex-col items-center relative z-10 text-center"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isComplete
                                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                : "bg-slate-950 border border-slate-800 text-slate-500"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span
                            className={`text-[11px] mt-2 font-medium ${isComplete ? "text-slate-200" : "text-slate-500"}`}
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
