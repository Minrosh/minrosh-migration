"use client";
import { useState } from "react";
import { PublicFileImg } from "../public-file-img";

export function StoriesCarouselPanel({ siteData, isActive }) {
  const [storyIndex, setStoryIndex] = useState(0);
  const activeStory = siteData.successStories[storyIndex];

  function goToNextStory() {
    setStoryIndex((current) => (current + 1) % siteData.successStories.length);
  }

  function goToPreviousStory() {
    setStoryIndex((current) =>
      current === 0 ? siteData.successStories.length - 1 : current - 1
    );
  }

  return (
    <section id="stories" className={`tab-panel ${isActive ? "is-active" : ""} py-10 md:py-14 px-4 sm:px-6`}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-12 text-center max-w-2xl mx-auto animate-fade-up">
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
        <div className="relative bg-white/85 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden mt-8 mb-12 flex flex-col-reverse lg:flex-row group animate-fade-up-delay hover:-translate-y-1 transition-transform duration-300">
          <div className="lg:w-1/2 p-8 sm:p-14 flex flex-col justify-center relative">
            <div className="absolute top-6 left-8 text-[12rem] leading-none text-brand-cream font-serif -z-10 select-none">
              &ldquo;
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <span className="bg-brand-plum text-brand-cream text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full shadow-md">
                  Outcome Verified
                </span>
                <p className="text-brand-rose font-bold bg-brand-rose/10 px-4 py-2 rounded-xl text-sm border border-brand-rose/20">
                  {activeStory.visa}
                </p>
              </div>
              <blockquote className="text-2xl sm:text-3xl text-brand-plum font-medium leading-relaxed mb-10 transition-opacity duration-300">
                &ldquo;{activeStory.quote}&rdquo;
              </blockquote>
              <div className="mt-auto border-t border-brand-plum/10 pt-8">
                <h3 className="text-xl font-extrabold text-brand-plum mb-1">{activeStory.name}</h3>
                <div className="flex items-center gap-2 text-brand-plum/60 text-sm font-medium mb-3">
                  <span className="text-brand-gold">📍</span> {activeStory.location}
                  <span className="mx-2 opacity-30">•</span>
                  <span>⏱ {activeStory.timeline}</span>
                </div>
                <p className="text-brand-rose font-semibold bg-brand-rose/5 inline-block px-3 py-1 rounded-md">
                  Status: {activeStory.outcome}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-10">
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-cream/70 border border-brand-plum/10 text-brand-plum hover:bg-brand-rose hover:text-white hover:border-brand-rose hover:shadow-lg transition-all duration-300"
                  onClick={goToPreviousStory}
                  aria-label="Previous success story"
                >
                  <span className="text-xl leading-none">←</span>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-plum border border-brand-plum text-white hover:bg-brand-rose hover:border-brand-rose hover:-translate-y-1 hover:shadow-xl shadow-brand-plum/30 transition-all duration-300"
                  onClick={goToNextStory}
                  aria-label="Next success story"
                >
                  <span className="text-xl leading-none">→</span>
                </button>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 relative min-h-[320px] lg:min-h-full overflow-hidden bg-brand-plum border-b lg:border-b-0 lg:border-l border-white/40">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-plum/35 via-transparent to-transparent z-10"></div>
            <PublicFileImg
              src={storyIndex % 2 === 0 ? "/images/team-office-real.jpg" : "/images/brisbane-skyline.jpg"}
              alt="MinRosh migration guidance and Brisbane lifestyle"
              width={1200}
              height={900}
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {siteData.successStories.map((story, index) => (
            <button
              key={story.name}
              type="button"
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
                storyIndex === index
                  ? "border-brand-plum bg-brand-cream/40 shadow-md ring-2 ring-brand-plum/10 scale-100"
                  : "border-white/70 bg-white/75 backdrop-blur-md hover:border-brand-rose/40 hover:bg-brand-cream/50 hover:-translate-y-1 shadow-sm"
              }`}
              onClick={() => setStoryIndex(index)}
            >
              <strong className={`block text-lg mb-1 transition-colors ${storyIndex === index ? "text-brand-plum" : "text-brand-plum/85 group-hover:text-brand-plum"}`}>
                {story.name}
              </strong>
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${storyIndex === index ? "text-brand-rose" : "text-brand-gold"}`}>
                  {story.visa}
                </span>
                <p className="text-brand-plum/55 text-sm font-medium">{story.timeline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
