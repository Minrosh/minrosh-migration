const CACHE_NAME = "minrosh-static-v3";
const PRECACHE_URLS = ["/manifest.webmanifest", "/images/minrosh-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => Promise.resolve()),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

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
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
