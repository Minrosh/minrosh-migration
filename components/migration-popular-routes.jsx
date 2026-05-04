import Link from "next/link";
import { PublicFileImg } from "./public-file-img";

const ROUTES = [
  {
    href: "/skilled-migration",
    title: "Skilled migration",
    description: "Points-tested subclasses, skills assessment sequencing, and nomination strategy.",
    image: { src: "/images/hero-brisbane-river-cbd.jpg", alt: "Australian skilled migration context — Brisbane River and CBD" },
  },
  {
    href: "/student-visa-australia",
    title: "Student visa",
    description: "Subclass 500 planning with Genuine Student evidence and course alignment.",
    image: { src: "/images/team-office-real.jpg", alt: "Education and visa planning context" },
  },
  {
    href: "/partner-visa-australia",
    title: "Partner & family",
    description: "Relationship evidence and onshore/offshore sequencing for partner pathways.",
    image: { src: "/images/brisbane-skyline.v2.webp", alt: "Brisbane riverfront — partner pathway planning" },
  },
  {
    href: "/employer-sponsored-visas",
    title: "Employer-sponsored",
    description: "Where employer-backed nomination fits alongside your occupation story.",
    image: { src: "/images/visual-strip-destinations.jpg", alt: "Urban skylines — employer-sponsored pathway context" },
  },
  {
    href: "/contact",
    title: "Speak with the team",
    description: "Bring your timeline and documents for a focused human conversation.",
    image: { src: "/images/brisbane-skyline.jpg", alt: "Brisbane skyline — contact MinRosh Migration" },
  },
];

export function MigrationPopularRoutes() {
  return (
    <section className="migration-popular-routes" aria-labelledby="migration-popular-routes-heading">
      <div className="migration-popular-routes__head">
        <p className="section-label">Popular routes</p>
        <h2 id="migration-popular-routes-heading">Explore pathways often paired with Sri Lanka → Australia planning</h2>
        <p>
          These hubs explain sequencing and evidence habits in plain language. Always confirm current criteria on{" "}
          <a href="https://immi.homeaffairs.gov.au/" target="_blank" rel="noreferrer">
            immi.homeaffairs.gov.au
          </a>{" "}
          before lodging.
        </p>
      </div>
      <div className="migration-popular-routes__track no-scrollbar" role="list">
        {ROUTES.map((route) => (
          <Link key={route.href} href={route.href} className="migration-popular-routes__card" role="listitem">
            <div className="migration-popular-routes__thumb">
              <PublicFileImg
                src={route.image.src}
                alt={route.image.alt}
                width={640}
                height={400}
                className="h-full w-full object-cover"
                sizes="300px"
              />
            </div>
            <div className="migration-popular-routes__body">
              <h3>{route.title}</h3>
              <p>{route.description}</p>
            </div>
            <span className="migration-popular-routes__cta">Open hub →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
