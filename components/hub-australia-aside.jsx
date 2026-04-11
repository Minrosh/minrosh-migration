import Link from "next/link";

/**
 * Educational aside for the Australia destination hub — official verification + deep guides.
 */
export function HubAustraliaAside() {
  return (
    <div className="content-aside-card bento-hover hub-aside" aria-labelledby="hub-aside-title">
      <p className="section-label">Verify requirements</p>
      <h3 id="hub-aside-title">Official sources first</h3>
      <p className="hub-aside__lede">
        Visa labels, charges, and eligibility change over time. Treat hub copy as orientation — confirm
        every decision on current government listings.
      </p>
      <ul className="hub-aside__list">
        <li>
          <a
            href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing"
            target="_blank"
            rel="noreferrer"
          >
            Department of Home Affairs — visa listing
          </a>
        </li>
        <li>
          <Link href="/australia-visa-processing-times-guide">Processing times guide</Link>
        </li>
        <li>
          <Link href="/australia-visa-document-checklist-guide">Document checklist guide</Link>
        </li>
        <li>
          <Link href="/tools">All client tools</Link>
        </li>
      </ul>
    </div>
  );
}
