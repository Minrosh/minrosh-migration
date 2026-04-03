"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculateQuizResult, quizOptions } from "../lib/quiz";
import { CountryCoverage } from "./country-coverage";
import { NewsBoard } from "./news-board";
import { SiteFooter } from "./site-footer";
import { SiteTopbar } from "./site-topbar";
import { SmartNavigator } from "./smart-navigator";

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
    title: "Profile basics",
    description: "Start with age and whether your occupation sits on a relevant skilled list.",
    fields: ["occupationName", "age", "occupation"],
  },
  {
    id: "english",
    label: "English",
    title: "English proficiency",
    description: "Your English result can materially change invitation competitiveness.",
    fields: ["english"],
  },
  {
    id: "work",
    label: "Work",
    title: "Overseas skilled experience",
    description: "Count overseas skilled experience in your nominated occupation carefully and conservatively.",
    fields: ["overseasExperience"],
  },
  {
    id: "australiaWork",
    label: "AU work",
    title: "Australian skilled employment",
    description:
      "Australian employment in your skilled occupation can add points (simplified bands aligned with common skilled points tables — confirm your exact position on Home Affairs).",
    fields: ["australianSkilled"],
  },
  {
    id: "readiness",
    label: "Assessment",
    title: "Skills assessment readiness",
    description:
      "This does not change points here, but it drives sequencing — most skilled applicants need a positive skills assessment before moving forward confidently.",
    fields: ["skillsReadiness"],
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
  {
    id: "planning",
    label: "Pathway",
    title: "Nomination focus",
    description:
      "Whether you lean toward independent, state-nominated, or regional pathways helps tailor practical next steps.",
    fields: ["pathwayFocus"],
  },
];

const initialQuiz = {
  occupationName: "",
  age: "",
  occupation: "unsure",
  english: "",
  overseasExperience: "",
  australianSkilled: "",
  skillsReadiness: "",
  education: "",
  partner: "",
  pathwayFocus: "",
};

const countryBannerLinks = [
  { label: "Australia", href: "/destinations/australia" },
  { label: "New Zealand", href: "/destinations/new-zealand" },
  { label: "Canada", href: "/destinations/canada" },
  { label: "United Kingdom", href: "/destinations/united-kingdom" },
];

const visualHighlights = [
  {
    title: "Brisbane-based guidance",
    caption: "Local visibility with a calmer, more premium first impression.",
    src: "/images/brisbane-skyline.jpg",
    alt: "Brisbane skyline beside the river at sunset",
  },
  {
    title: "Structured migration planning",
    caption: "A smoother pathway from first review through to practical next steps.",
    src: "/images/team-office-real.jpg",
    alt: "Professional consultation meeting in a bright modern office",
  },
  {
    title: "Destination-focused support",
    caption: "Stronger visual storytelling for Australia and wider migration goals.",
    src: "/images/hero-sydney-real.jpg",
    alt: "Sydney Harbour with ferries and the Opera House in view",
  },
];

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

