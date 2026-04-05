import { escapeJsonLdScriptJson } from "@/lib/security/json-ld-escape";

export function StructuredData({ data }) {
  const json = escapeJsonLdScriptJson(JSON.stringify(data));
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
