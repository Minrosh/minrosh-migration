"use client";

import Link from "next/link";
import { MotionReveal } from "./ui/motion-wrapper";

const TESTIMONIALS = [
  {
    name: "Ahmed",
    visa: "Skilled 190",
    quote: "MinRosh changed my life. They found a state nomination I didn't even know existed.",
  },
  {
    name: "Sarah",
    visa: "Partner 820",
    quote: "The evidence binder they helped me build was so professional.",
  },
  {
    name: "R. Fernando",
    visa: "Skilled 189",
    quote: "The structured points review made the process feel manageable. We knew exactly what to improve.",
  },
  {
    name: "S. Wick",
    visa: "Student 500",
    quote: "Mapping my education to PR was the best decision I made for my future.",
  },
];

export function HomeDeferredCarousels({ newsItems = [] }) {
  return (
    <>
      <section className="ultra-snap-section bg-brand-cream/30 overflow-hidden">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <MotionReveal className="text-center mb-12" y={20}>
            <p className="text-brand-rose font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-3">
              Client Trust
            </p>
            <h2 className="text-3xl font-black text-brand-plum tracking-tighter leading-[1.1] sm:text-4xl md:text-5xl">
              Success <span className="text-brand-rose">Stories.</span>
            </h2>
          </MotionReveal>

          <div className="relative">
            <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
              {TESTIMONIALS.map((item) => (
                <div key={`${item.name}-${item.visa}`} className="flex-none w-[85%] sm:w-[450px] snap-center">
                  <div className="glass-card p-8 sm:p-10 h-full shadow-xl transition-all hover:shadow-2xl border-white/40">
                    <div className="flex text-yellow-400 gap-1 mb-6">★★★★★</div>
                    <p className="text-lg sm:text-xl font-bold text-brand-plum italic mb-8 leading-relaxed">
                      &quot;{item.quote}&quot;
                    </p>
                    <p className="font-black text-brand-rose uppercase tracking-widest text-[10px] sm:text-xs">
                      {item.name} — {item.visa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2, 3].map((dot) => (
                <div key={dot} className="h-1.5 w-1.5 rounded-full bg-brand-plum/20" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ultra-snap-section bg-white">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <MotionReveal y={20}>
              <p className="text-brand-rose font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-3">
                Knowledge Base
              </p>
              <h2 className="text-3xl font-black text-brand-plum tracking-tighter sm:text-4xl md:text-5xl">
                Latest Insights.
              </h2>
            </MotionReveal>
            <MotionReveal delay={0.1} y={10}>
              <Link
                href="/immigration-news"
                className="font-black text-brand-plum underline decoration-2 underline-offset-8 hover:text-brand-rose transition-colors"
              >
                View all news <span>→</span>
              </Link>
            </MotionReveal>
          </div>

          <div className="relative">
            <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
              {newsItems.map((item) => (
                <div key={item.id} className="flex-none w-[85%] sm:w-[380px] snap-center">
                  <Link href={item.href} className="group block h-full">
                    <div className="glass-card p-6 sm:p-8 h-full flex flex-col hover:bg-brand-cream/10 transition-all border-transparent hover:border-brand-rose/20 shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <span className="bg-brand-plum/5 text-brand-plum text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                          {item.country}
                        </span>
                        <span className="text-[10px] font-bold text-brand-plum/40 uppercase tracking-widest">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-brand-plum mb-4 group-hover:text-brand-rose transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-brand-plum/50 font-medium leading-relaxed line-clamp-3 mb-8">
                        {item.summary}
                      </p>
                      <div className="mt-auto flex items-center gap-2 text-xs font-black text-brand-plum group-hover:gap-4 transition-all uppercase tracking-widest">
                        Read Story <span>→</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
