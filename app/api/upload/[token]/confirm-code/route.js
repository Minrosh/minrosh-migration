import { cookies } from "next/headers";
import { findCustomerByMagicToken, updateCustomer } from "@/lib/admin/customers-service";
import { appendAudit } from "@/lib/admin/audit";
import { isMagicLinkExpired, uploadSmsVerificationEnabled } from "@/lib/upload-magic-link";
import { isOtpExpired, signUploadSessionToken, verifyUploadOtpHash } from "@/lib/upload-otp";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { normalizeUploadTokenParam } from "@/lib/upload-token";

export async function POST(request, { params }) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`upload-sms-confirm:${ip}`, { windowMs: 15 * 60 * 1000, max: 25 })) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { token: rawParam } = await params;
  const token = normalizeUploadTokenParam(rawParam);
  if (!token) {
    return Response.json({ error: "Invalid link" }, { status: 404 });
  }
  const customer = findCustomerByMagicToken(token);
  if (!customer) {
    return Response.json({ error: "Invalid link" }, { status: 404 });
  }
  if (isMagicLinkExpired(customer)) {
    return Response.json({ error: "This link has expired." }, { status: 410 });
  }
  if (!uploadSmsVerificationEnabled()) {
    return Response.json({ error: "SMS verification is not enabled." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const code = String(body?.code || "").replace(/\D/g, "").slice(0, 6);
  if (code.length !== 6) {
    return Response.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }

  if (isOtpExpired(customer.uploadOtpExpiresAt) || !customer.uploadOtpHash) {
    return Response.json({ error: "Code expired or not sent. Request a new code." }, { status: 400 });
  }
  if (!verifyUploadOtpHash(token, code, customer.uploadOtpHash)) {
    return Response.json({ error: "Incorrect code." }, { status: 401 });
  }

  updateCustomer(customer.id, { uploadOtpHash: null, uploadOtpExpiresAt: null });

  const sig = signUploadSessionToken(token);
  if (!sig) {
    return Response.json({ error: "Server configuration error." }, { status: 503 });
  }

  const jar = await cookies();
  const secure =
    process.env.NODE_ENV === "production" && process.env.UPLOAD_COOKIE_SECURE !== "false";
  jar.set("minrosh_upload_verified", sig, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 70 * 60 * 60,
  });

  appendAudit("upload_sms_verified", customer.id);
  return Response.json({ ok: true });
}
