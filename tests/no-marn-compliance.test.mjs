import { describe, expect, it } from "vitest";
import {
  isPublishableMarn,
  validatePublishableCopy,
  looksLikeImmigrationAssistanceRequest,
  isAllowedEnquiryType,
  COMPLIANCE_FEATURE_FLAGS,
} from "../lib/compliance.js";
import {
  validateInvoiceLineDescription,
  sanitizeInvoiceLineDescription,
  SAFE_INVOICE_LINE_FALLBACK,
} from "../lib/invoice/line-description-guard.js";
import { businessJsonLd } from "../lib/seo.js";
import { INFORMATION_FINDER_TOPICS } from "../lib/official-information-finder.js";
import siteData from "../data/site.json";

describe("no-MARN compliance", () => {
  it("never treats Available on request as publishable MARN", () => {
    expect(isPublishableMarn("Available on request")).toBe(false);
    expect(isPublishableMarn("")).toBe(false);
    expect(isPublishableMarn("pending")).toBe(false);
    expect(isPublishableMarn("1801042")).toBe(true);
  });

  it("site.json has no public marn field and has compliance block", () => {
    expect(Object.prototype.hasOwnProperty.call(siteData.brand || {}, "marn")).toBe(false);
    expect(siteData.compliance?.businessStatusDisclosure).toBeTruthy();
  });

  it("validatePublishableCopy blocks agent self-claims", () => {
    expect(validatePublishableCopy("Contact our registered migration agent in Brisbane").ok).toBe(false);
    expect(validatePublishableCopy("General migration information from public sources").ok).toBe(true);
  });

  it("enquiry types are restricted", () => {
    expect(isAllowedEnquiryType("general_information")).toBe(true);
    expect(isAllowedEnquiryType("education_enquiry")).toBe(true);
    expect(isAllowedEnquiryType("visa_strategy")).toBe(false);
  });

  it("immigration assistance heuristic catches common requests", () => {
    expect(looksLikeImmigrationAssistanceRequest("Am I eligible for subclass 189?")).toBe(true);
    expect(looksLikeImmigrationAssistanceRequest("Please prepare my visa application")).toBe(true);
    expect(looksLikeImmigrationAssistanceRequest("Where is the Home Affairs visa listing?")).toBe(false);
  });

  it("personalised engines stay disabled by default", () => {
    expect(COMPLIANCE_FEATURE_FLAGS.PERSONALISED_NAVIGATOR).toBe(false);
    expect(COMPLIANCE_FEATURE_FLAGS.PERSONALISED_QUIZ_RESULTS).toBe(false);
    expect(COMPLIANCE_FEATURE_FLAGS.AI_PATHWAY_FUNNEL).toBe(false);
    expect(COMPLIANCE_FEATURE_FLAGS.AUTHORISED_RMA_MODE).toBe(false);
    expect(COMPLIANCE_FEATURE_FLAGS.PUBLIC_MIGRATION_MATTER_PORTAL).toBe(false);
  });

  it("JSON-LD does not emit MARN identifier", () => {
    const ld = businessJsonLd(siteData);
    expect(ld.identifier).toBeUndefined();
    expect(JSON.stringify(ld)).not.toMatch(/MARN/i);
    expect(JSON.stringify(ld)).not.toMatch(/Available on request/i);
  });

  it("does not emit AggregateRating or Review structured data from site seed", () => {
    const ld = businessJsonLd(siteData);
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.review).toBeUndefined();
    expect(JSON.stringify(ld)).not.toMatch(/AggregateRating|"@type":"Review"/i);
    expect(Array.isArray(siteData.successStories) ? siteData.successStories.length : 0).toBe(0);
  });

  it("Official Information Finder topics are deterministic and non-scoring", () => {
    expect(INFORMATION_FINDER_TOPICS.length).toBeGreaterThanOrEqual(5);
    for (const topic of INFORMATION_FINDER_TOPICS) {
      expect(topic.id && topic.label && Array.isArray(topic.sources)).toBeTruthy();
      expect(topic.sources.every((s) => s.url && s.name && s.lastChecked)).toBe(true);
      expect(JSON.stringify(topic)).not.toMatch(/confidenceScore|you qualify|recommend a visa/i);
    }
  });

  it("invoice line descriptions cannot claim immigration assistance", () => {
    expect(validateInvoiceLineDescription("Education course enquiry support").ok).toBe(true);
    expect(validateInvoiceLineDescription("Visa lodgement fee").ok).toBe(false);
    expect(validateInvoiceLineDescription("Immigration assistance package").ok).toBe(false);
    expect(validateInvoiceLineDescription("Visa application preparation").ok).toBe(false);
    expect(sanitizeInvoiceLineDescription("Visa lodgement service")).toBe(SAFE_INVOICE_LINE_FALLBACK);
  });
});
