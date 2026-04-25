import { sameAsUrlsForSchema } from "./social-public";

const SITE_URL = "https://minroshmigration.com.au";

const DEFAULT_OG_IMAGE = "/images/hero-sydney-real.jpg";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image = DEFAULT_OG_IMAGE,
}) {
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
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
      images: [
        {
          url: imageUrl,
          width: 1800,
          height: 1200,
          alt: "MinRosh Migration",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function businessJsonLd(siteData) {
  const marn = String(siteData?.brand?.marn || "").trim();
  const extra = {};
  if (marn) {
    extra.identifier = marn;
    extra.description = `${siteData.brand.tagline || ""} MARN ${marn}.`.trim();
  }
  const sameAs = sameAsUrlsForSchema(siteData.brand);
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": absoluteUrl("/#business"),
    name: siteData.brand.name,
    url: SITE_URL,
    telephone: siteData.brand.phone,
    ...extra,
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
    ...(sameAs.length ? { sameAs } : {}),
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
