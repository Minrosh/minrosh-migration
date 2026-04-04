"use client";

import { useState } from "react";
import Image from "next/image";

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
    <section id="stories" className={`tab-panel ${isActive ? "is-active" : ""}`}>
      <div className="panel-hero">
        <div>
          <p className="section-label">Success Stories</p>
          <h2>Featured migration outcomes that build confidence before consultation</h2>
        </div>
      </div>
      <div className="story-feature bento-hover">
        <div className="story-feature__copy">
          <div className="story-card__top">
            <p className="story-card__visa">{activeStory.visa}</p>
            <span className="story-card__badge">Outcome</span>
          </div>
          <div className="story-card__quote-mark" aria-hidden="true">
            &ldquo;
          </div>
          <blockquote>{activeStory.quote}</blockquote>
          <div className="story-card__person">
            <h3>{activeStory.name}</h3>
            <p className="story-card__location">{activeStory.location}</p>
            <p className="story-card__timeline">{activeStory.timeline}</p>
          </div>
          <p className="story-card__outcome">{activeStory.outcome}</p>
          <div className="story-feature__actions">
            <button
              type="button"
              className="story-nav"
              onClick={goToPreviousStory}
              aria-label="Previous success story"
            >
              Previous
            </button>
            <button
              type="button"
              className="story-nav story-nav--primary"
              onClick={goToNextStory}
              aria-label="Next success story"
            >
              Next
            </button>
          </div>
        </div>
        <div className="story-feature__media">
          <Image
            src={storyIndex % 2 === 0 ? "/images/team-office-real.jpg" : "/images/brisbane-skyline.jpg"}
            alt="MinRosh migration guidance and Brisbane lifestyle"
            width={1200}
            height={900}
          />
        </div>
      </div>
      <div className="stories-grid stories-grid--summary">
        {siteData.successStories.map((story, index) => (
          <button
            key={story.name}
            type="button"
            className={`story-summary bento-hover ${storyIndex === index ? "is-active" : ""}`}
            onClick={() => setStoryIndex(index)}
          >
            <strong>{story.name}</strong>
            <span>{story.visa}</span>
            <p>{story.timeline}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
