import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroBlock({ props = {} }) {
  const p = props;
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {p.eyebrow ? <p className="text-sm text-muted-foreground">{p.eyebrow}</p> : null}
      {p.heading ? <h2 className="mt-2 text-2xl font-semibold tracking-tight">{p.heading}</h2> : null}
      {p.subheading ? <p className="mt-2 text-muted-foreground">{p.subheading}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        {p.primaryCta?.text ? (
          <Button asChild variant="default">
            <Link href={p.primaryCta.href || "#"}>{p.primaryCta.text}</Link>
          </Button>
        ) : null}
        {p.secondaryCta?.text ? (
          <Button asChild variant="outline">
            <Link href={p.secondaryCta.href || "#"}>{p.secondaryCta.text}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
