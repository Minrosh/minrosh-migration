import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { readAdminSuccessStories, writeAdminSuccessStories } from "@/lib/admin/json-store";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json(readAdminSuccessStories());
}

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body?.action === "delete") {
    const data = readAdminSuccessStories();
    const stories = (data.stories || []).filter((_, i) => i !== Number(body.index));
    writeAdminSuccessStories({ stories });
    appendAudit("success_story_delete", String(body.index));
    return Response.json({ stories });
  }

  const story = {
    name: String(body.name || "").trim(),
    location: String(body.location || "").trim(),
    visa: String(body.visa || "").trim(),
    quote: String(body.quote || "").trim(),
    outcome: String(body.outcome || "").trim(),
    timeline: String(body.timeline || "").trim(),
  };
  if (!story.name || !story.quote) {
    return Response.json({ error: "name and quote required" }, { status: 400 });
  }

  const data = readAdminSuccessStories();
  const stories = [story, ...(data.stories || [])];
  writeAdminSuccessStories({ stories });
  appendAudit("success_story_create", story.name);
  return Response.json({ story, stories });
}
