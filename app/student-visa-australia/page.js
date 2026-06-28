import { StudentVisaAustraliaLegacyPage } from "@/components/student-visa-australia/student-visa-australia-legacy-page";
import { StudentVisaAustraliaCmsPage } from "@/components/student-visa-australia/student-visa-australia-cms-page";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildStudentVisaAustraliaPageMetadata } from "@/lib/website/student-visa-australia-metadata";

export async function generateMetadata() {
  const cmsSeo = getCmsSeoForSlug("/student-visa-australia");
  return buildStudentVisaAustraliaPageMetadata(cmsSeo);
}

export default async function StudentVisaAustraliaPage() {
  const cmsContent = await getPageForRenderOnRoute("/student-visa-australia");
  if (cmsContent?.sections?.length) {
    return <StudentVisaAustraliaCmsPage content={cmsContent} />;
  }
  return <StudentVisaAustraliaLegacyPage />;
}
