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
  deliveryFee: number;
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
  const district =
    order?.shipping?.district ||
    order?.customer?.district ||
    order?.shipping?.division ||
    "Dhaka";
  const isDhaka = String(district).toLowerCase().includes("dhaka");
  const defaultDeliveryTaka = isDhaka ? 60 : 120;

  const items = order?.items || order?.pricing?.items || [];
  const rawSubtotal = Math.max(
    0,
    Number(
      order?.pricing?.subtotal ??
      order?.subtotal ??
      (items.length > 0
        ? items.reduce((sum: number, i: any) => {
            const rawP = i.unitSellingPrice ?? i.unitPrice ?? i.price ?? 0;
            const pTaka = rawP > 5000 ? Math.round(rawP / 100) : rawP;
            return sum + pTaka * (i.quantity || 1);
          }, 0)
        : 0)
    )
  );
  const subtotal = rawSubtotal > 10000 ? Math.round(rawSubtotal / 100) : rawSubtotal;

  const rawDeliveryFee =
    (order?.deliveryChargeCents && order?.deliveryChargeCents > 0 ? order?.deliveryChargeCents : undefined) ??
    (order?.shipping?.deliveryFee && order?.shipping?.deliveryFee > 0 ? order?.shipping?.deliveryFee : undefined) ??
    (order?.shipping?.deliveryCharge && order?.shipping?.deliveryCharge > 0 ? order?.shipping?.deliveryCharge : undefined) ??
    (order?.pricing?.deliveryFee && order?.pricing?.deliveryFee > 0 ? order?.pricing?.deliveryFee : undefined) ??
    (order?.shippingCost && order?.shippingCost > 0 ? order?.shippingCost : undefined) ??
    defaultDeliveryTaka;

  const deliveryFee = rawDeliveryFee > 1000 ? Math.round(rawDeliveryFee / 100) : rawDeliveryFee;

  const grandTotal = subtotal + deliveryFee;

  const paymentMethodRaw = String(order?.shipping?.paymentMethod || order?.paymentMethod || "cod").toLowerCase();
  const isCod = paymentMethodRaw.includes("cod") || paymentMethodRaw.includes("cash");

  const rawAdvance =
    order?.pricing?.advancePaid ??
    order?.advancePaidCents ??
    order?.advancePaid ??
    order?.metadata?.advancePaid ??
    order?.paidAmount ??
    parseAdvancePaidFromNotes(order?.shipping?.deliveryNote || order?.notes);

  let advancePaid = 0;
  if (rawAdvance > 0) {
    const numAdv = Number(rawAdvance);
    if (numAdv >= 1000 && grandTotal < 10000) {
      advancePaid = Math.round(numAdv / 100);
    } else if (numAdv >= 10000) {
      advancePaid = Math.round(numAdv / 100);
    } else {
      advancePaid = numAdv;
    }
  }

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
    deliveryFee,
    badgeLabel,
    badgeCls,
    dueLabel,
    dueCls,
  };
}
