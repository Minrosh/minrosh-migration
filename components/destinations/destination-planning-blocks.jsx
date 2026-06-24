import Link from "next/link";
import { TrackedLink } from "../tracked-link";

/**
 * @param {{ destinationName: string, blocks: Array<{ id: string, title: string, body: string, bullets?: string[] }> }} props
 */
export function DestinationPlanningBlocks({ destinationName, blocks = [] }) {
  if (!blocks.length) return null;

  return (
    <section className="content-section mt-10 min-w-0 overflow-x-clip" aria-labelledby="destination-planning-heading">
      <h2 id="destination-planning-heading" className="text-2xl font-bold text-brand-plum">
        Planning overview — {destinationName}
      </h2>
      <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-brand-plum/75">
        Indicative planning notes only. Rules, fees and processing change—confirm with official sources before you lodge.
      </p>

      <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-2">
        {blocks.map((block) => (
          <article
            key={block.id}
            className="min-w-0 rounded-2xl border border-brand-plum/10 bg-white/80 p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-brand-plum">{block.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-plum/75">{block.body}</p>
            {block.bullets?.length ? (
              <ul className="feature-list mt-4 text-sm text-brand-plum/80">
                {block.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-10 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TrackedLink
          href="/assessment"
          eventName="country_page_cta_clicked"
          eventParams={{ cta_id: "destination_pathway_check", cta_location: "destination_planning", destination: "/assessment" }}
          className="btn btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-6"
        >
          Start free pathway check
        </TrackedLink>
        <TrackedLink
          href="/book-consultation"
          eventName="consultation_booking_clicked"
          eventParams={{ cta_id: "destination_book_consult", cta_location: "destination_planning", destination: "/book-consultation" }}
          className="btn btn-ghost inline-flex min-h-[48px] items-center justify-center rounded-full px-6"
        >
          Book consultation
        </TrackedLink>
        <Link
          href="/tools/student-country-cost-planner"
          className="btn btn-ghost inline-flex min-h-[48px] items-center justify-center rounded-full px-6"
        >
          Student cost planner
        </Link>
      </div>
    </section>
  );
}
