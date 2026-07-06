import "./home.css";
import { HomeLegacyPage } from "@/components/home/home-legacy-page";
import { HomeCmsPage } from "@/components/home/home-cms-page";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildHomePageMetadata } from "@/lib/website/home-metadata";

export async function generateMetadata() {
  const cmsSeo = getCmsSeoForSlug("/");
  return buildHomePageMetadata(cmsSeo);
}

export default async function HomePage() {
  const cmsContent = await getPageForRenderOnRoute("/");
  if (cmsContent?.sections?.length) {
    return <HomeCmsPage content={cmsContent} />;
  }
  return <HomeLegacyPage />;
}
