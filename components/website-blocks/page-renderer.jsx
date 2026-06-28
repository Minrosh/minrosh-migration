import { HeroBlock } from "./hero-block";
import { TextBlock } from "./text-block";
import { ServiceCardsBlock, CountryCardsBlock } from "./cards-blocks";
import {
  ProcessStepsBlock,
  FAQBlock,
  CTASectionBlock,
  TrustStatsBlock,
  ImageTextBlock,
  TestimonialBlock,
} from "./content-blocks";

const BLOCK_MAP = {
  hero: HeroBlock,
  text: TextBlock,
  serviceCards: ServiceCardsBlock,
  countryCards: CountryCardsBlock,
  processSteps: ProcessStepsBlock,
  faq: FAQBlock,
  cta: CTASectionBlock,
  trustStats: TrustStatsBlock,
  imageText: ImageTextBlock,
  testimonial: TestimonialBlock,
};

/**
 * Renders validated CMS sections. Not wired to public routes in Sprint 1.
 * @param {{ sections?: { id: string, type: string, props: Record<string, unknown> }[] }} props
 */
export function PageRenderer({ sections = [] }) {
  if (!Array.isArray(sections) || sections.length === 0) return null;
  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const Component = BLOCK_MAP[section.type];
        if (!Component) return null;
        return <Component key={section.id} props={section.props} />;
      })}
    </div>
  );
}
