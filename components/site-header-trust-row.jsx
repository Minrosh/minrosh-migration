import Link from "next/link";

/**
 * Desktop-only trust strip under the main header row (registration + security signals).
 */
export function SiteHeaderTrustRow({ brand }) {
  if (!brand) return null;
  const registerSearchUrl =
    brand.migrationAgentsRegisterSearchUrl || "https://www.mara.gov.au/search-the-register-of-migration-agents/";

  return (
    <div className="site-header-trust-row" role="region" aria-label="Trust and security">
      <p className="site-header-trust-row__text">
        <span className="site-header-trust-row__item">
          <strong>Registered migration guidance</strong>
          {" — "}
          <a href={registerSearchUrl} target="_blank" rel="noreferrer">
            Verify on the OMARA register
          </a>
        </span>
        <span className="site-header-trust-row__sep" aria-hidden="true">
          ·
        </span>
        <span className="site-header-trust-row__item">Forms use HTTPS in transit</span>
        <span className="site-header-trust-row__sep" aria-hidden="true">
          ·
        </span>
        <Link href="/privacy-policy" className="site-header-trust-row__link">
          Privacy policy
        </Link>
      </p>
    </div>
  );
}
