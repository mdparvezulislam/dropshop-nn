"use client";

import type { ReactElement } from "react";
import { Truck, MapPin, CalendarCheck } from "lucide-react";

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export interface CartDeliveryEstimatorProps {
  zone: DeliveryZone;
  onZoneChange: (zone: DeliveryZone) => void;
}

export function CartDeliveryEstimator({
  zone,
  onZoneChange,
}: CartDeliveryEstimatorProps): ReactElement {
  const charge = zone === "inside_dhaka" ? 60 : 120;
  const estimateDays = zone === "inside_dhaka" ? "১ - ২ দিন" : "২ - ৪ দিন";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-amber-500" aria-hidden />
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">ডেলিভারি হিসাব</h3>
        </div>
        <span className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400">
          <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
          <span>{estimateDays}</span>
        </span>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          ডেলিভারি এলাকা নির্বাচন করুন:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onZoneChange("inside_dhaka")}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all active:scale-95 touch-manipulation ${
              zone === "inside_dhaka"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300"
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-black">
              <MapPin className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              <span>ঢাকার ভিতরে</span>
            </div>
            <span className="text-[11px] font-extrabold mt-1 text-slate-600 dark:text-slate-400">
              চার্জ: ৳৬০
            </span>
          </button>

          <button
            type="button"
            onClick={() => onZoneChange("outside_dhaka")}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all active:scale-95 touch-manipulation ${
              zone === "outside_dhaka"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300"
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-black">
              <MapPin className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              <span>ঢাকার বাইরে</span>
            </div>
            <span className="text-[11px] font-extrabold mt-1 text-slate-600 dark:text-slate-400">
              চার্জ: ৳১২০
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartDeliveryEstimator;
