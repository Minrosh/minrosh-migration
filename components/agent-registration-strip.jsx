"use client";

/**
 * MARN + statutory links for contact and booking surfaces (consumer transparency).
 */
export function AgentRegistrationStrip({ brand, variant = "default" }) {
  if (!brand) return null;
  const marn = String(
    brand.marn || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_MARN : "") || ""
  ).trim();
  const registerSearchUrl =
    brand.migrationAgentsRegisterSearchUrl || "https://www.mara.gov.au/search-the-register-of-migration-agents/";

  return (
    <aside
      className={`agent-registration-strip ${variant === "compact" ? "agent-registration-strip--compact" : ""}`.trim()}
      aria-label="Registered migration agent details"
    >
      <p className="agent-registration-strip__lead">
        <strong>{brand.name}</strong>
        {!marn ? (
          <span className="agent-registration-strip__pending">
            {" "}
            · Registered with OMARA —{" "}
            <a className="agent-registration-strip__register-link" href={registerSearchUrl} target="_blank" rel="noreferrer">
              search the register
            </a>{" "}
            to confirm details
          </span>
        ) : null}
      </p>
    </aside>
  );
}
