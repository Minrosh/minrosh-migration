import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import {
  googleServiceAccountCredentialsPath,
  readGoogleServiceAccountCredentialsFromEnv,
} from "@/lib/google-service-account-private-key";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();

  const credPath = googleServiceAccountCredentialsPath();
  const creds = readGoogleServiceAccountCredentialsFromEnv();

  const checks = [
    {
      key: "GOOGLE_APPLICATION_CREDENTIALS",
      required: false,
      configured: Boolean(credPath),
      note: credPath ? `JSON key file: ${credPath}` : "Optional; if set, must be absolute path (recommended with PM2 standalone cwd)",
    },
    {
      key: "GOOGLE_SERVICE_ACCOUNT_EMAIL",
      required: true,
      configured: Boolean(creds.clientEmail),
      note: credPath ? "Taken from JSON when GOOGLE_APPLICATION_CREDENTIALS is set" : undefined,
    },
    {
      key: "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
      required: true,
      configured: Boolean(creds.privateKey),
      note: credPath ? "Taken from JSON when GOOGLE_APPLICATION_CREDENTIALS is set" : undefined,
    },
    { key: "GOOGLE_WORKSPACE_DELEGATED_USER", required: true },
    { key: "GOOGLE_DRIVE_LEADS_PARENT_ID", required: false },
    { key: "GOOGLE_DRIVE_CUSTOMERS_PARENT_ID", required: false },
    { key: "DRIVE_UPLOAD_MODE", required: true, expected: "required" },
    { key: "GOOGLE_CALENDAR_ID", required: true },
    { key: "GOOGLE_SHEETS_STATUS_SPREADSHEET_ID", required: true },
    { key: "GOOGLE_SHEETS_STATUS_RANGE", required: true },
    { key: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", required: true },
    { key: "GOOGLE_PLACES_API_KEY", required: true },
    { key: "GOOGLE_PLACES_PLACE_ID", required: true },
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      required: false,
      configured: Boolean(String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim()),
      note: "Optional Postgres backend; use with SUPABASE_SERVICE_ROLE_KEY on server routes only",
    },
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      required: false,
      configured: Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()),
      note: "Server-only; never expose to the browser",
    },
  ].map((item) => {
    if (Object.hasOwn(item, "configured")) {
      return {
        key: item.key,
        required: item.required,
        configured: item.configured,
        note: item.note,
      };
    }
    const value = String(process.env[item.key] || "").trim();
    const configured = item.expected ? value.toLowerCase() === item.expected : value.length > 0;
    return {
      key: item.key,
      required: item.required,
      configured,
      note: item.expected ? `Expected value: ${item.expected}` : undefined,
    };
  });

  const requiredMissing = checks.filter((c) => c.required && !c.configured).map((c) => c.key);
  return Response.json({
    checks,
    requiredMissing,
    ready: requiredMissing.length === 0,
  });
}
