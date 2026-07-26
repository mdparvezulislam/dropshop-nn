"use client";

import * as React from "react";
import { Building2, Layers, CheckCircle2, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WholesaleQuotationSectionProps {
  productName: string;
  wholesalePrice: number;
  moq?: number;
}

export function WholesaleQuotationSection({
  productName,
  wholesalePrice,
  moq = 10,
}: WholesaleQuotationSectionProps) {
  const [requested, setRequested] = React.useState(false);
  const [quantity, setQuantity] = React.useState(moq);

  const tier1Price = wholesalePrice;
  const tier2Price = Math.round(wholesalePrice * 0.95);
  const tier3Price = Math.round(wholesalePrice * 0.9);

  const handleRequestQuotation = () => {
    setRequested(true);
    toast.success(`B2B Quotation request submitted for ${quantity} units of ${productName}!`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-4 my-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
              <span>B2B Wholesale Tier Pricing (পাইকারি রেট)</span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-black uppercase">
                MOQ: {moq} Units
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Direct factory bulk prices for registered B2B buyers
            </p>
          </div>
        </div>
      </div>

      {/* Tiered Bulk Price Table */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">
            {moq}-49 Units
          </span>
          <span className="text-base font-black text-emerald-400 mt-1 block">
            ৳{tier1Price.toLocaleString("en-BD")}
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">50-99 Units</span>
          <span className="text-base font-black text-emerald-400 mt-1 block">
            ৳{tier2Price.toLocaleString("en-BD")}
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block">100+ Units</span>
          <span className="text-base font-black text-emerald-400 mt-1 block">
            ৳{tier3Price.toLocaleString("en-BD")}
          </span>
        </div>
      </div>

      {/* Request Quotation CTA */}
      <div className="flex items-center space-x-3 pt-2">
        <div className="w-32">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            পরিমাণ (Units)
          </label>
          <input
            type="number"
            min={moq}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(moq, parseInt(e.target.value) || moq))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-extrabold text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <Button
          type="button"
          disabled={requested}
          onClick={handleRequestQuotation}
          className="flex-1 mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/20"
        >
          {requested ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Quotation Requested (কোটেশন জমা হয়েছে)</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-1.5" />
              <span>Request Official Quotation (অফিশিয়াল কোটেশন পান)</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
