import { SITE_NAME, SITE_URL } from "@/config/site";

/**
 * Organization / WebSite / OnlineStore structured data. Every URL derives
 * from SITE_URL — no hardcoded domains. Contact number is the real one from
 * the contact page.
 */
export function StorefrontJsonLd(): React.ReactElement {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: "Dropshipping and wholesale product supply platform in Bangladesh",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dhaka",
          addressCountry: "BD",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+8801410777606",
          contactType: "customer service",
          areaServed: "BD",
          availableLanguage: ["English", "Bengali"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "OnlineStore",
        "@id": `${SITE_URL}/#store`,
        name: `${SITE_NAME} Storefront`,
        url: SITE_URL,
        description:
          "Gadgets, mobile accessories, smart electronics, and home utilities at wholesale and retail rates across Bangladesh.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default StorefrontJsonLd;
