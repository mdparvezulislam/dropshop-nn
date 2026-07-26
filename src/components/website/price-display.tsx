"use client";

import { cn } from "@/lib/utils/cn";

/**
 * All prices are BDT major units, resolved and role-gated SERVER-side.
 * This component renders exactly what it receives: tier prices are only
 * present in props when the server decided the viewer may see them.
 */
export interface PriceDisplayProps {
  retailPrice: number;
  /** Active promotional price (already validated < retailPrice server-side). */
  campaignPrice?: number;
  resellerPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  comparePrice?: number;
  currency?: string;
  showLabel?: boolean;
  className?: string;
}

export function PriceDisplay({
  retailPrice,
  campaignPrice,
  resellerPrice,
  wholesalePrice,
  costPrice,
  comparePrice,
  currency = "BDT",
  showLabel = true,
  className,
}: PriceDisplayProps) {
  const symbol = currency === "BDT" ? "৳" : currency;

  const currentPrice = campaignPrice ?? retailPrice;
  const strikePrice =
    campaignPrice !== undefined
      ? retailPrice
      : comparePrice !== undefined && comparePrice > retailPrice
        ? comparePrice
        : undefined;

  const hasDiscount = strikePrice !== undefined && strikePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((strikePrice - currentPrice) / strikePrice) * 100)
    : 0;

  const formatPrice = (price: number) =>
    `${symbol}${price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

  if (currentPrice <= 0) {
    return (
      <div className={cn("text-sm font-bold text-slate-500", className)}>
        দামের জন্য যোগাযোগ করুন
      </div>
    );
  }

  const renderRow = (label: string, price: number, isCurrent = false) => (
    <div className={cn("flex items-center justify-between gap-2", isCurrent && "font-black")}>
      {showLabel && <span className="text-xs text-slate-500 font-bold">{label}</span>}
      <span
        className={cn(
          "tabular-nums",
          isCurrent
            ? "text-slate-900 font-black text-sm sm:text-base"
            : "text-slate-600 font-bold text-xs",
        )}
      >
        {formatPrice(price)}
      </span>
    </div>
  );

  const hasTierRows =
    costPrice !== undefined || resellerPrice !== undefined || wholesalePrice !== undefined;

  if (hasTierRows) {
    return (
      <div className={cn("space-y-1", className)}>
        {costPrice !== undefined && renderRow("Cost", costPrice)}
        {renderRow("Retail", currentPrice, true)}
        {resellerPrice !== undefined && renderRow("Reseller", resellerPrice)}
        {wholesalePrice !== undefined && renderRow("Wholesale", wholesalePrice)}
        {hasDiscount && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold">
            <span className="font-black">-{discountPercent}%</span>
            <span className="line-through text-slate-400">{formatPrice(strikePrice)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
          {formatPrice(currentPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-xs font-bold line-through text-slate-400 tabular-nums">
              {formatPrice(strikePrice)}
            </span>
            <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default PriceDisplay;
