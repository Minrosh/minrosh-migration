"use client";

export default function AdminError({ reset }) {
  return (
    <main id="main-content" className="admin-root min-h-screen bg-background px-4 py-6 text-foreground md:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Admin console</p>
        <h1 className="mt-2 text-2xl font-bold">Unable to load this admin view.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This can happen when local seed data is rebuilding or a background job is still starting.
        </p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => reset()}>
          Retry admin page
        </button>
      </section>
    </main>
  );
}
