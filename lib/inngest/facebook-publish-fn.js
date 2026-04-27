import { inngest } from "@/lib/inngest/client";
import { publishFacebookPost, markFacebookPostResult, readFacebookPostsStore } from "@/lib/intelligence/facebook";

export const facebookPublishPost = inngest.createFunction(
  { id: "facebook-publish-post", name: "Publish Facebook post" },
  { event: "minrosh/facebook.publish.post" },
  async ({ event, step }) => {
    const postId = String(event.data?.postId || "").trim();
    if (!postId) {
      return { ok: false, error: "missing_postId" };
    }

    const store = await step.run("load-post", () => readFacebookPostsStore());
    const posts = Array.isArray(store.posts) ? store.posts : [];
    const post = posts.find((p) => p.id === postId) || null;
    if (!post) {
      return { ok: false, error: "post_not_found" };
    }

    const result = await step.run("publish-and-persist", async () => {
      const r = await publishFacebookPost(post);
      markFacebookPostResult(postId, r);
      return r;
    });

    return { ok: result.ok, remoteId: result.remoteId || "", error: result.error || "" };
  }
);
