import { FaqLegacyPage } from "@/components/faq/faq-legacy-page";
import { FaqCmsPage } from "@/components/faq/faq-cms-page";
import { mergedFaqItems } from "@/lib/intelligence/faq";
import { getCmsSeoForSlug, getPageForRenderOnRoute } from "@/lib/website/cms-loader";
import { buildFaqPageMetadata } from "@/lib/website/faq-metadata";

const conversationalFaqItems = [
  {
    question: "How can I get an Australian partner visa if we are not married yet?",
    answer:
      "You may still qualify as de facto partners if you can show evidence of a genuine and continuing relationship. You usually need documents across financial, social, and household categories, plus timeline consistency.",
  },
  {
    question: "How long does a skilled visa usually take after I lodge?",
    answer:
      "Processing timelines vary by visa subclass, case complexity, and policy settings. MinRosh uses official Home Affairs updates as the baseline and then maps likely timing risks from your profile.",
  },
  {
    question: "Can I move from student visa to permanent residency in Australia?",
    answer:
      "Some students later move into skilled, employer-sponsored, or partner pathways. The best route depends on your occupation, location strategy, English profile, and evidence readiness.",
  },
];

export async function generateMetadata() {
  const cmsSeo = getCmsSeoForSlug("/faq");
  return buildFaqPageMetadata(cmsSeo);
}

export default async function FAQPage() {
  const faqItems = [...mergedFaqItems(), ...conversationalFaqItems];
  const cmsContent = await getPageForRenderOnRoute("/faq");
  if (cmsContent?.sections?.length) {
    return <FaqCmsPage content={cmsContent} faqItems={faqItems} />;
  }
  return <FaqLegacyPage />;
}
