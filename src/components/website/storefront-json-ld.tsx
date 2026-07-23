export function StorefrontJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://dropshopnn.com/#organization",
        "name": "DropshopNN",
        "url": "https://dropshopnn.com",
        "logo": "https://dropshopnn.com/logo.png",
        "description": "Enterprise Commerce Operating System & Dropshipping Platform in Bangladesh",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Dhaka",
          "addressCountry": "BD"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+880-1700-000000",
          "contactType": "customer service",
          "areaServed": "BD",
          "availableLanguage": ["English", "Bengali"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://dropshopnn.com/#website",
        "url": "https://dropshopnn.com",
        "name": "DropshopNN Enterprise Commerce",
        "publisher": {
          "@id": "https://dropshopnn.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://dropshopnn.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "OnlineStore",
        "@id": "https://dropshopnn.com/#store",
        "name": "DropshopNN Official Storefront",
        "url": "https://dropshopnn.com",
        "description": "Source gadgets, mobile accessories, smart electronics, and home utilities at wholesale & retail rates across Bangladesh."
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default StorefrontJsonLd;
