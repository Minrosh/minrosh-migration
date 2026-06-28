import siteData from "@/data/site.json";
import { SiteShell } from "@/components/site-shell";
import { StructuredData } from "@/components/structured-data";
import { BreadcrumbsNav } from "@/components/breadcrumbs-nav";
import { breadcrumbJsonLd } from "@/lib/seo";
import { PageRenderer } from "@/components/website-blocks/page-renderer";

/**
 * Published CMS content for /about (Sprint 3a).
 * @param {{ content: { sections: unknown[], pageTitle?: string, isDraftPreview?: boolean } }} props
 */
export function AboutCmsPage({ content }) {
  const sections = Array.isArray(content?.sections) ? content.sections : [];

  return (
    <SiteShell siteData={siteData} currentPath="/about">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <div className="about-team-premium-shell relative min-w-0 bg-[var(--brand-cream)] pb-16 pt-8 md:pt-12">
        <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
          <article className="content-page">
            <BreadcrumbsNav
              currentPath="/about"
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
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
