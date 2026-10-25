import { buildMetadata } from "@/lib/seo";

/**
 * Tokenised upload URLs stay noindex. Canonical and social URLs use /upload
 * so a private token is not published in metadata or structured data.
 */
export const metadata = buildMetadata({
  title: "Private document link",
  description:
    "This address is a private document link. It is not a public information page and it is not indexed.",
  path: "/upload",
  robots: { index: false, follow: false },
});

export default function UploadLayout({ children }) {
  return children;
}
