import { findCustomerByMagicToken, updateCustomer } from "@/lib/admin/customers-service";
import { appendAudit } from "@/lib/admin/audit";
import { isMagicLinkExpired, uploadSmsVerificationEnabled } from "@/lib/upload-magic-link";
import { computeOtpExpiresIso, generateSixDigitCode, hashUploadOtp, isOtpExpired } from "@/lib/upload-otp";
import { sendTwilioSms } from "@/lib/twilio-sms";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { normalizeUploadTokenParam } from "@/lib/upload-token";

export async function POST(request, { params }) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`upload-sms-req:${ip}`, { windowMs: 15 * 60 * 1000, max: 8 })) {
    return Response.json({ error: "Too many code requests. Try again later." }, { status: 429 });
  }

  const { token: rawParam } = await params;
  const token = normalizeUploadTokenParam(rawParam);
  if (!token) {
    return Response.json({ error: "Invalid link" }, { status: 404 });
  }
  if (!rateLimitAllow(`upload-sms-req-token:${token}`, { windowMs: 60 * 1000, max: 2 })) {
    return Response.json({ error: "Wait a minute before requesting another code." }, { status: 429 });
  }
  const customer = findCustomerByMagicToken(token);
  if (!customer) {
    return Response.json({ error: "Invalid link" }, { status: 404 });
  }
  if (isMagicLinkExpired(customer)) {
    return Response.json({ error: "This link has expired." }, { status: 410 });
  }
  if (!uploadSmsVerificationEnabled()) {
    return Response.json({ error: "SMS verification is not enabled on this site." }, { status: 400 });
  }
  const mobile = String(customer.mobile || "").trim();
  if (!mobile) {
    return Response.json({ error: "No mobile number on file for this client." }, { status: 403 });
  }

  const code = generateSixDigitCode();
  const hash = hashUploadOtp(token, code);
  if (!hash) {
    return Response.json({ error: "Server configuration error (upload secret missing)." }, { status: 503 });
  }

  updateCustomer(customer.id, {
    uploadOtpHash: hash,
    uploadOtpExpiresAt: computeOtpExpiresIso(),
  });

  const sms = await sendTwilioSms({
    to: mobile,
    body: `MinRosh Migration: your document upload code is ${code}. It expires in 15 minutes. Do not share this code.`,
  });
  if (!sms.ok) {
    updateCustomer(customer.id, { uploadOtpHash: null, uploadOtpExpiresAt: null });
    return Response.json({ error: sms.error || "Could not send SMS" }, { status: 502 });
  }

  appendAudit("upload_sms_code_sent", customer.id);
  return Response.json({ ok: true, hint: "Enter the code we sent to the mobile number on file." });
}
