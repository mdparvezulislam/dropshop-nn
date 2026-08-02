import Image from "next/image";
import {
  Check,
  Clock,
  PackageCheck,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  FileText,
  Receipt,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type {
  CustomerOrderDetail,
  CustomerOrderTimelineStep,
} from "@/features/order/actions/customer-order-actions";
import type { OrderStatus } from "@/features/order/domain/state-machine";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";

/**
 * Server-rendered building blocks for the customer order experience.
 * Every number displayed comes from the order DTO — nothing recalculated.
 */

export function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Status labels (customer-facing) ─────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "প্রক্রিয়াধীন",
  pending: "অপেক্ষমাণ",
  confirmed: "নিশ্চিত হয়েছে",
  picking: "পণ্য সংগ্রহ চলছে",
  packed: "প্যাক হয়েছে",
  processing: "প্যাকিং চলছে",
  ready_for_dispatch: "ডিসপ্যাচের জন্য প্রস্তুত",
  pickup_requested: "কুরিয়ারে হস্তান্তর",
  courier_assigned: "কুরিয়ারে হস্তান্তর",
  shipped: "শিপড",
  out_for_delivery: "ডেলিভারির পথে",
  delivered: "ডেলিভার হয়েছে",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
  return_requested: "রিটার্ন অনুরোধ",
  return_initiated: "রিটার্ন চলছে",
  returned: "রিটার্ন হয়েছে",
  refunded: "রিফান্ড হয়েছে",
  failed: "ব্যর্থ",
};

const NEGATIVE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "cancelled",
  "failed",
  "return_requested",
  "return_initiated",
  "returned",
  "refunded",
]);

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label = STATUS_LABELS[status] ?? status;
  const negative = NEGATIVE_STATUSES.has(status);
  const delivered = status === "delivered" || status === "completed";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border",
        negative
          ? "bg-red-50 text-red-700 border-red-200"
          : delivered
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-amber-50 text-amber-800 border-amber-200",
      )}
    >
      {negative ? (
        <RotateCcw className="h-3 w-3" aria-hidden />
      ) : delivered ? (
        <Check className="h-3 w-3" aria-hidden />
      ) : (
        <Clock className="h-3 w-3" aria-hidden />
      )}
      {label}
    </span>
  );
}

// ── Progress steps ───────────────────────────────────────────────────────

const PROGRESS_STEPS: Array<{
  label: string;
  icon: typeof Clock;
  statuses: OrderStatus[];
}> = [
  { label: "অর্ডার হয়েছে", icon: Clock, statuses: ["draft", "pending"] },
  { label: "নিশ্চিত", icon: Check, statuses: ["confirmed"] },
  {
    label: "প্যাকিং",
    icon: PackageCheck,
    statuses: ["picking", "packed", "ready_for_dispatch", "courier_assigned"],
  },
  { label: "শিপিং", icon: Truck, statuses: ["shipped", "out_for_delivery"] },
  { label: "ডেলিভারড", icon: Home, statuses: ["delivered", "completed"] },
];

