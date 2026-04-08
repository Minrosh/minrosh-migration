import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { getBrochureFilePath } from "@/lib/brochure-path";
import { readGoogleServiceAccountCredentialsFromEnv } from "@/lib/google-service-account-private-key";

function getGmailClient() {
  const { clientEmail, privateKey } = readGoogleServiceAccountCredentialsFromEnv();
  const delegatedUser = String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "").trim();
  if (!clientEmail || !privateKey || !delegatedUser) return null;
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    subject: delegatedUser,
  });
  return google.gmail({ version: "v1", auth });
}

function encodeHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function sendGmailApiEmail({ to, subject, text, html, includeBrochure }) {
  const gmail = getGmailClient();
  if (!gmail) return { sent: false, reason: "gmail_api_not_configured" };

  const from = encodeHeader(process.env.SMTP_FROM || process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "");
  if (!from) return { sent: false, reason: "missing_from_address" };

  const boundaryOuter = `minrosh-${Date.now()}-outer`;
  const boundaryAlt = `minrosh-${Date.now()}-alt`;
  const lines = [
    `From: ${from}`,
    `To: ${encodeHeader(to)}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
  ];

  const brochurePath = getBrochureFilePath();
  const hasBrochure = Boolean(includeBrochure && fs.existsSync(brochurePath));
  if (hasBrochure) {
    const brochure = fs.readFileSync(brochurePath);
    lines.push(`Content-Type: multipart/mixed; boundary="${boundaryOuter}"`, "");
    lines.push(`--${boundaryOuter}`);
    lines.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`, "");
    lines.push(`--${boundaryAlt}`);
    lines.push('Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: 7bit", "", text || "", "");
    lines.push(`--${boundaryAlt}`);
    lines.push('Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: 7bit", "", html || "", "");
    lines.push(`--${boundaryAlt}--`, "");
    lines.push(`--${boundaryOuter}`);
    lines.push(
      'Content-Type: application/pdf; name="MinRosh-Migration-Brochure.pdf"',
      "Content-Transfer-Encoding: base64",
      'Content-Disposition: attachment; filename="MinRosh-Migration-Brochure.pdf"',
      "",
      brochure.toString("base64").replace(/(.{76})/g, "$1\n"),
      "",
    );
    lines.push(`--${boundaryOuter}--`);
  } else {
    lines.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`, "");
    lines.push(`--${boundaryAlt}`);
    lines.push('Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: 7bit", "", text || "", "");
    lines.push(`--${boundaryAlt}`);
    lines.push('Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: 7bit", "", html || "", "");
    lines.push(`--${boundaryAlt}--`);
  }

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: base64Url(lines.join("\r\n")),
    },
  });
  return { sent: true };
}
