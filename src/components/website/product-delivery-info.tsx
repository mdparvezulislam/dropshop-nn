import * as React from "react";
import { Truck, ShieldCheck, Clock, Sparkles, MapPin, CheckCircle2 } from "lucide-react";

interface ProductDeliveryInfoProps {
  notice?: string;
  warehouseLocation?: string;
}

export function ProductDeliveryInfo({ notice, warehouseLocation }: ProductDeliveryInfoProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 my-4">
      {/* High Visibility Product Notice */}
      {notice && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Delivery Time Estimate */}
        <div className="flex items-start space-x-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
          <div className="p-1.5 bg-red-50 text-red-600 rounded-lg shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block">ডেলিভারি চার্জ ও সময়</span>
            <span className="text-slate-500 block text-[11px] mt-0.5">
              ঢাকার ভিতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন
            </span>
          </div>
        </div>

        {/* COD & Payment Guarantee */}
        <div className="flex items-start space-x-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block">ক্যাশ অন ডেলিভারি (COD)</span>
            <span className="text-slate-500 block text-[11px] mt-0.5">
              পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা
            </span>
          </div>
        </div>
      </div>

      {/* Courier Partners List */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
        <span className="flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
          <span>অফিশিয়াল কুরিয়ার পার্টনার: Pathao & Steadfast</span>
        </span>
        {warehouseLocation && (
          <span className="flex items-center space-x-1 text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>{warehouseLocation}</span>
          </span>
        )}
      </div>
    </div>
  );
}
