/**
 * Format currency amount as a clean integer without any decimal places.
 * e.g., 3700 -> "3,700" (no .00 or ,00)
 */
export function formatAmount(val: number | string | undefined | null): string {
  const num = Math.round(Number(val) || 0);
  return num.toLocaleString("en-US");
}

export interface PaymentDetails {
  paymentMethodLabel: string;
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  advancePaid: number;
  dueAmount: number;
  grandTotal: number;
  badgeLabel: string;
  badgeCls: string;
  dueLabel: string;
  dueCls: string;
}

function parseAdvancePaidFromNotes(notesStr?: string): number {
  if (!notesStr) return 0;
  const match = String(notesStr).match(/advancePaid:(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

export function getOrderPaymentDetails(order: any): PaymentDetails {
  const rawTotal = Math.max(0, Number(order?.pricing?.grandTotal ?? order?.total ?? order?.sellingPriceCents ?? 0));
  
  // Convert minor cents to major Taka if value exceeds 10,000 cents (৳100)
  const grandTotal = rawTotal > 10000 ? Math.round(rawTotal / 100) : rawTotal;

  const paymentMethodRaw = String(order?.shipping?.paymentMethod || order?.paymentMethod || "cod").toLowerCase();
  const isCod = paymentMethodRaw.includes("cod") || paymentMethodRaw.includes("cash");

  let rawAdvance =
    order?.pricing?.advancePaid ??
    order?.advancePaid ??
    order?.metadata?.advancePaid ??
    order?.paidAmount ??
    parseAdvancePaidFromNotes(order?.shipping?.deliveryNote || order?.notes);

  const advancePaid = Math.max(0, Number(rawAdvance > 10000 ? Math.round(rawAdvance / 100) : rawAdvance));
  const rawStatus = String(order?.paymentStatus || order?.metadata?.paymentStatus || "").toLowerCase();

  let dueAmount = grandTotal;
  let paymentStatus: "unpaid" | "partial" | "paid" | "refunded" = "unpaid";

  if (rawStatus === "paid") {
    paymentStatus = "paid";
    dueAmount = 0;
  } else if (rawStatus === "refunded") {
    paymentStatus = "refunded";
    dueAmount = 0;
  } else if (advancePaid >= grandTotal && grandTotal > 0) {
    paymentStatus = "paid";
    dueAmount = 0;
  } else if (advancePaid > 0 && advancePaid < grandTotal) {
    paymentStatus = "partial";
    dueAmount = grandTotal - advancePaid;
  } else {
    paymentStatus = "unpaid";
    dueAmount = grandTotal;
  }

  let badgeLabel = "Unpaid";
  let badgeCls = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
  let dueLabel = `Due: ৳ ${formatAmount(dueAmount)}`;
  let dueCls = "text-rose-600 font-bold font-mono";

  if (paymentStatus === "paid") {
    badgeLabel = "Paid Full";
    badgeCls = "bg-emerald-50 text-emerald-700 border-emerald-200 font-black";
    dueLabel = "Paid Full";
    dueCls = "text-emerald-600 font-bold font-mono";
  } else if (paymentStatus === "partial") {
    badgeLabel = `Adv ৳${formatAmount(advancePaid)}`;
    badgeCls = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
    dueLabel = `Due: ৳ ${formatAmount(dueAmount)}`;
    dueCls = "text-rose-600 font-bold font-mono";
  } else if (paymentStatus === "refunded") {
    badgeLabel = "Refunded";
    badgeCls = "bg-slate-100 text-slate-700 border-slate-200";
    dueLabel = "Refunded";
    dueCls = "text-slate-500 font-medium";
  } else {
    badgeLabel = isCod ? "COD" : "Unpaid";
    badgeCls = isCod
      ? "bg-slate-100 text-slate-800 border-slate-200 font-extrabold"
      : "bg-rose-50 text-rose-700 border-rose-200 font-bold";
    dueLabel = `Due: ৳ ${formatAmount(dueAmount)}`;
    dueCls = "text-rose-600 font-bold font-mono";
  }

  return {
    paymentMethodLabel: isCod ? "COD" : paymentMethodRaw.toUpperCase(),
    paymentStatus,
    advancePaid,
    dueAmount,
    grandTotal,
    badgeLabel,
    badgeCls,
    dueLabel,
    dueCls,
  };
}