export function PortalPage({ siteData, newsData, footerStats }) {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [quizForm, setQuizForm] = useState(initialQuiz);
  const [quizStepIndex, setQuizStepIndex] = useState(0);
  const [selectedPathwayIndex, setSelectedPathwayIndex] = useState(0);
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("minrosh:navigator-summary", {
          detail: {
            summary,
            preferredCountry: "Australia",
            mainNeed: "Skilled Migration",
          },
        })
      );
    }
  }, [quizComplete, quizResult]);

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("minrosh:enquiry-created"));
      }
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
            Brisbane-based migration guidance across four destination systems, with education support and practical next-step planning.
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
          src="/images/hero-sydney-real.jpg"
          alt="Sydney Harbour with ferries on the water and the Opera House"
          width={1800}
          height={1200}
          priority
        />
      </div>
    </section>
  );

  const homeTab = (
    <section className={`tab-panel ${activeTab === "home" ? "is-active" : ""}`}>
      {hero}

      <section className="country-banner" aria-label="Countries MinRosh supports">
        {countryBannerLinks.map((item) => (
          <Link key={item.href} href={item.href} className="country-banner__link">
            {item.label}
          </Link>
        ))}
      </section>

      <CountryCoverage countries={siteData.countries} />

      <section className="trust-strip">
        {siteData.services.slice(0, 3).map((service) => (
          <Link key={service.title} href={service.href} className="trust-strip__item bento-hover trust-strip__link">
            <p className="section-label">{service.title}</p>
            <p>{service.summary}</p>
          </Link>
        ))}
      </section>

      <section className="visual-strip" aria-label="MinRosh highlights">
        {visualHighlights.map((item) => (
          <article key={item.title} className="visual-strip__card bento-hover">
            <div className="visual-strip__media">
              <Image src={item.src} alt={item.alt} width={1400} height={1000} />
            </div>
            <div className="visual-strip__copy">
              <p className="section-label">{item.title}</p>
              <p>{item.caption}</p>
            </div>
          </article>
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

      <SmartNavigator
        title="Answer a few questions and get a more useful pathway recommendation"
        description="The old quick wizard has been expanded into a fuller assessment that weighs destination, goal, timing, support preference, and how settled your pathway already feels."
        primaryLabel="Open recommended page"
        finalHref="/book-consultation"
      />

      <section className="process-section">
        <div className="section-head section-head--process">
          <div>
            <p className="section-label">How It Works</p>
            <h2>A clearer process from first enquiry to action.</h2>
          </div>
          <p className="process-section__lead">
            This makes the site feel more premium and removes unnecessary gaps in the page flow.
          </p>
        </div>
        <div className="process-grid">
          {siteData.processSteps.map((step, index) => (
            <article key={step.title} className="process-card bento-hover">
              <div className="process-card__top">
                <span className="process-card__number">{index + 1}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="news-section">
        <NewsBoard initialNews={newsData} limit={6} />
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
          <h2>Work through your profile in an eight-step assessment</h2>
          <p>
            This wizard is designed to feel closer to a real intake review while still remaining
            preliminary guidance. Always confirm points and eligibility against current Department of
            Home Affairs rules.
          </p>
        </div>
        <div className="current-step">
          <span>Active quiz step</span>
          <strong>{currentQuizStep.title}</strong>
          <p className="current-step__hint">
            This box mirrors the step on the left so you can see where you are in the sequence at a
            glance. It is not a separate question — it updates as you use Previous and Next.
          </p>
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

            {currentQuizStep.id === "australiaWork" ? (
              <div className="quiz-options">
                {quizOptions.australianSkilled.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.australianSkilled === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("australianSkilled", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "readiness" ? (
              <div className="quiz-options">
                {quizOptions.skillsReadiness.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.skillsReadiness === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("skillsReadiness", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "planning" ? (
              <div className="quiz-options">
                {quizOptions.pathwayFocus.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.pathwayFocus === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("pathwayFocus", option.value)}
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
          <p className="panel-hero__sub">
            Select a step below to highlight it. Open “Read more” for longer on-page guidance (helpful
            for reading and search engines).
          </p>
        </div>
        <div className="current-step">
          <span>Highlighted pathway step</span>
          <strong>{siteData.pathwaySteps[selectedPathwayIndex]?.title}</strong>
          <p className="current-step__hint">
            This summary tracks whichever timeline card you last selected — use the numbered boxes to
            compare stages.
          </p>
        </div>
      </div>
      <div className="timeline">
        {siteData.pathwaySteps.map((step, index) => (
          <article
            key={step.title}
            className={`timeline-step bento-hover ${index === selectedPathwayIndex ? "is-current" : ""}`}
          >
            <button
              type="button"
              className="timeline-step__hit"
              onClick={() => setSelectedPathwayIndex(index)}
              aria-current={index === selectedPathwayIndex ? "step" : undefined}
            >
              <span className="timeline-step__number">{index + 1}</span>
              <span className="timeline-step__text">
                <span className="timeline-step__title">{step.title}</span>
                <span className="timeline-step__desc">{step.description}</span>
              </span>
            </button>
            {step.detail ? (
              <details className="timeline-step__details">
                <summary className="timeline-step__summary">Read more about this stage</summary>
                <div className="timeline-step__expanded">
                  <p>{step.detail}</p>
                  {step.officialHref ? (
                    <p className="timeline-step__official">
                      <a href={step.officialHref} target="_blank" rel="noreferrer">
                        {step.officialLabel || "Official information"}
                      </a>
                    </p>
                  ) : null}
                </div>
              </details>
            ) : null}
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
              <span>Alternate phone</span>
              <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
                {siteData.brand.phoneSecondary}
              </a>
            </div>
            <div>
              <span>WhatsApp</span>
              <a
                href={`https://wa.me/${siteData.brand.whatsapp}?text=Hi%20MinRosh%20Migration,%20I%20am%20interested%20in%20Australian%20visa%20options.`}
                target="_blank"
                rel="noreferrer"
              >
                {siteData.brand.phone}
              </a>
            </div>
            <div>
              <span>WhatsApp alternate</span>
              <a
                href={`https://wa.me/${siteData.brand.whatsappSecondary}?text=Hi%20MinRosh%20Migration,%20I%20am%20interested%20in%20Australian%20visa%20options.`}
                target="_blank"
                rel="noreferrer"
              >
                {siteData.brand.phoneSecondary}
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
      <SiteTopbar siteData={siteData} />
      <header
        className={`site-header site-header--backdrop site-header--backdrop-au ${headerCompact ? "is-compact" : ""}`}
      >
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
            <div className="site-nav__group site-nav__group--main">
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
            </div>
            <div className="site-nav__group site-nav__group--actions">
              <button type="button" className="btn btn-primary site-nav__cta" onClick={() => handleTabChange("quiz")}>
                Check Eligibility
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" className="portal-main">
        {homeTab}
        {quizTab}
        {pathwaysTab}
        {servicesTab}
        {storiesTab}
        {contactTab}
      </main>

      <SiteFooter siteData={siteData} initialStats={footerStats} />

      <button type="button" className="mobile-sticky-cta" onClick={() => handleTabChange("quiz")}>
        Check Eligibility
      </button>
    </div>
  );
}
