const SITE_URL = "https://minroshmigration.com.au";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}) {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "MinRosh Migration",
      locale: "en_AU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function businessJsonLd(siteData) {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": absoluteUrl("/#business"),
    name: siteData.brand.name,
    url: SITE_URL,
    email: siteData.brand.email,
    telephone: siteData.brand.phone,
    areaServed: [
      {
        "@type": "City",
        name: "Brisbane",
      },
      {
        "@type": "AdministrativeArea",
        name: "Queensland",
      },
      {
        "@type": "Country",
        name: "Australia",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brisbane",
      addressRegion: "QLD",
      addressCountry: "AU",
    },
    image: absoluteUrl("/images/brisbane-skyline.jpg"),
    logo: absoluteUrl("/images/minrosh-logo.png"),
    priceRange: "$$",
    sameAs: [`https://wa.me/${siteData.brand.whatsapp}`],
  };
}

export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd({ title, description, path, datePublished }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Organization",
      name: "MinRosh Migration",
    },
    publisher: {
      "@type": "Organization",
      name: "MinRosh Migration",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/minrosh-logo.png"),
      },
    },
    mainEntityOfPage: absoluteUrl(path),
    image: [absoluteUrl("/images/brisbane-skyline.jpg")],
  };
}
