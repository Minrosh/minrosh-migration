import { AboutLegacyPage } from "@/components/about/about-legacy-page";
import { AboutCmsPage } from "@/components/about/about-cms-page";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildAboutPageMetadata } from "@/lib/website/about-metadata";

export async function generateMetadata() {
  const cmsSeo = getCmsSeoForSlug("/about");
  return buildAboutPageMetadata(cmsSeo);
}

export default async function AboutPage() {
  const cmsContent = await getPageForRenderOnRoute("/about");
  if (cmsContent?.sections?.length) {
    return <AboutCmsPage content={cmsContent} />;
  }
  return <AboutLegacyPage />;
}
