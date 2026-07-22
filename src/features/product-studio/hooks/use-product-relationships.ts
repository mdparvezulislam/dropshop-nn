import * as React from "react";
import type { ProductRelationship } from "../types/studio-types";

export function useProductRelationships(
  categoryName?: string,
  brandName?: string,
): {
  suggestedItems: ProductRelationship[];
} {
  const suggestedItems: ProductRelationship[] = React.useMemo(() => {
    return [
      {
        id: "rel-1",
        targetProductId: "p-acc-01",
        targetProductName: "MagSafe Fast Wireless Charger 15W",
        targetProductSku: "ACC-MAGSAFE-15W",
        targetProductPrice: 1500,
        type: "accessory",
      },
      {
        id: "rel-2",
        targetProductId: "p-acc-02",
        targetProductName: "Silicone Protective Bumper Case",
        targetProductSku: "ACC-CASE-SILICONE",
        targetProductPrice: 650,
        type: "cross_sell",
      },
      {
        id: "rel-3",
        targetProductId: "p-up-01",
        targetProductName: "Pro Max Ultra Edition (512GB Upgrade)",
        targetProductSku: "UP-PROMAX-512GB",
        targetProductPrice: 3500,
        type: "upsell",
      },
    ];
  }, [categoryName, brandName]);

  return { suggestedItems };
}
