import Image from "next/image";
import Link from "next/link";
import siteData from "../data/site.json";
import { SiteShell } from "../components/site-shell";

export default function NotFound() {
  return (
    <SiteShell siteData={siteData} currentPath="/404">
      <section className="not-found-premium">
        <div className="not-found-premium__card">
          <Image
            src="/images/hero-brisbane-river-cbd-hd.jpg"
            alt="Brisbane River and the central business district"
            width={960}
            height={280}
            className="not-found-premium__photo"
          />
          <p className="not-found-premium__404" aria-hidden="true">
            404
          </p>
          <h1>Page not found</h1>
          <p>
            The page you requested may have moved or may no longer be available. You can browse our general
            information pages, visit the Education Course Enquiry page, or return to the homepage.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary min-h-[48px] rounded-full px-6">
              Return Home
            </Link>
            <Link href="/australian-visas-official-sources" className="btn btn-ghost min-h-[48px] rounded-full px-6">
              Browse General Information
            </Link>
            <Link href="/education-consultation" className="btn btn-ghost min-h-[48px] rounded-full px-6">
              Education Course Enquiry
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
