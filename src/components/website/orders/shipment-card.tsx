import * as React from "react";
import { Truck, PackageSearch, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CustomerShipmentView } from "@/features/courier/services/shipment-read-service";
import type { OrderStatus } from "@/features/order/domain/state-machine";

/**
 * Customer shipment card.
 *
 * Two rules this component exists to hold:
 *  1. Nothing is invented. No tracking number, courier or delivery date is
 *     shown unless fulfillment actually recorded it.
 *  2. When there is no shipment, the customer is told plainly what stage the
 *     order is at instead of being shown an empty or placeholder tracker.
 */

const TONE_CLASSES = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  progress: "bg-amber-50 text-amber-800 border-amber-200",
  neutral: "bg-slate-50 text-slate-700 border-slate-200",
} as const;

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("bn-BD", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** What to tell a customer whose order has no shipment yet. */
function pendingMessage(orderStatus: OrderStatus): string {
  switch (orderStatus) {
    case "draft":
    case "pending":
      return "আপনার অর্ডারটি নিশ্চিত করার জন্য আমরা শীঘ্রই যোগাযোগ করব। কনফার্ম হলে শিপমেন্ট তৈরি হবে।";
    case "confirmed":
    case "picking":
      return "অর্ডার কনফার্ম হয়েছে। পণ্য প্যাক করার পর কুরিয়ার ও ট্র্যাকিং নম্বর এখানে দেখা যাবে।";
    case "packed":
    case "ready_for_dispatch":
      return "পণ্য প্যাক হয়ে গেছে। কুরিয়ারের কাছে হস্তান্তরের পর ট্র্যাকিং তথ্য এখানে আসবে।";
    case "cancelled":
      return "অর্ডারটি বাতিল হয়েছে, তাই কোনো শিপমেন্ট নেই।";
    case "returned":
    case "refunded":
      return "এই অর্ডারটি ফেরত প্রক্রিয়ায় আছে।";
    default:
      return "শিপমেন্টের তথ্য এখনো যোগ করা হয়নি। আপডেট হলে এখানেই দেখতে পাবেন।";
  }
}

export function ShipmentCard({
  shipment,
  orderStatus,
  className,
}: {
  shipment?: CustomerShipmentView;
  orderStatus: OrderStatus;
  className?: string;
}): React.ReactElement {
  if (!shipment) {
    return (
      <section
        aria-labelledby="shipment-heading"
        className={cn("bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5", className)}
      >
        <h2
          id="shipment-heading"
          className="text-sm font-black text-slate-900 flex items-center gap-1.5"
        >
          <Truck className="h-4 w-4 text-slate-400" aria-hidden />
          শিপমেন্ট
        </h2>
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
          <PackageSearch className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            {pendingMessage(orderStatus)}
          </p>
        </div>
      </section>
    );
  }

  const dispatchedAt = formatDate(shipment.dispatchedAt);
  const estimatedAt = formatDate(shipment.estimatedDeliveryAt);
  const deliveredAt = formatDate(shipment.deliveredAt);
  const returnedAt = formatDate(shipment.returnedAt);

  return (
    <section
      aria-labelledby="shipment-heading"
      className={cn("bg-white border border-slate-200 rounded-2xl p-5 space-y-4", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="shipment-heading"
          className="text-sm font-black text-slate-900 flex items-center gap-1.5"
        >
          <Truck className="h-4 w-4 text-slate-400" aria-hidden />
          শিপমেন্ট
        </h2>
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black border",
            TONE_CLASSES[shipment.tone],
          )}
        >
          {shipment.statusLabel}
        </span>
      </div>

      <dl className="space-y-1.5 text-xs font-bold text-slate-600">
        <div className="flex justify-between gap-3">
          <dt>কুরিয়ার</dt>
          <dd className="text-slate-900 text-right">{shipment.courierName}</dd>
        </div>

        <div className="flex justify-between gap-3">
          <dt>ট্র্যাকিং নম্বর</dt>
          <dd className="text-slate-900 text-right font-mono">
            {shipment.trackingNumber ? (
              shipment.trackingUrl ? (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-700 underline focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
                >
                  {shipment.trackingNumber}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : (
                shipment.trackingNumber
              )
            ) : (
              <span className="font-sans font-bold text-slate-500">এখনো দেওয়া হয়নি</span>
            )}
          </dd>
        </div>

        {shipment.packageCount > 1 && (
          <div className="flex justify-between gap-3">
            <dt>প্যাকেজ সংখ্যা</dt>
            <dd className="text-slate-900">{shipment.packageCount} টি</dd>
          </div>
        )}

        {dispatchedAt && (
          <div className="flex justify-between gap-3">
            <dt>কুরিয়ারে হস্তান্তর</dt>
            <dd className="text-slate-900 text-right">{dispatchedAt}</dd>
          </div>
        )}

        {estimatedAt && !deliveredAt && (
          <div className="flex justify-between gap-3">
            <dt>সম্ভাব্য ডেলিভারি</dt>
            <dd className="text-slate-900 text-right">{estimatedAt}</dd>
          </div>
        )}

        {deliveredAt && (
          <div className="flex justify-between gap-3">
            <dt>ডেলিভারি হয়েছে</dt>
            <dd className="text-emerald-700 text-right">{deliveredAt}</dd>
          </div>
        )}

        {returnedAt && (
          <div className="flex justify-between gap-3">
            <dt>ফেরত এসেছে</dt>
            <dd className="text-red-700 text-right">{returnedAt}</dd>
          </div>
        )}
      </dl>

      {!shipment.trackingNumber && (
        <p className="flex items-start gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <Info className="h-3.5 w-3.5 shrink-0 mt-px text-slate-400" aria-hidden />
          কুরিয়ার ট্র্যাকিং নম্বর দেওয়ার সাথে সাথেই এখানে যোগ করা হবে।
        </p>
      )}

      {shipment.deliveryNotes && (
        <p className="text-[11px] font-bold text-slate-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          ডেলিভারি নোট: {shipment.deliveryNotes}
        </p>
      )}

      {shipment.timeline.length > 0 && (
        <div className="pt-1 border-t border-slate-100">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wide mb-2.5 mt-3">
            শিপমেন্ট টাইমলাইন
          </h3>
          <ol className="space-y-2.5" aria-label="শিপমেন্ট টাইমলাইন">
            {shipment.timeline.map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="flex gap-2.5">
                <span className="flex flex-col items-center" aria-hidden>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full mt-1.5",
                      index === 0 ? "bg-amber-500" : "bg-slate-300",
                    )}
                  />
                  {index < shipment.timeline.length - 1 && (
                    <span className="w-px flex-1 bg-slate-200 mt-1" />
                  )}
                </span>
                <div className="min-w-0 pb-1">
                  <p className="text-[11px] font-black text-slate-900">{entry.label}</p>
                  <p className="text-[11px] font-bold text-slate-500">{entry.message}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {formatDateTime(entry.at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

export default ShipmentCard;
