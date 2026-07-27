"use client";

import * as React from "react";
import { Search, Loader2, AlertTriangle, PackageSearch } from "lucide-react";
import { trackOrderAction } from "@/features/order/actions/customer-order-actions";
import type { TrackOrderResult } from "@/features/order/actions/customer-order-actions";
import {
  OrderProgress,
  OrderEventTimeline,
  OrderStatusBadge,
  formatOrderDate,
} from "@/components/website/orders/order-view";
import { ShipmentCard } from "@/components/website/orders/shipment-card";

const inputClass =
  "w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus-visible:outline-2 focus-visible:outline-amber-500";

/**
 * Secure order tracking: BOTH order number and the order's phone are
 * required — the server verifies the pair and returns only tracking data.
 */
export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [result, setResult] = React.useState<TrackOrderResult | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotFound(false);
    setResult(null);

    const response = await trackOrderAction({ orderNumber, phone });
    setLoading(false);

    if (!response.success) {
      setError(response.error);
      return;
    }
    if (!response.data) {
      setNotFound(true);
      return;
    }
    setResult(response.data);
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs"
        noValidate
      >
        <div className="space-y-1.5">
          <label htmlFor="track-number" className="block text-xs font-black text-slate-800">
            অর্ডার নম্বর
            <span className="text-red-600 ml-0.5" aria-hidden>
              *
            </span>
          </label>
          <input
            id="track-number"
            className={inputClass}
            placeholder="ORD-123456"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="track-phone" className="block text-xs font-black text-slate-800">
            অর্ডারে ব্যবহৃত মোবাইল নম্বর
            <span className="text-red-600 ml-0.5" aria-hidden>
              *
            </span>
          </label>
          <input
            id="track-phone"
            className={inputClass}
            type="tel"
            inputMode="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <p className="text-[11px] font-bold text-slate-500">
            নিরাপত্তার জন্য অর্ডার নম্বরের সাথে মোবাইল নম্বরও মিলতে হবে।
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        {notFound && (
          <p
            role="alert"
            className="flex items-center gap-2 text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-2.5"
          >
            <PackageSearch className="h-4 w-4 shrink-0" aria-hidden />
            এই তথ্যে কোনো অর্ডার পাওয়া যায়নি। অর্ডার নম্বর ও মোবাইল নম্বর মিলিয়ে দেখুন।
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              খোঁজা হচ্ছে...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden />
              অর্ডার ট্র্যাক করুন
            </>
          )}
        </button>
      </form>

      {result && (
        <div
          ref={resultRef}
          tabIndex={-1}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs outline-none"
          aria-label="ট্র্যাকিং ফলাফল"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-black font-mono text-slate-900">{result.orderNumber}</p>
              <p className="text-[11px] font-bold text-slate-500">
                {formatOrderDate(result.placedAt)} • {result.district}
              </p>
            </div>
            <OrderStatusBadge status={result.status} />
          </div>

          <OrderProgress status={result.status} />

          <ShipmentCard
            shipment={result.shipment}
            orderStatus={result.status}
            className="border-slate-200"
          />

          {result.timeline.length > 0 && <OrderEventTimeline steps={result.timeline} />}
        </div>
      )}
    </div>
  );
}
