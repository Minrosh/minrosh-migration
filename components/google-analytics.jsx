import Script from "next/script";

/**
 * GA4 when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (e.g. G-XXXXXXXXXX).
 * Add the same var to the server .env before production build if you need client-side hits.
 */
export function GoogleAnalytics({ nonce = "" }) {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
        nonce={nonce || undefined}
      />
      <Script id="ga4-config" strategy="afterInteractive" nonce={nonce || undefined}>
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
window.minroshTrack = function(eventName, params){
  try {
    gtag('event', eventName, params || {});
  } catch (_e) {
    // Silently ignore analytics errors to avoid blocking UX.
  }
}
        `.trim()}
      </Script>
    </>
  );
}
