export function ProcessStepsBlock({ props = {} }) {
  const steps = Array.isArray(props.steps) ? props.steps : [];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {props.title ? <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2> : null}
      <ol className="mt-4 space-y-4">
        {steps.map((step, index) => (
          <li key={`${step.title}-${index}`} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-plum/10 text-sm font-semibold text-brand-plum">
              {index + 1}
            </span>
            <div>
              {step.title ? <h3 className="font-medium">{step.title}</h3> : null}
              {step.body ? <p className="mt-1 text-sm text-muted-foreground">{step.body}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FAQBlock({ props = {} }) {
  const items = Array.isArray(props.items) ? props.items : [];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {props.title ? <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2> : null}
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <details key={item.question} className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">{item.question}</summary>
            {item.answer ? <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p> : null}
          </details>
        ))}
      </div>
    </section>
  );
}

export function CTASectionBlock({ props = {} }) {
  return (
    <section className="rounded-xl border border-brand-plum/20 bg-brand-plum/5 p-6">
      {props.heading ? <h2 className="text-xl font-semibold tracking-tight">{props.heading}</h2> : null}
      {props.body ? <p className="mt-2 text-muted-foreground">{props.body}</p> : null}
      {props.button?.text ? (
        <a
          href={props.button.href || "#"}
          className="mt-4 inline-flex rounded-md bg-brand-plum px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          {props.button.text}
        </a>
      ) : null}
    </section>
  );
}

export function TrustStatsBlock({ props = {} }) {
  const items = Array.isArray(props.items) ? props.items : [];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {props.title ? <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2> : null}
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`}>
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="text-2xl font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ImageTextBlock({ props = {} }) {
  const imageFirst = props.imagePosition !== "right";
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className={`grid gap-6 ${props.image ? "lg:grid-cols-2" : ""}`}>
        {imageFirst && props.image ? (
          <div className="min-h-[12rem] rounded-lg bg-muted" aria-hidden />
        ) : null}
        <div>
          {props.heading ? <h2 className="text-xl font-semibold tracking-tight">{props.heading}</h2> : null}
          {props.body ? <p className="mt-3 text-muted-foreground">{props.body}</p> : null}
        </div>
        {!imageFirst && props.image ? (
          <div className="min-h-[12rem] rounded-lg bg-muted" aria-hidden />
        ) : null}
      </div>
    </section>
  );
}

export function TestimonialBlock({ props = {} }) {
  const items = Array.isArray(props.items) ? props.items : [];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {props.title ? <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2> : null}
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li key={`${item.name}-${item.quote?.slice(0, 20)}`} className="rounded-lg border border-border p-4">
            {item.quote ? <blockquote className="text-muted-foreground">&ldquo;{item.quote}&rdquo;</blockquote> : null}
            {item.name ? <p className="mt-2 font-medium">{item.name}</p> : null}
            {item.context ? <p className="text-sm text-muted-foreground">{item.context}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