export function OrderProgress({ status }: { status: OrderStatus }) {
  if (NEGATIVE_STATUSES.has(status)) {
    return (
      <div
        className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-black text-red-800"
        role="status"
      >
        <XCircle className="h-5 w-5 shrink-0" aria-hidden />
        অর্ডারটির অবস্থা: {STATUS_LABELS[status] ?? status}
      </div>
    );
  }

  const activeIndex = PROGRESS_STEPS.findIndex((step) => step.statuses.includes(status));
  const currentIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <ol className="flex items-start justify-between gap-1" aria-label="অর্ডারের অগ্রগতি">
      {PROGRESS_STEPS.map((step, index) => {
        const Icon = step.icon;
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step.label} className="flex items-start flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5 min-w-14">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2",
                  done || current
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-white text-slate-400",
                )}
                aria-hidden
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-black text-center leading-tight",
                  done || current ? "text-slate-900" : "text-slate-400",
                )}
                aria-current={current ? "step" : undefined}
              >
                {step.label}
              </span>
            </div>
            {index < PROGRESS_STEPS.length - 1 && (
              <div
                aria-hidden
                className={cn(
                  "h-0.5 flex-1 mt-4 mx-1 rounded",
                  index < currentIndex ? "bg-emerald-400" : "bg-slate-200",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Event timeline (real order events) ──────────────────────────────────

export function OrderEventTimeline({ steps }: { steps: CustomerOrderTimelineStep[] }) {
  if (steps.length === 0) return null;
  const ordered = [...steps].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return (
    <ol className="space-y-3" aria-label="অর্ডার টাইমলাইন">
      {ordered.map((step, i) => (
        <li key={`${step.at}-${i}`} className="flex gap-3">
          <span className="flex flex-col items-center" aria-hidden>
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full mt-1.5",
                i === 0 ? "bg-amber-500" : "bg-slate-300",
              )}
            />
            {i < ordered.length - 1 && <span className="w-px flex-1 bg-slate-200 mt-1" />}
          </span>
          <div className="pb-2">
            <p className="text-xs font-black text-slate-900">{step.summary}</p>
            <p className="text-[11px] font-bold text-slate-500">
              {new Date(step.at).toLocaleString("bn-BD", {
                day: "numeric",
                month: "long",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ── Items + totals ───────────────────────────────────────────────────────

export function OrderItemsList({ items }: { items: CustomerOrderDetail["items"] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item, i) => (
        <li
          key={`${item.productId}-${item.variantSku ?? i}`}
          className="flex items-center gap-3 py-3"
        >
          <div className="relative h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
            <Image
              src={PRODUCT_IMAGE_PLACEHOLDER}
              alt=""
              fill
              className="object-contain p-2 opacity-60"
              sizes="48px"
            />
            <Package className="absolute inset-0 m-auto h-5 w-5 text-slate-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 line-clamp-1">{item.name}</p>
            <p className="text-[11px] font-bold text-slate-500">
              {item.variantSku ? `${item.variantSku} • ` : ""}
              {item.quantity} × {formatBdt(item.unitPrice)}
            </p>
          </div>
          <span className="text-xs font-black text-slate-900 tabular-nums">
            {formatBdt(item.totalPrice)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: CustomerOrderDetail }) {
  return (
    <dl className="space-y-1.5 text-xs font-bold text-slate-600">
      <div className="flex justify-between">
        <dt>সাবটোটাল</dt>
        <dd className="tabular-nums text-slate-900">{formatBdt(order.subtotal)}</dd>
      </div>
      {order.discountTotal > 0 && (
        <div className="flex justify-between text-emerald-700">
          <dt>ডিসকাউন্ট</dt>
          <dd className="tabular-nums">-{formatBdt(order.discountTotal)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>ডেলিভারি চার্জ</dt>
        <dd className="tabular-nums text-slate-900">
          {order.shippingTotal === 0 ? "ফ্রি" : formatBdt(order.shippingTotal)}
        </dd>
      </div>
      <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
        <dt className="font-black text-slate-900">মোট</dt>
        <dd className="font-black text-slate-900 tabular-nums">{formatBdt(order.grandTotal)}</dd>
      </div>
    </dl>
  );
}

export function OrderAddressCard({ order }: { order: CustomerOrderDetail }) {
  return (
    <div className="text-xs font-bold text-slate-700 space-y-1">
      <p className="font-black text-slate-900">
        {order.address.receiverName} — {order.address.phone}
      </p>
      {/* Empty parts are dropped — checkout no longer collects an upazila, and
          a dangling ", ," reads like missing data rather than an absent field. */}
      <p>
        {[
          order.address.address,
          order.address.upazila,
          order.address.district,
          order.address.division,
        ]
          .filter((part) => Boolean(part?.trim()))
          .join(", ")}
        {order.address.postalCode ? ` — ${order.address.postalCode}` : ""}
      </p>
      {order.address.landmark && <p>ল্যান্ডমার্ক: {order.address.landmark}</p>}
      {order.address.deliveryNote && (
        <p className="text-slate-500">নোট: {order.address.deliveryNote}</p>
      )}
    </div>
  );
}

/** Invoice / receipt / packing-slip architecture placeholders (disabled until PDF generation ships). */
export function OrderDownloadsPlaceholder() {
  const items = [
    { label: "ইনভয়েস", icon: FileText },
    { label: "রিসিট", icon: Receipt },
    { label: "প্যাকিং স্লিপ", icon: Package },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          disabled
          aria-disabled="true"
          title="শীঘ্রই আসছে"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-[11px] font-bold text-slate-400 cursor-not-allowed"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label} (শীঘ্রই)
        </button>
      ))}
    </div>
  );
}
