import type { Metadata } from "next";
import Link from "next/link";
import { Package, ChevronRight, ChevronLeft } from "lucide-react";
import { getMyOrdersAction } from "@/features/order/actions/customer-order-actions";
import { OrdersFilterBar } from "./orders-filter-bar";
import {
  OrderStatusBadge,
  formatBdt,
  formatOrderDate,
} from "@/components/website/orders/order-view";

export const metadata: Metadata = {
  title: "আমার অর্ডার",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    sort?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getMyOrdersAction({
    page: params.page ? Number(params.page) : undefined,
    search: params.q || undefined,
    status: params.status || undefined,
    sort: params.sort === "oldest" ? "oldest" : "newest",
    from: params.from || undefined,
    to: params.to || undefined,
  });

  const data = result.success ? result.data : null;

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) next.set(key, value);
    }
    next.set("page", String(page));
    return `/account/orders?${next.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-slate-900">আমার অর্ডার</h1>
        {data && (
          <p className="text-xs font-bold text-slate-500 mt-0.5">মোট {data.totalCount} টি অর্ডার</p>
        )}
      </div>

      <OrdersFilterBar />

      {!result.success ? (
        <div
          role="alert"
          className="p-6 rounded-2xl bg-red-50 border border-red-200 text-sm font-bold text-red-800"
        >
          {result.error}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-amber-500"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                    <Package className="h-5 w-5 text-slate-500" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black font-mono text-slate-900">
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </span>
                    <span className="block text-[11px] font-bold text-slate-500 mt-0.5">
                      {formatOrderDate(order.placedAt)} • {order.itemCount} টি আইটেম
                      {order.firstItemName ? ` • ${order.firstItemName}` : ""}
                    </span>
                  </span>
                  <span className="text-sm font-black text-slate-900 tabular-nums shrink-0">
                    {formatBdt(order.grandTotal)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>

          {data.totalPages > 1 && (
            <nav
              aria-label="অর্ডার পেজিনেশন"
              className="flex items-center justify-center gap-2 pt-2"
            >
              {data.page > 1 && (
                <Link
                  href={pageHref(data.page - 1)}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-slate-300 text-xs font-black text-slate-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-amber-500"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                  আগের
                </Link>
              )}
              <span className="text-xs font-black text-slate-600" aria-current="page">
                পেজ {data.page} / {data.totalPages}
              </span>
              {data.page < data.totalPages && (
                <Link
                  href={pageHref(data.page + 1)}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-slate-300 text-xs font-black text-slate-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-amber-500"
                >
                  পরের
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
          <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" aria-hidden />
          <p className="text-sm font-black text-slate-700 mb-1">কোনো অর্ডার পাওয়া যায়নি</p>
          <p className="text-xs font-bold text-slate-500 mb-4">
            {params.q || params.status || params.from
              ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
              : "এখনো কোনো অর্ডার করেননি।"}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            শপিং শুরু করুন
          </Link>
        </div>
      )}
    </div>
  );
}
