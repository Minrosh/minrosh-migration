"use client";

/**
 * Optional Web Push soft-prompt (see .env.example VAPID keys).
 * Renders nothing when push is not configured — keeps pages lean by default.
 */
export function PushNotificationPrimer({ variant = "card", autoOpen = false, enquiryId = "" }) {
  void variant;
  void autoOpen;
  void enquiryId;

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()) {
    return null;
  }

  return null;
}
