import nodemailer from "nodemailer";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { readCustomers } from "@/lib/admin/json-store";

function getMailTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function POST(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = String(body.subject || "").trim();
  const text = String(body.text || "").trim();
  if (!subject || !text) {
    return Response.json({ error: "subject and text required" }, { status: 400 });
  }

  const { customers } = readCustomers();
  const emails = (customers || [])
    .filter((c) => c.status === "prospective" && c.email)
    .map((c) => c.email.trim().toLowerCase())
    .filter(Boolean);

  const unique = [...new Set(emails)];
  if (!unique.length) {
    return Response.json({ error: "No prospective customer emails", sent: 0 });
  }

  const transporter = getMailTransport();
  if (!transporter) {
    return Response.json({ error: "SMTP not configured" }, { status: 503 });
  }

  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
  const bcc = unique.join(", ");

  await transporter.sendMail({
    from: smtpFrom,
    to: smtpFrom,
    bcc,
    subject,
    text,
  });

  appendAudit("broadcast_prospective", `${unique.length} recipients`);
  return Response.json({ ok: true, sent: unique.length });
}
