/**
 * Root route loading UI is disabled — the previous full-viewport shell could remain
 * visible after the page streamed in, blocking the entire site. Segment loaders under
 * app/destinations/loading.js and app/immigration-news/loading.js are unchanged.
 */
export default function Loading() {
  return null;
}
