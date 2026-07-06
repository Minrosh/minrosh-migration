/**
 * Website CMS block types and plain-text field validation (no raw HTML).
 */

export const WEBSITE_BLOCK_TYPES = [
  "hero",
  "text",
  "serviceCards",
  "countryCards",
  "processSteps",
  "faq",
  "cta",
  "trustStats",
  "imageText",
  "testimonial",
];

const PLAIN_TEXT = /^[^<>]*$/;

function str(value, max = 8000) {
  return String(value ?? "").trim().slice(0, max);
}

function plainText(value, max = 8000, fieldName = "field") {
  const s = str(value, max);
  if (s && !PLAIN_TEXT.test(s)) {
    throw new Error(`${fieldName} must not contain HTML tags`);
  }
  return s;
}

function cta(value) {
  const text = plainText(value?.text, 120, "button text");
  const href = str(value?.href, 500);
  if (href && !href.startsWith("/") && !/^https?:\/\//i.test(href)) {
    throw new Error("button link must be a path or http(s) URL");
  }
  return { text, href };
}

function validateHero(props) {
  return {
    eyebrow: plainText(props?.eyebrow, 120, "eyebrow"),
    heading: plainText(props?.heading, 200, "heading"),
    subheading: plainText(props?.subheading, 500, "subheading"),
    image: str(props?.image, 500),
    imageAlt: plainText(props?.imageAlt, 200, "image alt"),
    primaryCta: cta(props?.primaryCta),
    secondaryCta: cta(props?.secondaryCta),
  };
}

function validateText(props) {
  const paragraphs = Array.isArray(props?.paragraphs) ? props.paragraphs : [];
  return {
    heading: plainText(props?.heading, 200, "heading"),
    paragraphs: paragraphs.slice(0, 20).map((p, i) => plainText(p, 4000, `paragraph ${i + 1}`)).filter(Boolean),
  };
}

function validateCards(props, cardKey) {
  const cards = Array.isArray(props?.[cardKey]) ? props[cardKey] : [];
  return {
    title: plainText(props?.title, 200, "title"),
    cards: cards.slice(0, 8).map((card, i) => ({
      title: plainText(card?.title, 120, `card ${i + 1} title`),
      body: plainText(card?.body, 800, `card ${i + 1} body`),
      href: str(card?.href, 500),
      icon: str(card?.icon, 40),
      country: plainText(card?.country, 80, `card ${i + 1} country`),
      image: str(card?.image, 500),
    })),
  };
}

function validateProcessSteps(props) {
  const steps = Array.isArray(props?.steps) ? props.steps : [];
  return {
    title: plainText(props?.title, 200, "title"),
    steps: steps.slice(0, 12).map((step, i) => ({
      title: plainText(step?.title, 120, `step ${i + 1} title`),
      body: plainText(step?.body, 800, `step ${i + 1} body`),
    })),
  };
}

function validateFaq(props) {
  const items = Array.isArray(props?.items) ? props.items : [];
  return {
    title: plainText(props?.title, 200, "title"),
    items: items.slice(0, 40).map((item, i) => ({
      question: plainText(item?.question, 300, `FAQ ${i + 1} question`),
      answer: plainText(item?.answer, 4000, `FAQ ${i + 1} answer`),
    })),
  };
}

function validateCta(props) {
  return {
    heading: plainText(props?.heading, 200, "heading"),
    body: plainText(props?.body, 800, "body"),
    button: cta(props?.button),
  };
}

function validateTrustStats(props) {
  const items = Array.isArray(props?.items) ? props.items : [];
  return {
    title: plainText(props?.title, 200, "title"),
    items: items.slice(0, 12).map((item, i) => ({
      label: plainText(item?.label, 120, `stat ${i + 1} label`),
      value: plainText(item?.value, 80, `stat ${i + 1} value`),
    })),
  };
}

function validateImageText(props) {
  const pos = str(props?.imagePosition, 20).toLowerCase();
  return {
    heading: plainText(props?.heading, 200, "heading"),
    body: plainText(props?.body, 4000, "body"),
    image: str(props?.image, 500),
    imageAlt: plainText(props?.imageAlt, 200, "image alt"),
    imagePosition: pos === "right" ? "right" : "left",
  };
}

function validateTestimonial(props) {
  const items = Array.isArray(props?.items) ? props.items : [];
  return {
    title: plainText(props?.title, 200, "title"),
    items: items.slice(0, 12).map((item, i) => ({
      quote: plainText(item?.quote, 800, `testimonial ${i + 1} quote`),
      name: plainText(item?.name, 120, `testimonial ${i + 1} name`),
      context: plainText(item?.context, 200, `testimonial ${i + 1} context`),
    })),
  };
}

const VALIDATORS = {
  hero: validateHero,
  text: validateText,
  serviceCards: (p) => validateCards(p, "cards"),
  countryCards: (p) => validateCards(p, "cards"),
  processSteps: validateProcessSteps,
  faq: validateFaq,
  cta: validateCta,
  trustStats: validateTrustStats,
  imageText: validateImageText,
  testimonial: validateTestimonial,
};

/**
 * @param {unknown} section
 * @returns {{ id: string, type: string, props: Record<string, unknown> }}
 */
export function validateWebsiteSection(section) {
  const type = str(section?.type, 40);
  if (!WEBSITE_BLOCK_TYPES.includes(type)) {
    throw new Error(`Unknown block type: ${type || "(empty)"}`);
  }
  const id = str(section?.id, 80) || `section-${type}-${Date.now()}`;
  const validator = VALIDATORS[type];
  return { id, type, props: validator(section?.props || {}) };
}

/**
 * @param {unknown[]} sections
 */
export function validateWebsiteSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.slice(0, 40).map((s) => validateWebsiteSection(s));
}

/**
 * @param {unknown} seo
 */
export function validatePageSeo(seo) {
  const s = seo && typeof seo === "object" ? seo : {};
  const keywords = Array.isArray(s.keywords) ? s.keywords : [];
  return {
    title: plainText(s.title, 120, "SEO title"),
    description: plainText(s.description, 320, "SEO description"),
    canonical: str(s.canonical, 500),
    ogTitle: plainText(s.ogTitle, 120, "OG title"),
    ogDescription: plainText(s.ogDescription, 320, "OG description"),
    ogImage: str(s.ogImage, 500),
    noindex: Boolean(s.noindex),
    keywords: keywords.slice(0, 30).map((k, i) => plainText(k, 80, `keyword ${i + 1}`)).filter(Boolean),
  };
}
