"use client";

import { useMemo, useState } from "react";

/** Planning scenario figures — always confirm against current Home Affairs / nomination settings. */
const CSIT_MIN = 79_499;
const SSIT_MIN = 146_717;

/** Illustrative mid-2026 planning rate for orientation only (not FX advice). */
const LKR_PER_AUD = 205;

function formatLkr(n) {
  if (!Number.isFinite(n)) return "";
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
}

export function TsmitSalaryCheck() {
  const [salary, setSalary] = useState("");
  const [stream, setStream] = useState("csit");
  const [currency, setCurrency] = useState("aud");

  const parsedAud = useMemo(() => {
    const n = Number(String(salary).replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [salary]);

  const threshold = stream === "ssit" ? SSIT_MIN : CSIT_MIN;
  const meets = parsedAud != null && parsedAud >= threshold;
  const shortfall = parsedAud != null && parsedAud < threshold ? threshold - parsedAud : 0;

  const salaryLkr = parsedAud != null ? parsedAud * LKR_PER_AUD : null;
  const shortfallLkr = shortfall * LKR_PER_AUD;

  return (
    <section className="tsmit-tool bento-hover" aria-labelledby="tsmit-tool-title">
      <p className="section-label">Planning tool</p>
      <h2 id="tsmit-tool-title" className="tsmit-tool__title">
        Employer-sponsored salary check (July 2026 scenario)
      </h2>
      <p className="tsmit-tool__lede">
        Compare a gross annual salary offer against <strong>illustrative</strong> July 2026 indexed floors used
        for Skills in Demand planning: <strong>Core Skills (CSIT) ${CSIT_MIN.toLocaleString("en-AU")}</strong> and{" "}
        <strong>Specialist Skills (SSIT) ${SSIT_MIN.toLocaleString("en-AU")}</strong>. These are for orientation
        only — confirm the threshold, exemptions, and stream that apply to your nomination on the Department of
        Home Affairs website.
      </p>
      <fieldset className="tsmit-tool__currency-toggle">
        <legend className="sr-only">Display currency</legend>
        <label className="tsmit-tool__radio">
          <input
            type="radio"
            name="tsmit-currency"
            checked={currency === "aud"}
            onChange={() => setCurrency("aud")}
          />
          Show results in AUD
        </label>
        <label className="tsmit-tool__radio">
          <input
            type="radio"
            name="tsmit-currency"
            checked={currency === "lkr"}
            onChange={() => setCurrency("lkr")}
          />
          Also show illustrative LKR (≈ {LKR_PER_AUD} LKR / AUD)
        </label>
      </fieldset>
      <div className="tsmit-tool__grid">
        <label className="tsmit-tool__field">
          <span>Gross annual salary (AUD)</span>
          <input
            type="text"
            inputMode="decimal"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. 95000"
            autoComplete="off"
          />
        </label>
        <fieldset className="tsmit-tool__field">
          <legend>Stream (planning)</legend>
          <label className="tsmit-tool__radio">
            <input
              type="radio"
              name="tsmit-stream"
              checked={stream === "csit"}
              onChange={() => setStream("csit")}
            />
            Core Skills (CSIT) — ${CSIT_MIN.toLocaleString("en-AU")}
            {currency === "lkr" ? (
              <span className="tsmit-tool__lkr"> ({formatLkr(CSIT_MIN * LKR_PER_AUD)})</span>
            ) : null}
          </label>
          <label className="tsmit-tool__radio">
            <input
              type="radio"
              name="tsmit-stream"
              checked={stream === "ssit"}
              onChange={() => setStream("ssit")}
            />
            Specialist Skills (SSIT) — ${SSIT_MIN.toLocaleString("en-AU")}
            {currency === "lkr" ? (
              <span className="tsmit-tool__lkr"> ({formatLkr(SSIT_MIN * LKR_PER_AUD)})</span>
            ) : null}
          </label>
        </fieldset>
      </div>
      {parsedAud != null ? (
        <p
          className={`tsmit-tool__result ${meets ? "tsmit-tool__result--ok" : "tsmit-tool__result--warn"}`}
          role="status"
        >
          {meets ? (
            <>
              At <strong>${parsedAud.toLocaleString("en-AU")}</strong>
              {currency === "lkr" && salaryLkr != null ? (
                <>
                  {" "}
                  (<strong>{formatLkr(salaryLkr)}</strong>)
                </>
              ) : null}
              , this meets the <strong>{stream.toUpperCase()}</strong> illustrative floor for this calculator.
            </>
          ) : (
            <>
              At <strong>${parsedAud.toLocaleString("en-AU")}</strong>
              {currency === "lkr" && salaryLkr != null ? (
                <>
                  {" "}
                  (<strong>{formatLkr(salaryLkr)}</strong>)
                </>
              ) : null}
              , this is <strong>${shortfall.toLocaleString("en-AU")}</strong>
              {currency === "lkr" ? (
                <>
                  {" "}
                  (<strong>{formatLkr(shortfallLkr)}</strong>)
                </>
              ) : null}{" "}
              below the illustrative <strong>{stream.toUpperCase()}</strong> floor — revisit offer terms or stream fit
              before relying on sponsorship.
            </>
          )}
        </p>
      ) : (
        <p className="tsmit-tool__hint">Enter a salary amount to compare.</p>
      )}
      {currency === "lkr" ? (
        <p className="tsmit-tool__fx-note" role="note">
          LKR figures use a fixed illustrative rate for planning conversations only — not live foreign exchange.
        </p>
      ) : null}
    </section>
  );
}
