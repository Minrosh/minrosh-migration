import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminRequest } from "@/lib/admin/auth-route";

/**
 * Admin-only draft preview enable. Redirects to admin preview route (not public pages).
 * Query: ?secret=...&slug=about
 */
export async function GET(request) {
  if (!(await verifyAdminRequest(request))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = String(searchParams.get("slug") || "about").trim();
  const expected = String(process.env.WEBSITE_CMS_DRAFT_SECRET || "").trim();
  if (!expected || secret !== expected) {
    return new Response("Invalid draft token", { status: 401 });
  }
  const draft = await draftMode();
  draft.enable();
  redirect(`/admin/website/preview/${slug}`);
}
