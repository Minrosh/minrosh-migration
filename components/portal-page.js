"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculateQuizResult, quizOptions } from "../lib/quiz";

const tabs = [
  { id: "home", label: "Home" },
  { id: "quiz", label: "Visa Quiz" },
  { id: "pathways", label: "PR Pathways" },
  { id: "services", label: "Services" },
  { id: "stories", label: "Success Stories" },
  { id: "contact", label: "Contact" },
];

const quizSteps = [
  {
    id: "basics",
    label: "Basics",
    title: "Profile Basics",
    description: "Start with age and whether your occupation sits on a relevant skilled list.",
    fields: ["occupationName", "age", "occupation"],
  },
  {
    id: "english",
    label: "English",
    title: "English Proficiency",
    description: "Your English result can materially change invitation competitiveness.",
    fields: ["english"],
  },
  {
    id: "work",
    label: "Work",
    title: "Work Experience",
    description: "Count overseas skilled experience carefully and conservatively.",
    fields: ["overseasExperience"],
  },
  {
    id: "education",
    label: "Education",
    title: "Education",
    description: "Your highest qualification contributes to the overall points profile.",
    fields: ["education"],
  },
  {
    id: "partner",
    label: "Partner",
    title: "Partner",
    description: "Partner status can add valuable points and change your strategy.",
    fields: ["partner"],
  },
];

const initialQuiz = {
  occupationName: "",
  age: "",
  occupation: "unsure",
  english: "",
  overseasExperience: "",
  education: "",
  partner: "",
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredCountry: "Australia",
  mainNeed: "Skilled Migration",
  message: "",
};

function fieldIsComplete(field, quizForm) {
  if (field === "occupationName") return Boolean(quizForm.occupationName.trim());
  return Boolean(quizForm[field]);
}

