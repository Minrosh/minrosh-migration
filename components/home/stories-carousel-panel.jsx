"use client";
import { useState } from "react";
import { PublicFileImg } from "../public-file-img";

export function StoriesCarouselPanel({ siteData, isActive }) {
  const [storyIndex, setStoryIndex] = useState(0);
  const stories = Array.isArray(siteData?.successStories) ? siteData.successStories : [];
  const activeStory = stories[storyIndex] ?? null;
  if (!activeStory) return null;

  return (
    <section id="stories" className={`tab-panel ${isActive ? "is-active" : ""} px-4 py-16 md:py-24`}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-12 text-center max-w-4xl mx-auto animate-fade-up">
          <p className="inline-block text-brand-rose font-bold uppercase tracking-wider text-sm mb-3 bg-brand-rose/10 px-4 py-1.5 rounded-full border border-brand-rose/20 shadow-sm">
            Success Stories
          </p>
          <h2 className="text-[2rem] md:text-4xl lg:text-5xl font-extrabold text-brand-plum mb-5 tracking-tight leading-tight">
            Featured migration outcomes that build confidence.
          </h2>
          <p className="text-lg text-brand-plum/70 font-medium">
            Real pathways realized through structured, step-by-step guidance.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[minmax(180px,1fr)]">
          <article className="premium-card relative overflow-hidden rounded-3xl border border-brand-plum/20 bg-brand-plum p-7 text-brand-cream bento-hover md:col-span-2 md:row-span-2">
            <span className="absolute right-4 top-4 inline-flex rounded-full bg-brand-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-plum">
              Verified Approval
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">{activeStory.visa}</p>
            <blockquote className="mt-4 text-2xl font-medium leading-relaxed text-white">
              &ldquo;{activeStory.quote}&rdquo;
            </blockquote>
            <div className="mt-8 border-t border-white/20 pt-5">
              <h3 className="text-xl font-extrabold text-white">{activeStory.name}</h3>
              <p className="mt-1 text-sm text-white/75">
                {activeStory.location} • {activeStory.timeline}
              </p>
              <p className="mt-2 inline-block rounded-md bg-white/10 px-3 py-1 text-sm font-semibold text-brand-gold">
                {activeStory.outcome}
              </p>
            </div>
          </article>

          {stories.map((story, index) => (
            <button
              key={`${story.name}-${index}`}
              type="button"
              onClick={() => setStoryIndex(index)}
              className={`premium-card relative text-left overflow-hidden rounded-3xl border p-6 bg-white transition-all duration-300 bento-hover ${
                storyIndex === index ? "border-brand-plum/30 ring-2 ring-brand-plum/10 bg-brand-plum/5" : "border-brand-plum/5"
              }`}
            >
              <span className="absolute right-4 top-4 inline-flex rounded-full bg-brand-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-plum">
                Verified Approval
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">{story.visa}</p>
              <h3 className="mt-3 text-lg font-extrabold text-brand-plum">{story.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{story.timeline}</p>
              <p className="mt-3 text-sm text-brand-plum/75 line-clamp-3">&ldquo;{story.quote}&rdquo;</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
