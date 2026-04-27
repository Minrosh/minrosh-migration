import { escapeJsonLdScriptJson } from "@/lib/security/json-ld-escape";

export function StructuredData({ data, nonce = "" }) {
  const json = escapeJsonLdScriptJson(JSON.stringify(data));
  return (
    <script
      type="application/ld+json"
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
