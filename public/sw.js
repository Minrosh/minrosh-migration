const CACHE_STATIC = "minrosh-static-v4";
const CACHE_GUIDES = "minrosh-guides-v2";
const PRECACHE_URLS = ["/manifest.webmanifest", "/images/minrosh-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => Promise.resolve()),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_STATIC && key !== CACHE_GUIDES)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

/**
 * Long-form visa guides: network-first (try network, then fall back to Cache Storage).
 * Successful responses are written to CACHE_GUIDES so repeat visits / spotty links open instantly
 * from cache while still refreshing in the background on navigation.
 */
function isGuideDocumentPath(pathname) {
  return pathname.endsWith("-guide") || pathname.includes("-guide/");
}

/** Long-form marketing guides (App Router pages) — always revalidate on navigation/refresh. */
function isLongFormVisaGuidePath(pathname) {
  return pathname === "/skilled-migration" || pathname === "/student-visa-australia";
}

function isCachedGuideNavigation(pathname) {
  return isGuideDocumentPath(pathname) || isLongFormVisaGuidePath(pathname);
}

function guideNetworkFirst(request) {
  const req =
    request.mode === "navigate"
      ? new Request(request.url, {
          method: request.method,
          headers: request.headers,
          mode: "same-origin",
          credentials: request.credentials,
          redirect: request.redirect,
          integrity: request.integrity,
          cache: "no-store",
        })
      : request;
  return caches.open(CACHE_GUIDES).then((cache) =>
    fetch(req)
      .then((networkResponse) => {
        try {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
        } catch {
          /* ignore cache write */
        }
        return networkResponse;
      })
      .catch(() => cache.match(request)),
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigationRequest =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");
  const isImageOrManifestAsset =
    isSameOrigin &&
    (requestUrl.pathname.startsWith("/images/") ||
      requestUrl.pathname === "/manifest.webmanifest");
  const isNextStaticAsset =
    isSameOrigin && requestUrl.pathname.startsWith("/_next/static/");

  if (isNavigationRequest && isSameOrigin && isCachedGuideNavigation(requestUrl.pathname)) {
    event.respondWith(guideNetworkFirst(event.request));
    return;
  }

  if (isNavigationRequest) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  /*
   * Cache-first for versioned Next static files can pin stale runtimes/chunk maps
   * across deployments. Let the network be source-of-truth to avoid chunk mismatch.
   */
  if (isNextStaticAsset) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (!isImageOrManifestAsset) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put(event.request, cloned)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    }),
  );
});
