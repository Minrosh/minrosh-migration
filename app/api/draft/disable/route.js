import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminRequest } from "@/lib/admin/auth-route";

export async function GET(request) {
  if (!(await verifyAdminRequest(request))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const draft = await draftMode();
  draft.disable();
  redirect("/admin/website");
}
