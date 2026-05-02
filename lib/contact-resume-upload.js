import path from "node:path";
import { uploadBufferToDriveFolder } from "@/lib/google-drive";
import { detectBinaryMime, isAllowedStoredMime } from "@/lib/security/upload-validation";

const MAX_RESUME_BYTES = 15 * 1024 * 1024;

/**
 * @param {{ resumeFile: File | null, folderId: string, enquiryId: string }} args
 * @returns {Promise<{ status: "none" | "uploaded" | "failed"; fileName: string }>}
 */
export async function uploadConsultationResumeIfPresent({ resumeFile, folderId, enquiryId }) {
  if (!resumeFile) {
    return { status: "none", fileName: "" };
  }
  if (typeof resumeFile.arrayBuffer !== "function") {
    return { status: "none", fileName: "" };
  }
  let buf;
  try {
    buf = Buffer.from(await resumeFile.arrayBuffer());
  } catch {
    return { status: "failed", fileName: String(resumeFile.name || "").slice(0, 120) };
  }
  if (!buf.length) {
    return { status: "none", fileName: "" };
  }
  if (!folderId) {
    return { status: "failed", fileName: String(resumeFile.name || "").slice(0, 120) };
  }
  if (buf.length > MAX_RESUME_BYTES) {
    return { status: "failed", fileName: String(resumeFile.name || "").slice(0, 120) };
  }
  const mime = detectBinaryMime(buf.subarray(0, Math.min(12, buf.length)));
  if (!mime || !isAllowedStoredMime(mime)) {
    return { status: "failed", fileName: String(resumeFile.name || "").slice(0, 120) };
  }
  const rawName = String(resumeFile.name || "resume.pdf").trim() || "resume.pdf";
  const safeName = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "resume.pdf";
  const destName = `resume-${enquiryId}-${safeName}`.slice(0, 200);
  try {
    const result = await uploadBufferToDriveFolder({
      folderId,
      filename: destName,
      mime,
      buffer: buf,
    });
    if (result.uploaded) {
      return { status: "uploaded", fileName: safeName };
    }
  } catch {
    /* fall through */
  }
  return { status: "failed", fileName: safeName };
}
