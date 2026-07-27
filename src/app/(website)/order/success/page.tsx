import Link from "next/link";
import { CheckCircle2, Phone, ArrowRight, ShoppingBag, Printer } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrderByAccessTokenAction } from "@/features/order/actions/customer-order-actions";
import {
  OrderProgress,
  OrderItemsList,
  OrderTotals,
  OrderAddressCard,
  OrderDownloadsPlaceholder,
  OrderStatusBadge,
  formatOrderDate,
} from "@/components/website/orders/order-view";
import { ShipmentCard } from "@/components/website/orders/shipment-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "অর্ডার সম্পন্ন",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ n?: string; k?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { n, k } = await searchParams;

  const [session, orderResult] = await Promise.all([
    auth(),
    k ? getOrderByAccessTokenAction(k) : Promise.resolve(null),
  ]);
  const order = orderResult?.success ? orderResult.data : null;
  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8 sm:py-12">
      <div className="mx-auto px-4 max-w-3xl space-y-5">
        {/* Confirmation banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" aria-hidden />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1.5">অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h1>
          <p className="text-sm font-medium text-slate-600">
            আমাদের টিম শীঘ্রই ফোনে যোগাযোগ করে অর্ডারটি নিশ্চিত করবে।
          </p>
          {(order || n) && (
            <div className="inline-flex flex-col gap-1 px-6 py-3 mt-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                অর্ডার নম্বর
              </span>
              <span className="text-lg font-black font-mono">{order?.orderNumber ?? n}</span>
              {order && (
                <span className="mx-auto">
                  <OrderStatusBadge status={order.status} />
                </span>
              )}
            </div>
          )}
        </div>

        {order ? (
          <>
            {/* Progress */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs">
              <OrderProgress status={order.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Summary */}
              <section
                aria-labelledby="success-summary-heading"
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3"
              >
                <h2 id="success-summary-heading" className="text-sm font-black">
                  অর্ডার সামারি
                </h2>
                <OrderItemsList items={order.items} />
                <OrderTotals order={order} />
              </section>

              {/* Delivery + payment */}
              <section
                aria-labelledby="success-delivery-heading"
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div>
                  <h2 id="success-delivery-heading" className="text-sm font-black mb-2">
                    ডেলিভারি ঠিকানা
                  </h2>
                  <OrderAddressCard order={order} />
                </div>
                <dl className="text-xs font-bold text-slate-600 space-y-1 pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <dt>অর্ডারের তারিখ</dt>
                    <dd className="text-slate-900">{formatOrderDate(order.placedAt)}</dd>
                  </div>
                  {order.shippingMethodLabel && (
                    <div className="flex justify-between">
                      <dt>ডেলিভারি পদ্ধতি</dt>
                      <dd className="text-slate-900">{order.shippingMethodLabel}</dd>
                    </div>
                  )}
                  {order.shippingEta && (
                    <div className="flex justify-between">
                      <dt>আনুমানিক ডেলিভারি</dt>
                      <dd className="text-slate-900">{order.shippingEta}</dd>
                    </div>
                  )}
                  {order.paymentMethodLabel && (
                    <div className="flex justify-between">
                      <dt>পেমেন্ট পদ্ধতি</dt>
                      <dd className="text-slate-900">{order.paymentMethodLabel}</dd>
                    </div>
                  )}
                </dl>
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                    <Printer className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    ডাউনলোড
                  </h3>
                  <OrderDownloadsPlaceholder />
                </div>
              </section>
            </div>

            {/* Shipment — only once fulfillment has actually created one. A
                just-placed order has none, and the next-steps block below
                already explains what happens first. */}
            {order.shipment && (
              <ShipmentCard
                shipment={order.shipment}
                orderStatus={order.status}
                className="rounded-3xl shadow-xs"
              />
            )}

            {/* Next steps */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 text-xs font-bold text-amber-900 space-y-1">
              <p className="font-black">পরবর্তী ধাপ:</p>
              <p>১. আমাদের টিম ফোনে অর্ডার নিশ্চিত করবে ({order.customerPhone})।</p>
              <p>২. নিশ্চিত হওয়ার পর প্রোডাক্ট প্যাক হয়ে কুরিয়ারে যাবে।</p>
              <p>
                ৩. যেকোনো সময়{" "}
                <Link href="/track-order" className="underline">
                  অর্ডার ট্র্যাক
                </Link>{" "}
                করুন — অর্ডার নম্বর ও মোবাইল নম্বর লাগবে।
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-xs font-bold text-slate-500">
            অর্ডারের বিস্তারিত দেখতে{" "}
            <Link href="/track-order" className="text-amber-700 underline">
              অর্ডার ট্র্যাক পেজ
            </Link>{" "}
            ব্যবহার করুন।
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          {isAuthenticated && order && (
            <Link
              href={`/account/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              অর্ডার দেখুন
            </Link>
          )}
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            আরও শপিং করুন
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <Phone className="h-4 w-4" aria-hidden />
            যোগাযোগ
          </Link>
        </div>
      </div>
    </div>
  );
}
