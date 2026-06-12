import Script from "next/script";

/**
 * GA4 when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (e.g. G-XXXXXXXXXX).
 * Loaded on marketing pages only (via SiteShell). Uses hash CSP on public HTML.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id) return null;

  return (
    <>
      <Script id="ga4-config" strategy="lazyOnload">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${id}');
window.minroshTrack = function(eventName, params){
  try {
    gtag('event', eventName, params || {});
  } catch (_e) {
    // Silently ignore analytics errors to avoid blocking UX.
  }
};
        `.trim()}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
    </>
  );
}
