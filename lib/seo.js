import { sameAsUrlsForSchema } from "./social-public";

const SITE_URL = "https://minroshmigration.com.au";

const DEFAULT_OG_IMAGE = "/images/hero-brisbane-river-cbd.jpg";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

const BRAND_TITLE_SUFFIX = " | MinRosh Migration";

/**
 * Root layout appends “| MinRosh Migration”.
 * Drop a trailing full brand, and a trailing short “| MinRosh”, so the template adds the brand once.
 */
export function titleWithoutBrandSuffix(title) {
  return String(title || "")
    .replace(/\s*\|\s*MinRosh Migration\s*$/i, "")
    .replace(/\s*\|\s*MinRosh\s*$/i, "")
    .trim();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  /** @type {{ index?: boolean; follow?: boolean } | undefined} */
  robots,
}) {
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
  const rawTitle = String(title || "").trim();
  const documentTitle = titleWithoutBrandSuffix(rawTitle);
  const brandFirst = /^MinRosh Migration\s*\|/i.test(rawTitle);
  const endsWithFullBrand = /\|\s*MinRosh Migration\s*$/i.test(rawTitle);
  const containsFullBrand = /MinRosh Migration/i.test(rawTitle);
  /* A title that already leads with the brand, or already names the brand before a further clause, is complete. */
  const useAbsolute = brandFirst || (containsFullBrand && !endsWithFullBrand && rawTitle.includes("|"));
  const socialTitle = useAbsolute ? rawTitle : documentTitle ? `${documentTitle}${BRAND_TITLE_SUFFIX}` : rawTitle;
  const resolvedTitle = useAbsolute ? { absolute: rawTitle } : documentTitle;
  return {
    title: resolvedTitle,
    description,
    keywords,
    ...(robots ? { robots } : {}),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
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
          alt: "Brisbane River and CBD skyline — MinRosh Migration",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function businessJsonLd(siteData) {
  const sameAs = sameAsUrlsForSchema(siteData.brand);
  const description =
    siteData?.compliance?.businessStatusDisclosure ||
    siteData?.brand?.tagline ||
    "Independent migration information and education support using publicly available sources.";
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": absoluteUrl("/#business"),
    name: siteData.brand.name,
    description,
    url: SITE_URL,
    telephone: siteData.brand.phone,
    email: siteData.brand.email,
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
    image: absoluteUrl("/images/brisbane-skyline.v2.webp"),
    logo: absoluteUrl("/images/minrosh-logo.v2.webp"),
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
        url: absoluteUrl("/images/minrosh-logo.v2.webp"),
      },
    },
    mainEntityOfPage: absoluteUrl(path),
    image: [absoluteUrl("/images/brisbane-skyline.v2.webp")],
  };
}

export function webPageSpeakableJsonLd({
  path,
  title,
  description,
  speakableSelectors = [".content-hero h1", ".content-hero p", ".faq-card__summary h3"],
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl(`${path}#webpage`),
    url: absoluteUrl(path),
    name: title,
    description,
    inLanguage: "en-AU",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: speakableSelectors,
    },
  };
}
