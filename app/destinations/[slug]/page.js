import { notFound } from "next/navigation";
import destinations from "../../../data/destinations.json";
import { DestinationHubLegacyPage } from "../../../components/destinations/destination-hub-legacy-page";
import { DestinationHubCmsPage } from "../../../components/destinations/destination-hub-cms-page";
import { buildMetadata } from "../../../lib/seo";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildDestinationHubMetadata } from "@/lib/website/destination-hub-metadata";

export function generateStaticParams() {
  return Object.keys(destinations).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = destinations[slug];
  if (!page) return {};
  const path = `/destinations/${slug}`;
  const cmsSeo = getCmsSeoForSlug(path);
  if (cmsSeo) return buildDestinationHubMetadata(page, cmsSeo, path);
  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path,
    keywords: [page.name, "migration", "visa guidance", `${page.name} visa information`],
  });
}

export default async function DestinationPage({ params }) {
  const { slug } = await params;
  if (!destinations[slug]) notFound();

  const path = `/destinations/${slug}`;
  const cmsContent = await getPageForRenderOnRoute(path);
  if (cmsContent?.sections?.length) {
    return <DestinationHubCmsPage slug={slug} content={cmsContent} />;
  }
  return <DestinationHubLegacyPage slug={slug} />;
}
