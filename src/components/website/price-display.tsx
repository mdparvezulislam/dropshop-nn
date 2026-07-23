"use client";

import { cn } from "@/lib/utils/cn";
import { usePermissions } from "@/hooks/use-permissions";

export interface PriceDisplayProps {
  retailPrice: number; // in poisha or BDT
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
  resellerPrice,
  wholesalePrice,
  costPrice,
  comparePrice,
  currency = "BDT",
  showLabel = true,
  className,
}: PriceDisplayProps) {
  const { userRole } = usePermissions();
  const symbol = currency === "BDT" ? "৳" : "$";

  // Normalize poisha to BDT if > 10000
  const normalizedRetail = retailPrice > 10000 ? retailPrice / 100 : retailPrice;
  const normalizedCompare = comparePrice && comparePrice > 10000 ? comparePrice / 100 : comparePrice;
  const normalizedReseller = resellerPrice && resellerPrice > 10000 ? resellerPrice / 100 : resellerPrice;
  const normalizedWholesale = wholesalePrice && wholesalePrice > 10000 ? wholesalePrice / 100 : wholesalePrice;
  const normalizedCost = costPrice && costPrice > 10000 ? costPrice / 100 : costPrice;

  const hasDiscount = normalizedCompare != null && normalizedCompare > normalizedRetail;
  const discountPercent = hasDiscount
    ? Math.round(((normalizedCompare - normalizedRetail) / normalizedCompare) * 100)
    : 0;

  const formatPrice = (price: number) =>
    `${symbol}${price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

  const renderPrice = (label: string, price: number, isCurrent = false) => (
    <div className={cn("flex items-center justify-between gap-2", isCurrent && "font-black")}>
      {showLabel && <span className="text-xs text-slate-500 font-bold">{label}</span>}
      <span className={cn("tabular-nums", isCurrent ? "text-slate-900 font-black text-sm sm:text-base" : "text-slate-600 font-bold text-xs")}>
        {formatPrice(price)}
      </span>
    </div>
  );

  if (userRole === "admin" || userRole === "super_admin") {
    return (
      <div className={cn("space-y-1", className)}>
        {normalizedCost != null && renderPrice("Cost", normalizedCost)}
        {renderPrice("Retail", normalizedRetail, true)}
        {normalizedReseller != null && renderPrice("Reseller", normalizedReseller)}
        {normalizedWholesale != null && renderPrice("Wholesale", normalizedWholesale)}
        {hasDiscount && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold">
            <span className="font-black">-{discountPercent}%</span>
            <span className="line-through text-slate-400">{formatPrice(normalizedCompare!)}</span>
          </div>
        )}
      </div>
    );
  }

  if (userRole === "reseller" && normalizedReseller != null) {
    return (
      <div className={cn("space-y-1", className)}>
        {renderPrice("Your Price", normalizedReseller, true)}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <span className="line-through text-slate-400">{formatPrice(normalizedRetail)}</span>
          <span className="text-emerald-700 font-extrabold">Save {formatPrice(normalizedRetail - normalizedReseller)}</span>
        </div>
        {hasDiscount && discountPercent > 0 && (
          <span className="inline-block text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
      </div>
    );
  }

  if (userRole === "wholesaler" && normalizedWholesale != null) {
    return (
      <div className={cn("space-y-1", className)}>
        {renderPrice("Wholesale", normalizedWholesale, true)}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <span className="line-through text-slate-400">{formatPrice(normalizedRetail)}</span>
          <span className="text-emerald-700 font-extrabold">Wholesale discount applied</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
          {formatPrice(normalizedRetail)}
        </span>
        {hasDiscount && (
          <span className="text-xs font-bold line-through text-slate-400 tabular-nums">
            {formatPrice(normalizedCompare!)}
          </span>
        )}
      </div>
    </div>
  );
}

export default PriceDisplay;
