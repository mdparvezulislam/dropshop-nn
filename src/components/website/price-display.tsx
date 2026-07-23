"use client";

import { cn } from "@/lib/utils/cn";
import { usePermissions } from "@/hooks/use-permissions";

export interface PriceDisplayProps {
  retailPrice: number;
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
  const hasDiscount = comparePrice && comparePrice > retailPrice;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - retailPrice) / comparePrice) * 100) : 0;

  const formatPrice = (price: number) =>
    `${symbol}${price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;

  const renderPrice = (label: string, price: number, isCurrent = false) => (
    <div className={cn("flex items-center justify-between gap-2", isCurrent && "font-semibold")}>
      {showLabel && <span className="text-xs text-foreground/50">{label}</span>}
      <span className={cn("tabular-nums", isCurrent ? "text-foreground" : "text-foreground/60")}>
        {formatPrice(price)}
      </span>
    </div>
  );

  if (userRole === "admin" || userRole === "super_admin") {
    return (
      <div className={cn("space-y-1", className)}>
        {costPrice != null && renderPrice("Cost", costPrice)}
        {renderPrice("Retail", retailPrice, true)}
        {resellerPrice != null && renderPrice("Reseller", resellerPrice)}
        {wholesalePrice != null && renderPrice("Wholesale", wholesalePrice)}
        {hasDiscount && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <span className="font-medium">-{discountPercent}%</span>
            <span className="line-through text-foreground/40">{formatPrice(comparePrice!)}</span>
          </div>
        )}
      </div>
    );
  }

  if (userRole === "reseller" && resellerPrice != null) {
    return (
      <div className={cn("space-y-1", className)}>
        {renderPrice("Your Price", resellerPrice, true)}
        <div className="flex items-center gap-1.5 text-xs text-foreground/40">
          <span className="line-through">{formatPrice(retailPrice)}</span>
          <span className="text-success">Save {formatPrice(retailPrice - resellerPrice)}</span>
        </div>
        {hasDiscount && discountPercent > 0 && (
          <span className="inline-block text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
      </div>
    );
  }

  if (userRole === "wholesaler" && wholesalePrice != null) {
    return (
      <div className={cn("space-y-1", className)}>
        {renderPrice("Wholesale", wholesalePrice, true)}
        <div className="flex items-center gap-1.5 text-xs text-foreground/40">
          <span className="line-through">{formatPrice(retailPrice)}</span>
          <span className="text-success">Wholesale discount applied</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {renderPrice("", retailPrice, true)}
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span className="text-xs line-through text-foreground/40">{formatPrice(comparePrice!)}</span>
          <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        </div>
      )}
    </div>
  );
}
