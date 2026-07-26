import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Printer } from "lucide-react";
import { getMyOrderDetailAction } from "@/features/order/actions/customer-order-actions";
import {
  OrderProgress,
  OrderEventTimeline,
  OrderItemsList,
  OrderTotals,
  OrderAddressCard,
  OrderDownloadsPlaceholder,
  OrderStatusBadge,
  formatOrderDate,
} from "@/components/website/orders/order-view";

export const metadata: Metadata = {
  title: "অর্ডারের বিস্তারিত",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getMyOrderDetailAction(id);

  if (!result.success) {
    throw new Error(result.error);
  }
  if (!result.data) {
    notFound();
  }

  const order = result.data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-xs font-black text-slate-500 hover:text-slate-900 mb-1.5 focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            সব অর্ডার
          </Link>
          <h1 className="text-xl font-black font-mono text-slate-900">{order.orderNumber}</h1>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
            অর্ডারের তারিখ: {formatOrderDate(order.placedAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Progress */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <OrderProgress status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          {/* Items + totals */}
          <section
            aria-labelledby="order-items-heading"
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3"
          >
            <h2 id="order-items-heading" className="text-sm font-black text-slate-900">
              প্রোডাক্টসমূহ ({order.items.length})
            </h2>
            <OrderItemsList items={order.items} />
            <OrderTotals order={order} />
          </section>

          {/* Timeline */}
          {order.timeline.length > 0 && (
            <section
              aria-labelledby="order-timeline-heading"
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6"
            >
              <h2 id="order-timeline-heading" className="text-sm font-black text-slate-900 mb-4">
                অর্ডার টাইমলাইন
              </h2>
              <OrderEventTimeline steps={order.timeline} />
            </section>
          )}
        </div>

        <div className="space-y-5">
          {/* Delivery */}
          <section
            aria-labelledby="order-address-heading"
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
          >
            <h2 id="order-address-heading" className="text-sm font-black text-slate-900">
              ডেলিভারি ঠিকানা
            </h2>
            <OrderAddressCard order={order} />
            <dl className="text-xs font-bold text-slate-600 space-y-1 pt-3 border-t border-slate-100">
              {order.shippingMethodLabel && (
                <div className="flex justify-between">
                  <dt>ডেলিভারি পদ্ধতি</dt>
                  <dd className="text-slate-900">{order.shippingMethodLabel}</dd>
                </div>
              )}
              {order.paymentMethodLabel && (
                <div className="flex justify-between">
                  <dt>পেমেন্ট</dt>
                  <dd className="text-slate-900">{order.paymentMethodLabel}</dd>
                </div>
              )}
              {order.courier?.name && (
                <div className="flex justify-between">
                  <dt>কুরিয়ার</dt>
                  <dd className="text-slate-900">{order.courier.name}</dd>
                </div>
              )}
              {order.courier?.trackingNumber && (
                <div className="flex justify-between">
                  <dt>ট্র্যাকিং নম্বর</dt>
                  <dd className="text-slate-900 font-mono">
                    {order.courier.trackingUrl ? (
                      <a
                        href={order.courier.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 underline"
                      >
                        {order.courier.trackingNumber}
                      </a>
                    ) : (
                      order.courier.trackingNumber
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Downloads */}
          <section
            aria-labelledby="order-downloads-heading"
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <h2
              id="order-downloads-heading"
              className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4 text-slate-400" aria-hidden />
              ডাউনলোড
            </h2>
            <OrderDownloadsPlaceholder />
          </section>
        </div>
      </div>
    </div>
  );
}
