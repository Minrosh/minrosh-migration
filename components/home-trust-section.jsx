"use client";

import { TrackedLink } from "./tracked-link";

const TRUST_ITEMS = [
  {
    title: "Evidence-first guidance",
    body: "We point you to official sources and realistic sequencing—not hype or outcome promises.",
  },
  {
    title: "Transparent process",
    body: "You see what we need, what happens next, and where decisions sit with departments.",
  },
  {
    title: "Official-source checking",
    body: "Policy changes often; we encourage verifying fees, work rights, and criteria before you lodge.",
  },
  {
    title: "Privacy-first handling",
    body: "Contact and document flows follow consent logging and retention practices you can review.",
  },
  {
    title: "Real contact details",
    body: "Speak with a Brisbane-based team by phone, email, or WhatsApp when you want human help.",
  },
];

export function HomeTrustSection() {
  return (
    <section className="home-section" aria-labelledby="home-trust-heading">
      <div className="relative isolate mx-auto w-full min-w-0 overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-gradient-to-b from-[#FBF6F4]/90 via-white to-[#FBF6F4]/75 p-5 shadow-[var(--shadow-lux)] sm:p-7">
        <div className="relative z-10 mx-auto w-full min-w-0">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-brand-rose">
            Why plan with MinRosh
          </p>
          <h2
            id="home-trust-heading"
            className="mt-3 text-center text-2xl font-bold tracking-tight text-brand-plum sm:text-3xl"
          >
            Clear visa planning before you spend money
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
            Compare your study, work and PR options in plain English. Make informed decisions before lodging—not after
            fees are paid.
          </p>

          <ul className="mt-8 grid min-w-0 list-none grid-cols-1 gap-4 pl-0 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item.title}
                className="min-w-0 rounded-2xl border border-brand-plum/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-base font-bold text-brand-plum">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-brand-plum/70">{item.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <TrackedLink
              href="/contact"
              eventName="cta_click"
              eventParams={{ cta_id: "trust_contact", cta_location: "home_trust", destination: "/contact" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-brand-plum/15 bg-white px-6 py-3 text-sm font-bold text-brand-plum transition hover:border-brand-rose/35"
            >
              info@minroshmigration.com.au
            </TrackedLink>
            <TrackedLink
              href="tel:+61478100542"
              eventName="cta_click"
              eventParams={{ cta_id: "trust_phone", cta_location: "home_trust", destination: "tel" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-brand-plum/15 bg-white px-6 py-3 text-sm font-bold text-brand-plum transition hover:border-brand-rose/35"
            >
              0478 100 542
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
