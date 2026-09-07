"use client";

import { useState } from "react";

const TOPICS = {
  "skilled-independent": {
    title: "Skilled independent / points-tested categories (general)",
    summary:
      "Public information about Australia’s points-tested skilled migration categories is published by the Department of Home Affairs. Requirements, occupation lists, and invitation settings change.",
    officialLinks: [
      {
        label: "Home Affairs — Visas hub",
        href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
      },
      {
        label: "Home Affairs — Visa Finder",
        href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder",
      },
      {
        label: "SkillSelect overview (official)",
        href: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect",
      },
    ],
  },
  "state-nominated": {
    title: "State and territory nominated categories (general)",
    summary:
      "Some skilled visas involve nomination by an Australian state or territory. Each jurisdiction publishes its own nomination settings separately from federal visa criteria.",
    officialLinks: [
      {
        label: "Home Affairs — Visa listing",
        href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
      },
      {
        label: "Home Affairs — Working in Australia",
        href: "https://immi.homeaffairs.gov.au/visas/working-in-australia",
      },
    ],
  },
  "employer-sponsored": {
    title: "Employer-sponsored categories (general)",
    summary:
      "Employer-sponsored visas have separate nomination and visa stages. Confirm current subclass names, sponsorship obligations, and evidence lists on official pages.",
    officialLinks: [
      {
        label: "Home Affairs — Visa listing",
        href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
      },
      {
        label: "Home Affairs — Employing people",
        href: "https://immi.homeaffairs.gov.au/visas/employing-and-sponsoring-someone",
      },
    ],
  },
  "partner-family": {
    title: "Partner and family categories (general)",
    summary:
      "Partner and family visas are described on Home Affairs pages with relationship, identity, and character requirements that must be verified against the current official instructions.",
    officialLinks: [
      {
        label: "Home Affairs — Visa listing",
        href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
      },
      {
        label: "Home Affairs — Family visas overview",
        href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-offshore",
      },
    ],
  },
};

/**
 * @param {{ disclaimer: string }} props
 */
export function PermanentMigrationInformationExplorerClient({ disclaimer }) {
  const [key, setKey] = useState("skilled-independent");
  const topic = TOPICS[key];

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-brand-plum/75" role="note">
        Select a general topic to view publicly available information and official sources. This tool does not assess
        your circumstances or recommend a visa.
      </p>

      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Permanent migration information topics">
        {Object.entries(TOPICS).map(([id, item]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={key === id}
            onClick={() => setKey(id)}
            className={`min-h-[48px] touch-manipulation rounded-full px-5 py-2 text-sm font-bold transition ${
              key === id
                ? "bg-brand-plum text-white shadow-md"
                : "border border-brand-plum/15 bg-white text-brand-plum hover:border-brand-rose/40"
            }`}
          >
            {item.title.replace(/ \(general\)$/, "")}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-plum/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black text-brand-plum">{topic.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-brand-plum/75">{topic.summary}</p>
        <ul className="mt-6 space-y-3">
          {topic.officialLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-rose underline underline-offset-4 hover:text-brand-plum"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-relaxed text-brand-plum/70" role="note">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}

/** @deprecated Use PermanentMigrationInformationExplorerClient */
export const PrPathwayExplorerClient = PermanentMigrationInformationExplorerClient;
