export default function AdminLoading() {
  return (
    <main id="main-content" className="admin-root min-h-screen bg-background px-4 py-6 text-foreground md:px-6">
      <section className="mx-auto w-full max-w-6xl animate-pulse rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 h-7 w-56 rounded bg-muted" />
        <div className="mb-8 h-4 w-80 max-w-full rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-24 rounded-xl bg-muted" />
        </div>
        <div className="mt-6 h-72 rounded-2xl bg-muted" />
      </section>
    </main>
  );
}
