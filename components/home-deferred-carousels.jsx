import Link from "next/link";

export function HomeDeferredCarousels({ newsItems = [] }) {
  if (!newsItems.length) return null;

  return (
    <section className="home-section relative isolate overflow-x-clip rounded-[2rem] border border-brand-plum/8 bg-white p-4 shadow-sm sm:p-6">
      <div className="relative z-10 mx-auto w-full min-w-0">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4c404d]">News &amp; updates</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-brand-plum sm:text-2xl">Immigration news</h2>
          </div>
          <Link
            href="/immigration-news"
            className="inline-flex min-h-[48px] touch-manipulation items-center text-sm font-bold text-brand-plum underline decoration-2 underline-offset-8 transition-colors hover:text-brand-rose"
          >
            View all news <span className="ml-2">→</span>
          </Link>
        </div>

        <ul className="relative z-10 grid min-w-0 list-none grid-cols-1 gap-4 pl-0 sm:grid-cols-2 lg:grid-cols-4">
          {newsItems.map((item) => (
            <li key={item.id} className="min-w-0">
              <Link href={item.href} className="group block h-full">
                <div className="flex h-full flex-col rounded-2xl border border-brand-plum/[0.06] bg-white p-5 shadow-sm transition-colors hover:border-brand-rose/20 sm:p-6">
                  <h3 className="text-base font-bold leading-tight text-brand-plum transition-colors group-hover:text-brand-rose">
                    {item.title}
                  </h3>
                  <p className="mb-4 mt-3 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/70">
                    {item.summary}
                  </p>
                  <p className="text-xs font-medium text-[#4c404d]">
                    <span>{item.country}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{item.date}</span>
                  </p>
                  <div className="mt-4 flex min-h-[44px] items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-plum/70">
                    Read article <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
