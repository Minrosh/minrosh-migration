"use client";

/**
 * MARN + statutory links for contact and booking surfaces (consumer transparency).
 */
export function AgentRegistrationStrip({ brand, variant = "default" }) {
  if (!brand) return null;
  const marn = String(
    brand.marn || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_MARN : "") || ""
  ).trim();
  const regsUrl =
    brand.migrationAgentsRegulations2026Url || "https://www.legislation.gov.au/F2026L00118/latest";
  const conductUrl = brand.omaraCodeOfConductUrl || "https://www.mara.gov.au/tools-for-agents/legislation/code-of-conduct";
  const omaraUrl = brand.omaraRegisterUrl || "https://www.mara.gov.au/";
  const registerSearchUrl =
    brand.migrationAgentsRegisterSearchUrl || "https://www.mara.gov.au/search-the-register-of-migration-agents/";

  return (
    <aside
      className={`agent-registration-strip ${variant === "compact" ? "agent-registration-strip--compact" : ""}`.trim()}
      aria-label="Registered migration agent details"
    >
      <p className="agent-registration-strip__lead">
        <strong>{brand.name}</strong>
        {marn ? (
          <>
            {" "}
            · <span className="agent-registration-strip__marn">MARN {marn}</span>
          </>
        ) : (
          <span className="agent-registration-strip__pending">
            {" "}
            · Registered with OMARA —{" "}
            <a className="agent-registration-strip__register-link" href={registerSearchUrl} target="_blank" rel="noreferrer">
              search the register
            </a>{" "}
            to confirm details
          </span>
        )}
      </p>
      <p className="agent-registration-strip__links">
        <a href={regsUrl} target="_blank" rel="noreferrer">
          Migration Agents Regulations 2026
        </a>
        {" · "}
        <a href={conductUrl} target="_blank" rel="noreferrer">
          OMARA Code of Conduct
        </a>
        {" · "}
        <a href={omaraUrl} target="_blank" rel="noreferrer">
          OMARA register
        </a>
      </p>
    </aside>
  );
}
