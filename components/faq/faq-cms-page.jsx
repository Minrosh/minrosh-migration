import siteData from "@/data/site.json";
import seoPages from "@/data/seo-pages.json";
import { SiteShell } from "@/components/site-shell";
import { StructuredData } from "@/components/structured-data";
import { BreadcrumbsNav } from "@/components/breadcrumbs-nav";
import { breadcrumbJsonLd, faqJsonLd, webPageSpeakableJsonLd } from "@/lib/seo";
import { PageRenderer } from "@/components/website-blocks/page-renderer";

const pageData = seoPages.servicePages.faqHub;

/**
 * Published CMS content for /faq (Sprint 3f).
 * Breadcrumb + FAQ + speakable JSON-LD preserved from merged FAQ items.
 * @param {{
 *   content: { sections: unknown[], pageTitle?: string, isDraftPreview?: boolean },
 *   faqItems: Array<{ question: string, answer: string }>,
 * }} props
 */
export function FaqCmsPage({ content, faqItems = [] }) {
  const sections = Array.isArray(content?.sections) ? content.sections : [];
  const schemaFaq = faqItems.length ? faqItems : pageData.faq;

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: pageData.title, path: pageData.path },
          ]),
          faqJsonLd(schemaFaq),
          webPageSpeakableJsonLd({
            path: pageData.path,
            title: pageData.metaTitle,
            description: pageData.speakableDescription,
          }),
        ]}
      />
      <div className="guide-premium-shell relative min-w-0 bg-[var(--brand-cream)] pb-16 pt-8 md:pt-12">
        <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
          <article className="content-page content-page--premium-guide">
            <BreadcrumbsNav
              currentPath={pageData.path}
              items={[
                { label: "Home", href: "/" },
                { label: pageData.title, href: pageData.path },
              ]}
            />
            {content?.isDraftPreview ? (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Draft preview — not visible to visitors without draft mode.
              </p>
            ) : null}
            <div className="space-y-8">
              <PageRenderer sections={sections} />
            </div>
          </article>
        </div>
      </div>
    </SiteShell>
  );
}
