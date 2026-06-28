export function TextBlock({ props = {} }) {
  const p = props;
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {p.heading ? <h2 className="text-xl font-semibold tracking-tight">{p.heading}</h2> : null}
      {Array.isArray(p.paragraphs)
        ? p.paragraphs.map((para) => (
            <p key={para.slice(0, 40)} className="mt-3 text-muted-foreground">
              {para}
            </p>
          ))
        : null}
    </section>
  );
}
