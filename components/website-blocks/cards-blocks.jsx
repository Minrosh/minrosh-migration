import Link from "next/link";

function CardsBlock({ props = {}, variant = "service" }) {
  const cards = Array.isArray(props.cards) ? props.cards : [];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {props.title ? <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2> : null}
      <ul className={`mt-4 grid gap-4 ${variant === "country" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {cards.map((card) => (
          <li key={`${card.title}-${card.href}`} className="rounded-lg border border-border p-4">
            {card.country ? <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.country}</p> : null}
            {card.title ? <h3 className="mt-1 font-medium">{card.title}</h3> : null}
            {card.body ? <p className="mt-2 text-sm text-muted-foreground">{card.body}</p> : null}
            {card.href ? (
              <Link href={card.href} className="mt-3 inline-block text-sm font-medium text-brand-plum hover:underline">
                Learn more
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ServiceCardsBlock({ props }) {
  return <CardsBlock props={props} variant="service" />;
}

export function CountryCardsBlock({ props }) {
  return <CardsBlock props={props} variant="country" />;
}
