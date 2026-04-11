import Link from "next/link";
import siteDataStatic from "../../data/site.json";
import { materializeSiteConfig } from "@/lib/content/site-config";

const site = materializeSiteConfig(siteDataStatic);
const brandName = String(site.brand?.name || "MinRosh Migration");

export const metadata = {
  title: "Tools",
  description: `${brandName} — client tools and pathways (new features ship here first).`,
};

export default function ToolsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
      <p className="mt-3 text-muted-foreground">
        New interactive features are introduced on this section first so core visa guides stay stable.
      </p>
      <ul className="mt-8 space-y-3 text-sm">
        <li>
          <Link href="/assessment" className="font-medium text-primary underline-offset-4 hover:underline">
            Eligibility assessment
          </Link>
          <span className="text-muted-foreground"> — structured pathway quiz</span>
        </li>
        <li>
          <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            Contact
          </Link>
          <span className="text-muted-foreground"> — speak with the team</span>
        </li>
        <li>
          <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Home
          </Link>
        </li>
      </ul>
    </main>
  );
}