export function PortalPage({ siteData, newsData }) {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [quizForm, setQuizForm] = useState(initialQuiz);
  const [quizStepIndex, setQuizStepIndex] = useState(0);
  const [contactForm, setContactForm] = useState(initialForm);
  const [contactState, setContactState] = useState({ status: "idle", message: "" });
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask a preliminary question about Australian migration pathways and I'll help you think through the next step.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatState, setChatState] = useState({ loading: false, error: "" });

  const quizResult = useMemo(() => calculateQuizResult(quizForm), [quizForm]);
  const currentQuizStep = quizSteps[quizStepIndex];
  const activeStory = siteData.successStories[storyIndex];
  const quizStepProgress = ((quizStepIndex + 1) / quizSteps.length) * 100;
  const canAdvance = currentQuizStep.fields.every((field) => fieldIsComplete(field, quizForm));
  const quizComplete = quizSteps.every((step) =>
    step.fields.every((field) => fieldIsComplete(field, quizForm))
  );

  useEffect(() => {
    document.body.dataset.menu = menuOpen ? "open" : "closed";
    return () => {
      document.body.dataset.menu = "closed";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleScroll() {
      setHeaderCompact(window.scrollY > 18);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function syncTabWithHash() {
      const nextTab = window.location.hash.replace("#", "");
      if (tabs.some((tab) => tab.id === nextTab)) {
        setActiveTab(nextTab);
      }
    }

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  useEffect(() => {
    if (!quizResult || !quizComplete) return;
    const summary = [
      `Quiz result: Estimated ${quizResult.score} points.`,
      quizResult.marketInsight ? `2026 Market Insight: ${quizResult.marketInsight}` : "",
      `Occupation: ${quizResult.selectedOccupation}.`,
      `Breakdown: ${quizResult.pointBreakdownText}.`,
    ]
      .filter(Boolean)
      .join(" ");
    setContactForm((current) => {
      if (current.message.includes("Quiz result:")) {
        const nextMessage = current.message.replace(/Quiz result:[\s\S]*$/m, "").trim();
        return { ...current, message: nextMessage ? `${nextMessage}\n\n${summary}` : summary };
      }
      return {
        ...current,
        message: current.message.trim() ? `${current.message.trim()}\n\n${summary}` : summary,
      };
    });
  }, [quizComplete, quizResult]);

  const currentPathwayStep =
    activeTab === "contact"
      ? "Visa Lodgement"
      : activeTab === "pathways"
        ? "Skills Assessment"
        : activeTab === "quiz"
          ? "Initial Assessment"
          : "Initial Assessment";

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/#${tabId}`);
    }
  }

  function setQuizValue(key, value) {
    setQuizForm((current) => ({ ...current, [key]: value }));
  }

  function goToNextQuizStep() {
    if (!canAdvance) return;
    setQuizStepIndex((current) => Math.min(current + 1, quizSteps.length - 1));
  }

  function goToPreviousQuizStep() {
    setQuizStepIndex((current) => Math.max(current - 1, 0));
  }

  function handleContactChange(event) {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
  }

  function goToNextStory() {
    setStoryIndex((current) => (current + 1) % siteData.successStories.length);
  }

  function goToPreviousStory() {
    setStoryIndex((current) =>
      current === 0 ? siteData.successStories.length - 1 : current - 1
    );
  }

  async function handleContactSubmit(event) {
    event.preventDefault();
    setContactState({ status: "loading", message: "" });
    const payload = {
      ...contactForm,
      quizSummary: quizResult
        ? `Estimated points: ${quizResult.score}. ${quizResult.pointBreakdownText}.`
        : "",
    };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not submit enquiry.");
      setContactState({
        status: "success",
        message:
          data.warning ||
          "Your enquiry has been received. We will review it and respond shortly.",
      });
      setContactForm(initialForm);
    } catch (error) {
      setContactState({
        status: "error",
        message: error.message || "Could not submit enquiry.",
      });
    }
  }

  async function handleChatSubmit(event) {
    event.preventDefault();
    if (!chatInput.trim()) return;
    const nextMessages = [...chatMessages, { role: "user", content: chatInput.trim() }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatState({ loading: true, error: "" });
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (!response.ok || !reply) throw new Error(data.error || "Chat is not available right now.");
      setChatMessages((current) => [...current, { role: "assistant", content: reply }]);
      setChatState({ loading: false, error: "" });
    } catch (error) {
      setChatState({ loading: false, error: error.message || "Chat is unavailable right now." });
    }
  }

  const hero = (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__glass">
          <p className="eyebrow">{siteData.hero.eyebrow}</p>
          <h1>{siteData.hero.title}</h1>
          <p className="hero__lead">{siteData.hero.description}</p>
          <div className="hero__actions">
            <button type="button" className="btn btn-primary" onClick={() => handleTabChange("quiz")}>
              {siteData.hero.primaryCta}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => handleTabChange("contact")}>
              {siteData.hero.secondaryCta}
            </button>
          </div>
          <p className="hero__trust-note">
            Brisbane-based migration guidance. OMARA Code of Conduct aligned. MARN placeholder: 0000000.
          </p>
          <div className="hero__stats">
            {siteData.stats.map((stat) => (
              <div key={stat.label} className="hero__stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hero__media" aria-hidden="true">
        <Image
          src="/images/brisbane-skyline.jpg"
          alt="Brisbane skyline and river at golden hour"
          width={1600}
          height={900}
          priority
        />
      </div>
    </section>
  );

  const homeTab = (
    <section className={`tab-panel ${activeTab === "home" ? "is-active" : ""}`}>
      {hero}

      <section className="country-banner" aria-label="Countries MinRosh supports">
        {["Australia", "New Zealand", "Canada", "United Kingdom"].map((country) => (
          <span key={country}>{country}</span>
        ))}
      </section>

      <section className="trust-strip">
        {siteData.services.slice(0, 3).map((service) => (
          <Link key={service.title} href={service.href} className="trust-strip__item bento-hover trust-strip__link">
            <p className="section-label">{service.title}</p>
            <p>{service.summary}</p>
          </Link>
        ))}
      </section>

      <section className="split-section">
        <div>
          <p className="section-label">Why Choose MinRosh</p>
          <h2>{siteData.about.title}</h2>
          <p>{siteData.about.body}</p>
          <ul className="feature-list">
            {siteData.about.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="image-card bento-hover">
          <Image
            src="/images/team-office-real.jpg"
            alt="Professional team meeting in a modern office"
            width={1200}
            height={800}
          />
        </div>
      </section>

      <section className="news-section">
        <div className="section-head">
          <div>
            <p className="section-label">Official Update Board</p>
            <h2>Migration guides and updates built to answer real client questions</h2>
          </div>
          <button type="button" className="text-button" onClick={() => handleTabChange("contact")}>
            Ask a question
          </button>
        </div>
        <div className="news-filters" aria-hidden="true">
          {["All", "Australia", "Skilled", "Student", "Partner"].map((item, index) => (
            <span key={item} className={`news-filter ${index === 0 ? "is-active" : ""}`}>
              {item}
            </span>
          ))}
        </div>
        <div className="news-grid">
          {newsData.map((item) => (
            <Link key={item.title} href={item.href} className="news-card bento-hover news-card__link">
              <time dateTime={item.date}>{new Date(item.date).toLocaleDateString("en-AU")}</time>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <div className="section-head">
          <div>
            <p className="section-label">Frequently Asked Questions</p>
            <h2>Answers to common Australian visa questions</h2>
          </div>
        </div>
        <div className="faq-grid">
          {siteData.faq.map((item) => (
            <article key={item.question} className="faq-card bento-hover">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );

  const quizTab = (
    <section id="quiz" className={`tab-panel ${activeTab === "quiz" ? "is-active" : ""}`}>
      <div className="panel-hero">
        <div>
          <p className="section-label">2026 Points Wizard</p>
          <h2>Work through your profile in a clean 5-step assessment</h2>
          <p>
            This wizard is designed to feel closer to a real intake review while still remaining
            preliminary guidance.
          </p>
        </div>
        <div className="current-step">
          <span>Current Step</span>
          <strong>{currentQuizStep.title}</strong>
        </div>
      </div>

      <div className="quiz-shell">
        <section className="quiz-card bento-hover">
          <div className="quiz-wizard__meta">
            <div>
              <p className="section-label">{currentQuizStep.label}</p>
              <h3>{currentQuizStep.title}</h3>
            </div>
            <span className="quiz-wizard__count">
              {quizStepIndex + 1} / {quizSteps.length}
            </span>
          </div>

          <div className="quiz-progress" aria-hidden="true">
            <span className="quiz-progress__bar" style={{ width: `${quizStepProgress}%` }} />
          </div>

          <div className="quiz-step">
            <p className="quiz-step__prompt">{currentQuizStep.description}</p>

            {currentQuizStep.id === "basics" ? (
              <div className="quiz-step__stack">
                <label className="quiz-step__field">
                  <span>Occupation / Field</span>
                  <input
                    type="text"
                    value={quizForm.occupationName}
                    onChange={(event) => setQuizValue("occupationName", event.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </label>
                <label className="quiz-step__field">
                  <span>Age</span>
                  <select
                    value={quizForm.age}
                    onChange={(event) => setQuizValue("age", event.target.value)}
                  >
                    <option value="">Choose one</option>
                    {quizOptions.age.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="quiz-options">
                  {quizOptions.occupationStatus.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quiz-option ${
                        quizForm.occupation === option.value ? "is-selected" : ""
                      }`}
                      onClick={() => setQuizValue("occupation", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {currentQuizStep.id === "english" ? (
              <div className="quiz-options">
                {quizOptions.english.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.english === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("english", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "work" ? (
              <div className="quiz-options">
                {quizOptions.overseasExperience.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.overseasExperience === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("overseasExperience", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "education" ? (
              <div className="quiz-options">
                {quizOptions.education.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.education === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("education", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "partner" ? (
              <div className="quiz-options">
                {quizOptions.partner.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.partner === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("partner", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="quiz-wizard__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goToPreviousQuizStep}
              disabled={quizStepIndex === 0}
            >
              Previous
            </button>
            {quizStepIndex < quizSteps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={goToNextQuizStep}
                disabled={!canAdvance}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleTabChange("contact")}
                disabled={!quizComplete}
              >
                Continue to Full Report
              </button>
            )}
          </div>
        </section>

        <aside className="quiz-result bento-hover">
          <p className="section-label">Result</p>
          {quizResult && quizComplete ? (
            <>
              <h3>
                {quizResult.restricted
                  ? "Alternative pathway review needed"
                  : `${quizResult.score} points estimated`}
              </h3>
              <ul className="result-list">
                {quizResult.messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
              {quizResult.marketInsight ? (
                <div className="insight-card">
                  <span className="insight-card__badge">2026 Market Insight</span>
                  <p>{quizResult.marketInsight}</p>
                </div>
              ) : null}
              <div className="points-breakdown">
                <h4>Points Breakdown</h4>
                <ul>
                  {quizResult.pointsBreakdown.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.points} pts</strong>
                    </li>
                  ))}
                </ul>
              </div>
              {quizResult.boosters.length ? (
                <div className="booster-card">
                  <h4>Path to PR</h4>
                  <ul className="result-list">
                    {quizResult.boosters.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <button type="button" className="btn btn-primary" onClick={() => handleTabChange("contact")}>
                Get Full Report
              </button>
            </>
          ) : (
            <>
              <h3>Build your profile</h3>
              <p>
                Complete each step to reveal your score, a 2026 market insight, and a pathway
                improvement checklist.
              </p>
            </>
          )}
        </aside>
      </div>
    </section>
  );

  const pathwaysTab = (
    <section id="pathways" className={`tab-panel ${activeTab === "pathways" ? "is-active" : ""}`}>
      <div className="panel-hero">
        <div>
          <p className="section-label">5-Step Pathway to PR</p>
          <h2>A clearer journey from first review to visa lodgement</h2>
        </div>
        <div className="current-step">
          <span>Current Step</span>
          <strong>{currentPathwayStep}</strong>
        </div>
      </div>
      <div className="timeline">
        {siteData.pathwaySteps.map((step, index) => (
          <article
            key={step.title}
            className={`timeline-step bento-hover ${index === 0 ? "is-current" : ""}`}
          >
            <span className="timeline-step__number">{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );

  const servicesTab = (
    <section id="services" className={`tab-panel ${activeTab === "services" ? "is-active" : ""}`}>
      <div className="panel-hero">
        <div>
          <p className="section-label">Services</p>
          <h2>Support shaped around real migration decisions</h2>
        </div>
      </div>
      <div className="services-layout">
        {siteData.services.map((service) => (
          <Link key={service.title} href={service.href} className="service-block bento-hover service-block__link">
            <span className="service-block__eyebrow">Specialist Pathway</span>
            <h3>{service.title}</h3>
            <p>{service.summary}</p>
            <ul className="feature-list">
              {service.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <span className="service-block__linkline">
              Learn more <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );

  const storiesTab = (
    <section id="stories" className={`tab-panel ${activeTab === "stories" ? "is-active" : ""}`}>
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
            <button type="button" className="story-nav" onClick={goToPreviousStory} aria-label="Previous success story">
              Previous
            </button>
            <button type="button" className="story-nav story-nav--primary" onClick={goToNextStory} aria-label="Next success story">
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

  const contactTab = (
    <section id="contact" className={`tab-panel ${activeTab === "contact" ? "is-active" : ""}`}>
      <div className="contact-layout">
        <div className="contact-copy">
          <p className="section-label">Contact</p>
          <h2>Start with a clear enquiry and we&apos;ll help shape the next steps.</h2>
          <p>
            Share your background, timing, and main goal. We&apos;ll review the enquiry and respond
            with the most relevant next move.
          </p>
          <div className="contact-details">
            <div>
              <span>Email</span>
              <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
            </div>
            <div>
              <span>Phone</span>
              <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
            </div>
            <div>
              <span>WhatsApp</span>
              <a
                href={`https://wa.me/${siteData.brand.whatsapp}?text=Hi%20MinRosh%20Migration,%20I%20am%20interested%20in%20Australian%20visa%20options.`}
                target="_blank"
                rel="noreferrer"
              >
                +61 478 100 542
              </a>
            </div>
          </div>
        </div>

        <form className="contact-form bento-hover" onSubmit={handleContactSubmit}>
          <div className="contact-grid">
            <label>
              <span>First name</span>
              <input name="firstName" value={contactForm.firstName} onChange={handleContactChange} required />
            </label>
            <label>
              <span>Last name</span>
              <input name="lastName" value={contactForm.lastName} onChange={handleContactChange} />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} required />
            </label>
            <label>
              <span>Phone</span>
              <input name="phone" value={contactForm.phone} onChange={handleContactChange} />
            </label>
            <label>
              <span>Preferred country</span>
              <select name="preferredCountry" value={contactForm.preferredCountry} onChange={handleContactChange}>
                <option>Australia</option>
                <option>New Zealand</option>
                <option>Canada</option>
                <option>United Kingdom</option>
              </select>
            </label>
            <label>
              <span>Main need</span>
              <select name="mainNeed" value={contactForm.mainNeed} onChange={handleContactChange}>
                <option>Skilled Migration</option>
                <option>Employer-Sponsored</option>
                <option>Student Pathway</option>
                <option>Family / Complex Case</option>
              </select>
            </label>
            <label className="contact-grid__full">
              <span>Your enquiry</span>
              <textarea
                name="message"
                rows="6"
                value={contactForm.message}
                onChange={handleContactChange}
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={contactState.status === "loading"}>
            {contactState.status === "loading" ? "Sending..." : "Submit enquiry"}
          </button>
          {contactState.message ? (
            <p className={`form-feedback is-${contactState.status}`}>{contactState.message}</p>
          ) : null}
        </form>
      </div>

      <section className="assistant-panel">
        <div className="section-head">
          <div>
            <p className="section-label">AI Assistant</p>
            <h2>Ask a preliminary migration question</h2>
          </div>
        </div>
        <div className="assistant-chat bento-hover">
          <div className="assistant-chat__log">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`assistant-chat__message assistant-chat__message--${message.role}`}
              >
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          <form className="assistant-chat__form" onSubmit={handleChatSubmit}>
            <textarea
              rows="3"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask about skilled migration, employer sponsorship, student pathways, or next steps."
            />
            <button type="submit" className="btn btn-primary" disabled={chatState.loading}>
              {chatState.loading ? "Thinking..." : "Send"}
            </button>
          </form>
          {chatState.error ? <p className="form-feedback is-error">{chatState.error}</p> : null}
          <p className="assistant-note">
            General information only. Always verify current requirements and seek formal advice for
            your situation.
          </p>
        </div>
      </section>
    </section>
  );

  return (
    <div className="portal-shell">
      <header className={`site-header ${headerCompact ? "is-compact" : ""}`}>
        <div className="site-header__inner">
          <button type="button" className="brand" onClick={() => handleTabChange("home")} aria-label="Open home tab">
            <span className="brand__mark" aria-hidden="true">
              <Image
                src="/images/minrosh-logo.png"
                alt=""
                width={46}
                height={46}
                priority
              />
            </span>
            <span className="brand__text">
              <strong>{siteData.brand.name}</strong>
              <span>{siteData.brand.tagline}</span>
            </span>
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen ? "true" : "false"}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
          </button>
          <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`site-nav__link ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
            <button type="button" className="btn btn-primary site-nav__cta" onClick={() => handleTabChange("quiz")}>
              Check Eligibility
            </button>
          </nav>
        </div>
      </header>

      <main className="portal-main">
        {homeTab}
        {quizTab}
        {pathwaysTab}
        {servicesTab}
        {storiesTab}
        {contactTab}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <strong>{siteData.brand.name}</strong>
            <p>{siteData.brand.tagline}</p>
          </div>
          <div className="site-footer__links">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="site-footer__contact">
            <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
            <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
          </div>
        </div>
        <div className="site-footer__compliance">
          <p>
            MinRosh Migration operates under the Migration Agents Regulations 2026 and the OMARA Code of Conduct.
          </p>
          <p>MARN placeholder: 0000000</p>
          <a
            href="https://www.mara.gov.au/get-help-with-a-visa/help-from-registered-agents-and-lawyers/code-of-conduct/"
            target="_blank"
            rel="noreferrer"
          >
            View the OMARA Code of Conduct
          </a>
        </div>
      </footer>

      <button type="button" className="mobile-sticky-cta" onClick={() => handleTabChange("quiz")}>
        Check Eligibility
      </button>

      <a
        className="whatsapp-float"
        href="https://wa.me/61478100542?text=Hi%20MinRosh%20Migration,%20I%20just%20completed%20your%20points%20test%20and%20would%20like%20to%20discuss%20my%20Australian%20visa%20options."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with MinRosh Migration on WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path
            fill="currentColor"
            d="M27.3 4.7C24.3 1.7 20.3 0 16 0 7.2 0 0 7.2 0 16c0 2.8.7 5.5 2.1 7.9L0 32l8.3-2.2c2.3 1.2 4.9 1.9 7.7 1.9h.1c8.8 0 15.9-7.2 15.9-16 0-4.3-1.7-8.3-4.7-11zm-11.2 24c-2.4 0-4.7-.6-6.8-1.8l-.5-.3-4.9 1.3 1.3-4.8-.3-.5C3.7 20.6 3 18.3 3 16 3 8.8 8.8 3 16 3c3.5 0 6.8 1.4 9.2 3.8 2.5 2.5 3.8 5.7 3.8 9.2 0 7.2-5.8 13-12.9 13zm7.1-9.7c-.4-.2-2.3-1.1-2.7-1.2-.4-.2-.7-.2-.9.2-.3.4-1 1.2-1.2 1.4-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.2 0-.5 0-.7 0-.2-.9-2.1-1.3-2.9-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .4-.3.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.3 6.9 6 .9.4 1.6.6 2.2.8.9.3 1.8.3 2.5.2.8-.1 2.3-.9 2.7-1.7.3-.8.3-1.5.2-1.7-.1-.1-.4-.2-.8-.4z"
          />
        </svg>
      </a>
    </div>
  );
}
