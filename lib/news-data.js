import { revalidatePath } from "next/cache";
import { readNewsList, slugifyTitle, NEWS_PUBLIC_BASE } from "./news-store";

/**
 * Current news feed from disk (not build-time JSON import — required so Intelligence
 * approvals and admin edits update the public site without redeploying).
 */
export function getNewsData() {
  return readNewsList();
}

export function getNewsArticleBySlug(slug) {
  const want = String(slug || "").trim().toLowerCase();
  if (!want) return null;
  const list = readNewsList();
  for (const item of list) {
    if (String(item.slug || "").trim().toLowerCase() === want) return item;
  }
  for (let i = 0; i < list.length; i++) {
    const legacy = slugifyTitle(`${list[i].date || ""}-${list[i].title || ""}`);
    if (legacy && legacy.toLowerCase() === want) return list[i];
  }
  return null;
}

/** Invalidate cached pages that embed the news board or hub. */
export function revalidateNewsBoardPaths() {
  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath(NEWS_PUBLIC_BASE);
}

export function revalidateNewsArticlePath(slug) {
  const s = String(slug || "").trim();
  if (!s) return;
  revalidatePath(`${NEWS_PUBLIC_BASE}/${s}`);
}
