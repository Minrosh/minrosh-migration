import { cookies } from "next/headers";
import { isMagicLinkExpired, uploadSmsVerificationEnabled } from "@/lib/upload-magic-link";
import { verifyUploadSessionSignature } from "@/lib/upload-otp";

/**
 * @returns {Promise<Response | null>} Response to return early, or null if access allowed
 */
export async function uploadGateResponse(token, customer) {
  if (!customer) {
    return Response.json({ error: "Invalid or expired link" }, { status: 404 });
  }
  if (isMagicLinkExpired(customer)) {
    return Response.json(
      {
        error:
          "This upload link has expired (72-hour security window). Please ask MinRosh Migration for a new link.",
        code: "LINK_EXPIRED",
      },
      { status: 410 }
    );
  }
  if (!uploadSmsVerificationEnabled()) {
    return null;
  }
  const mobile = String(customer.mobile || "").trim();
  if (!mobile) {
    return Response.json(
      {
        error:
          "SMS verification is enabled but no mobile number is stored for this client. Please contact MinRosh Migration.",
        code: "NO_MOBILE",
      },
      { status: 403 }
    );
  }
  const jar = await cookies();
  const sig = jar.get("minrosh_upload_verified")?.value || "";
  if (verifyUploadSessionSignature(token, sig)) {
    return null;
  }
  return Response.json(
    {
      error: "SMS verification required",
      code: "SMS_OTP_REQUIRED",
      phoneLast4: mobile.replace(/\D/g, "").slice(-4) || "****",
    },
    { status: 401 }
  );
}
