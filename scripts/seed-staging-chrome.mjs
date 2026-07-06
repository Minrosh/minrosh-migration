#!/usr/bin/env node
/** Seed staging header/footer CMS content for Sprint 3g verification. */
import fs from "node:fs";
import path from "node:path";

const dataDir =
  process.env.WEBSITE_CMS_TEST_DATA_DIR ||
  path.join(process.cwd(), ".next/standalone/data");

const now = new Date().toISOString();

const navigation = {
  schemaVersion: 1,
  primaryLinks: [
    { label: "CMS Home", href: "/" },
    { label: "CMS Visas", href: "/australian-visas-official-sources" },
    { label: "CMS Assessment", href: "/assessment" },
    { label: "CMS About", href: "/about" },
    { label: "CMS Contact", href: "/contact" },
  ],
  headerCtaLabel: "CMS Book consult",
  headerCtaHref: "/book-consultation",
  updatedAt: now,
  updatedBy: "staging-verify-3g",
};

const footer = {
  schemaVersion: 1,
  complianceLine: "CMS footer notice — general information only (staging verification).",
  footerTagline: "CMS footer tagline — staging verify",
  footerSummary: "CMS footer summary for staging header/footer wiring.",
  contactPhone: "0478 100 542",
  contactEmailLabel: "CMS email via contact page",
  linkGroups: [
    {
      title: "CMS Services",
      links: [
        { label: "CMS Skilled", href: "/skilled-migration" },
        { label: "CMS Student", href: "/student-visa-australia" },
      ],
    },
    {
      title: "CMS Business",
      links: [
        { label: "CMS FAQ", href: "/faq" },
        { label: "CMS Contact", href: "/contact" },
      ],
    },
  ],
  social: {},
  updatedAt: now,
  updatedBy: "staging-verify-3g",
};

const compliance = {
  schemaVersion: 1,
  showMarn: true,
  marnText: "Staging MARN on request",
  disclaimerText: "",
  noGuaranteeText: "",
  assessmentDisclaimer: "",
  footerComplianceWording: "",
  updatedAt: now,
  updatedBy: "staging-verify-3g",
};

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "website-navigation.json"), JSON.stringify(navigation, null, 2));
fs.writeFileSync(path.join(dataDir, "website-footer.json"), JSON.stringify(footer, null, 2));
fs.writeFileSync(path.join(dataDir, "website-compliance.json"), JSON.stringify(compliance, null, 2));
console.log("Seeded header/footer CMS to", dataDir);
