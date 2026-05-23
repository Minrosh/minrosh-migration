import { escapeJsonLdScriptJson } from "@/lib/security/json-ld-escape";

export function StructuredData({ data, nonce = "" }) {
  const json = escapeJsonLdScriptJson(JSON.stringify(data));
  const n = typeof nonce === "string" ? nonce.trim() : "";
  return (
    <script
      type="application/ld+json"
      {...(n ? { nonce: n } : {})}
      // Inline JSON-LD + CSP nonce can differ between SSR and client in dev (middleware nonce replay); avoid noisy hydration errors.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
