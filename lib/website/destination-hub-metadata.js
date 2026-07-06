import { buildMetadata } from "@/lib/seo";

/** @param {{ metaTitle?: string, metaDescription?: string, name?: string }} page */
export function buildDestinationHubMetadata(page, cmsSeo, path) {
  const title = String(cmsSeo?.title || "").trim() || page.metaTitle;
  const description = String(cmsSeo?.description || "").trim() || page.metaDescription;
  const keywords =
    Array.isArray(cmsSeo?.keywords) && cmsSeo.keywords.length > 0
      ? cmsSeo.keywords
      : [page.name, "migration", "visa guidance", `${page.name} visa information`];
  const image = String(cmsSeo?.ogImage || "").trim() || undefined;
  const robots = cmsSeo?.noindex ? { index: false, follow: false } : undefined;

  const meta = buildMetadata({
    title,
    description,
    path,
    keywords,
    ...(image ? { image } : {}),
    ...(robots ? { robots } : {}),
  });

  if (cmsSeo?.ogTitle || cmsSeo?.ogDescription) {
    meta.openGraph = {
      ...meta.openGraph,
      ...(cmsSeo.ogTitle ? { title: cmsSeo.ogTitle } : {}),
      ...(cmsSeo.ogDescription ? { description: cmsSeo.ogDescription } : {}),
    };
    meta.twitter = {
      ...meta.twitter,
      ...(cmsSeo.ogTitle ? { title: cmsSeo.ogTitle } : {}),
      ...(cmsSeo.ogDescription ? { description: cmsSeo.ogDescription } : {}),
    };
  }

  return meta;
}
