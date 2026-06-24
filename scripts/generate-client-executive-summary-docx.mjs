/**
 * Generates a client-facing executive summary (.docx) for MinRosh Migration.
 * Usage: node scripts/generate-client-executive-summary-docx.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "reports");
const OUT_FILE = path.join(OUT_DIR, "MinRosh-Migration-Executive-Summary.docx");

const BRAND_PLUM = "5C2D4E";
const BRAND_GOLD = "B8860B";

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level === HeadingLevel.HEADING_1 ? BRAND_PLUM : "333333",
      }),
    ],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    children: [
      new TextRun({
        text,
        size: 22,
        ...opts,
      }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

function statusTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([area, status, note], i) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 28, type: WidthType.PERCENTAGE },
            shading: i === 0 ? { fill: BRAND_PLUM, type: ShadingType.CLEAR } : undefined,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: area,
                    bold: i === 0,
                    color: i === 0 ? "FFFFFF" : "333333",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            shading: i === 0 ? { fill: BRAND_PLUM, type: ShadingType.CLEAR } : undefined,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: status,
                    bold: i === 0,
                    color: i === 0 ? "FFFFFF" : "333333",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 54, type: WidthType.PERCENTAGE },
            shading: i === 0 ? { fill: BRAND_PLUM, type: ShadingType.CLEAR } : undefined,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: note,
                    bold: i === 0,
                    color: i === 0 ? "FFFFFF" : "333333",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    ),
  });
}

const reportDate = "24 June 2026";

const doc = new Document({
  creator: "MinRosh Migration",
  title: "MinRosh Migration — Executive Summary",
  description: "Client-facing development analysis executive summary",
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "MinRosh Migration",
              bold: true,
              size: 56,
              color: BRAND_PLUM,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: "Website & Platform — Executive Summary",
              bold: true,
              size: 36,
              color: "333333",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `Prepared: ${reportDate}`,
              size: 22,
              italics: true,
              color: "666666",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "minroshmigration.com.au",
              size: 24,
              color: BRAND_GOLD,
            }),
          ],
        }),

        heading("1. Executive Summary"),
        body(
          "MinRosh Migration operates on a modern, production-ready digital platform that serves two connected purposes: a premium public website that attracts and converts prospective migrants, and a secure internal workspace that supports day-to-day agency operations including client management, invoicing, and content publishing."
        ),
        body(
          "The platform has evolved from a traditional brochure-style website into a comprehensive business system. It is live, actively maintained, and built on current industry-standard technology (Next.js, React). The site is optimised for search engines, mobile devices, and conversion — with strong foundations in security, privacy, and operational reliability."
        ),
        body(
          "Overall platform health is good. Automated quality checks pass consistently, and the system includes documented deployment procedures, maintenance-mode upgrades, and optional cloud integrations that can be enabled as the business grows."
        ),

        heading("2. Platform at a Glance", HeadingLevel.HEADING_2),
        statusTable([
          ["Area", "Status", "Summary"],
          ["Public website", "Operational", "67+ pages covering visa services, guides, news, and conversion flows"],
          ["Admin workspace", "Operational", "CRM, invoicing, intelligence, news, and reporting tools"],
          ["Lead capture", "Operational", "Contact forms, visa quiz, consultation booking, AI concierge"],
          ["Search visibility", "Strong", "Sitemap, metadata, structured data, and SEO audit in CI"],
          ["Security", "Strong", "Encrypted admin access, content security policy, privacy consent logging"],
          ["Deployment", "Automated", "Zero-downtime maintenance window, PM2 process management, CDN support"],
        ]),
        spacer(),

        heading("3. What the Public Website Delivers", HeadingLevel.HEADING_2),
        body(
          "The public-facing website is designed to establish trust, educate visitors, and guide them toward meaningful next steps — whether that is a free assessment, a consultation booking, or a direct enquiry."
        ),
        bullet("Premium homepage with Brisbane hero imagery, visa pathway selector, and interactive eligibility quiz"),
        bullet("Comprehensive service pages for skilled migration, student visas, partner visas, employer sponsorship, and visitor visas"),
        bullet("Evergreen planning guides covering fees, processing times, document checklists, and country comparisons"),
        bullet("Immigration news section with editorial content managed from the admin panel"),
        bullet("Interactive tools including a PR pathway explorer and student cost planner"),
        bullet("Destination hubs for Australia and international pathways (New Zealand, Canada, UK, and more)"),
        bullet("AI-powered concierge chat (when enabled) to answer visitor questions and optionally capture leads"),
        bullet("Mobile-first responsive design with fast image delivery and accessibility considerations"),

        heading("4. Internal Business Operations", HeadingLevel.HEADING_2),
        body(
          "Behind the public website sits a private admin workspace accessible only to authorised staff. This replaces the need for multiple disconnected tools by bringing core agency workflows into one secure environment."
        ),
        bullet("Customer and lead management with pipeline tracking, tasks, inbox, and automation rules"),
        bullet("Quoting and invoicing with PDF generation, recurring invoices, payment reminders, and optional accounting sync"),
        bullet("Intelligence pipeline that monitors official immigration sources and produces reviewable content drafts"),
        bullet("News and success stories editor for keeping the public site current without developer involvement"),
        bullet("Multi-user admin access with role-based permissions and a full audit log"),
        bullet("Secure client document upload portal via time-limited links"),
        bullet("Optional integrations: Google Calendar booking, Google Sheets CRM sync, email nurture sequences, social publishing"),

        heading("5. Security, Privacy & Compliance", HeadingLevel.HEADING_2),
        body(
          "Security has been treated as a first-class requirement rather than an afterthought. Key protections include:"
        ),
        bullet("Password-protected admin area with encrypted session cookies and optional two-factor authentication"),
        bullet("Per-request content security policies that limit what scripts can run on the site"),
        bullet("Privacy consent logging on contact submissions, with configurable mandatory consent"),
        bullet("Optional hCaptcha protection on public enquiry forms"),
        bullet("Automatic deletion of client uploads after cases are closed (configurable retention period)"),
        bullet("Maintenance mode during deployments so visitors see a professional message instead of errors"),
        bullet("Webhook and scheduled-job endpoints protected by secret tokens"),

        heading("6. Search Engine & Marketing Readiness", HeadingLevel.HEADING_2),
        body(
          "The platform is built with long-term organic visibility in mind. Every major page includes unique titles, descriptions, and social sharing previews. The site publishes an automatic sitemap and robots file for search engines."
        ),
        bullet("Structured data (schema markup) for business information, breadcrumbs, and FAQs on key pages"),
        bullet("Canonical URLs and Open Graph tags on all marketing pages"),
        bullet("133 verified routes with automated checks to prevent accidental page removals"),
        bullet("SEO metadata audit runs on every code change in continuous integration"),
        bullet("Legacy URL redirects preserved to protect existing search rankings"),
        body(
          "Content strategy documentation identifies opportunities to deepen destination pages and strengthen conversion tracking — these are growth items rather than gaps in the current foundation."
        ),

        heading("7. Reliability & Deployment", HeadingLevel.HEADING_2),
        body(
          "Production deployments follow a documented, repeatable process designed to minimise risk:"
        ),
        bullet("Maintenance screen activated before upgrades begin"),
        bullet("Automated build verification and smoke tests after deployment"),
        bullet("Process managed by PM2 for automatic restart on failure"),
        bullet("Optional Cloudflare CDN cache purge after successful deploy"),
        bullet("Standalone production build optimised for server hosting"),
        body(
          "Operational runbooks exist for post-deploy verification, Search Console reindexing, secrets rotation, and incident response."
        ),

        heading("8. Current Health Assessment", HeadingLevel.HEADING_2),
        statusTable([
          ["Check", "Result", "Notes"],
          ["Code quality (lint)", "Pass", "No warnings or errors"],
          ["Automated unit tests", "Pass", "52 tests covering core business logic"],
          ["Production build", "Pass", "Builds successfully for deployment"],
          ["End-to-end smoke tests", "Pass", "Homepage, contact, and admin redirect verified"],
          ["Route integrity", "Pass", "All required pages present"],
          ["SEO metadata audit", "Pass", "Runs in CI on every change"],
        ]),
        spacer(),
        body(
          "One dependency security advisory (email library) has been identified and can be resolved with a routine version update and SMTP testing. This does not affect the live site's current operation but should be addressed in the next maintenance window."
        ),

        heading("9. Recommended Next Steps", HeadingLevel.HEADING_2),
        body("The following priorities are suggested to strengthen the platform over the next one to three months:"),
        bullet("Implement structured conversion tracking in Google Analytics (quiz completions, enquiries, consultation bookings)"),
        bullet("Expand automated testing for admin workflows and invoice PDF generation"),
        bullet("Complete the database migration path (Supabase Phase 2) for improved data resilience at scale"),
        bullet("Deepen destination content for New Zealand, Canada, and UK pathways"),
        bullet("Resolve the email library security advisory during the next scheduled maintenance"),

        heading("10. Conclusion", HeadingLevel.HEADING_2),
        body(
          "MinRosh Migration's digital platform is a mature, well-architected system that successfully combines a high-quality public marketing presence with practical internal business tools. The foundation supports current operations confidently and provides clear paths for growth in analytics, content depth, and data infrastructure."
        ),
        body(
          "The platform is production-ready, actively maintained, and supported by comprehensive documentation and automated quality gates — positioning MinRosh Migration competitively in both client experience and operational efficiency."
        ),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: "— End of Report —",
              size: 20,
              italics: true,
              color: "999999",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Confidential — prepared for MinRosh Migration stakeholders",
              size: 18,
              italics: true,
              color: "999999",
            }),
          ],
        }),
      ],
    },
  ],
});

fs.mkdirSync(OUT_DIR, { recursive: true });
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buffer);
console.log(`Written: ${OUT_FILE}`);
console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
