import * as React from "react";
import type { GoogleMerchantData } from "../types/studio-types";

export function useGoogleMerchant(
  name: string,
  sku: string,
  barcode?: string,
  brandName?: string,
  categoryName?: string,
  stock = 10,
): {
  merchantData: GoogleMerchantData;
  warnings: string[];
  generateXmlFeed: () => string;
  generateJsonLd: () => string;
} {
  const merchantData: GoogleMerchantData = React.useMemo(() => {
    return {
      gtin: barcode || `880${Date.now()}`.substring(0, 13),
      mpn: sku || `MPN-${Date.now()}`,
      condition: "new",
      availability: stock > 0 ? "in_stock" : "out_of_stock",
      googleCategory: categoryName ? `Electronics > ${categoryName}` : "Electronics > Communications",
      ageGroup: "adult",
      gender: "unisex",
      shippingWeight: "0.5 kg",
    };
  }, [barcode, sku, categoryName, stock]);

  const warnings = React.useMemo(() => {
    const list: string[] = [];
    if (!barcode) list.push("GTIN / Barcode is missing (Required for Google Shopping).");
    if (!sku) list.push("MPN / SKU is missing (Required for Google Shopping).");
    if (!brandName) list.push("Brand manufacturer is missing.");
    return list;
  }, [barcode, sku, brandName]);

  const generateXmlFeed = React.useCallback(() => {
    return `<item>
  <g:id>${sku}</g:id>
  <g:title>${name || "Product"}</g:title>
  <g:brand>${brandName || "Generic"}</g:brand>
  <g:gtin>${merchantData.gtin}</g:gtin>
  <g:mpn>${merchantData.mpn}</g:mpn>
  <g:condition>${merchantData.condition}</g:condition>
  <g:availability>${merchantData.availability}</g:availability>
  <g:google_product_category>${merchantData.googleCategory}</g:google_product_category>
</item>`;
  }, [sku, name, brandName, merchantData]);

  const generateJsonLd = React.useCallback(() => {
    return JSON.stringify(
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: name || "Product Name",
        image: [],
        description: name,
        sku: sku,
        mpn: merchantData.mpn,
        gtin13: merchantData.gtin,
        brand: {
          "@type": "Brand",
          name: brandName || "Generic",
        },
        offers: {
          "@type": "Offer",
          url: `https://dropshop.nn/products/${sku}`,
          priceCurrency: "BDT",
          price: 1200,
          itemCondition: "https://schema.org/NewCondition",
          availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
      null,
      2,
    );
  }, [name, sku, merchantData, brandName, stock]);

  return {
    merchantData,
    warnings,
    generateXmlFeed,
    generateJsonLd,
  };
}
