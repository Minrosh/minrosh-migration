import { SkilledMigrationLegacyPage } from "@/components/skilled-migration/skilled-migration-legacy-page";
import { SkilledMigrationCmsPage } from "@/components/skilled-migration/skilled-migration-cms-page";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildSkilledMigrationPageMetadata } from "@/lib/website/skilled-migration-metadata";

export async function generateMetadata() {
  const cmsSeo = getCmsSeoForSlug("/skilled-migration");
  return buildSkilledMigrationPageMetadata(cmsSeo);
}

export default async function SkilledMigrationPage() {
  const cmsContent = await getPageForRenderOnRoute("/skilled-migration");
  if (cmsContent?.sections?.length) {
    return <SkilledMigrationCmsPage content={cmsContent} />;
  }
  return <SkilledMigrationLegacyPage />;
}
