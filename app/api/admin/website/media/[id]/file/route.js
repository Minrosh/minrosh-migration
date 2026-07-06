import fs from "node:fs";
import path from "node:path";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { websiteMediaStorageDir } from "@/lib/admin/paths";
import { getMediaItemById } from "@/lib/website/media-store";
import { isPathInsideRoot } from "@/lib/security/upload-validation";

export async function GET(request, { params }) {
  if (!(await verifyAdminRequest(request))) return adminJsonUnauthorized(request);
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const item = getMediaItemById(String(id || ""));
  if (!item) return new Response("Not found", { status: 404 });
  const abs = path.join(websiteMediaStorageDir, item.filename);
  if (!isPathInsideRoot(websiteMediaStorageDir, abs) || !fs.existsSync(abs)) {
    return new Response("Not found", { status: 404 });
  }
  const buf = fs.readFileSync(abs);
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": item.mime || "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
