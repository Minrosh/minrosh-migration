import path from "node:path";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { intelligenceFaqPatchesFile, socialFacebookPostsFile, intelligenceChannelQueueFile } from "@/lib/admin/paths";
import { markPublishHistoryRolledBack } from "./publish-history";

const newsFile = path.join(process.cwd(), "data", "news.json");

function newsLock() {
  return path.join(path.dirname(newsFile), ".news-mutation.lock");
}

function faqLock() {
  return path.join(path.dirname(intelligenceFaqPatchesFile), ".intelligence-faq-patches.lock");
}

function socialLock() {
  return path.join(path.dirname(socialFacebookPostsFile), ".social-facebook-posts.lock");
}

function channelLock() {
  return path.join(path.dirname(intelligenceChannelQueueFile), ".intelligence-channel-queue.lock");
}

export function rollbackPublishedDraft({ publishHistoryEntryId, draftId, faqPatchIds = [] }) {
  const removedNews = withMutationLock(newsLock(), () => {
    const news = readJsonFile(newsFile, []);
    const list = Array.isArray(news) ? news : [];
    const before = list.length;
    const next = list.filter((row) => row.intelligenceDraftId !== draftId);
    writeJsonAtomic(newsFile, next);
    return before - next.length;
  });

  const deactivatedFaq = withMutationLock(faqLock(), () => {
    const store = readJsonFile(intelligenceFaqPatchesFile, { patches: [] });
    const patches = Array.isArray(store.patches) ? store.patches : [];
    let changed = 0;
    for (const row of patches) {
      if (row.intelligenceDraftId !== draftId && !faqPatchIds.includes(row.id)) continue;
      if (row.active === false) continue;
      row.active = false;
      row.updatedAt = new Date().toISOString();
      changed += 1;
    }
    writeJsonAtomic(intelligenceFaqPatchesFile, { patches });
    return changed;
  });

  const cancelledFacebook = withMutationLock(socialLock(), () => {
    const store = readJsonFile(socialFacebookPostsFile, { posts: [] });
    const posts = Array.isArray(store.posts) ? store.posts : [];
    let changed = 0;
    for (const row of posts) {
      if (row.intelligenceDraftId !== draftId) continue;
      if (row.status === "published") continue;
      row.status = "cancelled";
      row.updatedAt = new Date().toISOString();
      changed += 1;
    }
    writeJsonAtomic(socialFacebookPostsFile, { posts });
    return changed;
  });

  const cancelledChannels = withMutationLock(channelLock(), () => {
    const store = readJsonFile(intelligenceChannelQueueFile, { items: [] });
    const items = Array.isArray(store.items) ? store.items : [];
    let changed = 0;
    for (const row of items) {
      if (row.intelligenceDraftId !== draftId) continue;
      if (row.status === "sent") continue;
      row.status = "cancelled";
      row.updatedAt = new Date().toISOString();
      changed += 1;
    }
    writeJsonAtomic(intelligenceChannelQueueFile, { items });
    return changed;
  });

  const history = markPublishHistoryRolledBack(publishHistoryEntryId, {
    removedNews,
    deactivatedFaq,
    cancelledFacebook,
    cancelledChannels,
  });

  return { removedNews, deactivatedFaq, cancelledFacebook, cancelledChannels, history };
}
