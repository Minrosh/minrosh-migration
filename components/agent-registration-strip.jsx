"use client";

import { DEFAULT_COMPLIANCE } from "@/lib/compliance";

/**
 * Referral strip: points users to the official Register of Migration Agents.
 * Never claims MinRosh is registered or displays a MARN placeholder.
 */
export function AgentRegistrationStrip({ brand, variant = "default", compliance }) {
  if (!brand) return null;
  const cfg = { ...DEFAULT_COMPLIANCE, ...(compliance || {}) };
  const registerSearchUrl =
    brand.migrationAgentsRegisterSearchUrl ||
    cfg.authorisedProfessionalReferralUrl ||
    "https://www.mara.gov.au/search-the-register-of-migration-agents/";

  return (
    <aside
      className={`agent-registration-strip ${variant === "compact" ? "agent-registration-strip--compact" : ""}`.trim()}
      aria-label="Authorised professional referral"
    >
      <p className="agent-registration-strip__lead">
        <strong>{brand.name}</strong>
        <span className="agent-registration-strip__pending">
          {" "}
          provides general information and education support only — not immigration assistance. For
          personalised visa advice or application help,{" "}
          <a
            className="agent-registration-strip__register-link"
            href={registerSearchUrl}
            target="_blank"
            rel="noreferrer"
          >
            {cfg.authorisedProfessionalReferralLabel || "Find a Registered Migration Agent"}
          </a>
          .
        </span>
      </p>
    </aside>
  );
}
