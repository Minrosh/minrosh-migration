import { ContactLegacyPage } from "@/components/contact/contact-legacy-page";
import { ContactCmsPage } from "@/components/contact/contact-cms-page";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildContactPageMetadata } from "@/lib/website/contact-metadata";

export async function generateMetadata() {
  const cmsSeo = getCmsSeoForSlug("/contact");
  return buildContactPageMetadata(cmsSeo);
}

export default async function ContactPage() {
  const cmsContent = await getPageForRenderOnRoute("/contact");
  if (cmsContent?.sections?.length) {
    return <ContactCmsPage content={cmsContent} />;
  }
  return <ContactLegacyPage />;
}
