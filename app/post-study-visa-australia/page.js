import { PostStudyVisaAustraliaLegacyPage } from "@/components/post-study-visa-australia/post-study-visa-australia-legacy-page";
import { PostStudyVisaAustraliaCmsPage } from "@/components/post-study-visa-australia/post-study-visa-australia-cms-page";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildPostStudyVisaAustraliaPageMetadata } from "@/lib/website/post-study-visa-australia-metadata";

export async function generateMetadata() {
  const cmsSeo = getCmsSeoForSlug("/post-study-visa-australia");
  return buildPostStudyVisaAustraliaPageMetadata(cmsSeo);
}

export default async function PostStudyVisaAustraliaPage() {
  const cmsContent = await getPageForRenderOnRoute("/post-study-visa-australia");
  if (cmsContent?.sections?.length) {
    return <PostStudyVisaAustraliaCmsPage content={cmsContent} />;
  }
  return <PostStudyVisaAustraliaLegacyPage />;
}
