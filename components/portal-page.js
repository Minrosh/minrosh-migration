"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { calculateQuizResult, quizOptions } from "../lib/quiz";

const tabs = [
  { id: "home", label: "Home" },
  { id: "quiz", label: "Visa Quiz" },
  { id: "pathways", label: "PR Pathways" },
  { id: "services", label: "Services" },
  { id: "stories", label: "Success Stories" },
  { id: "contact", label: "Contact" },
];

const initialQuiz = {
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

export function PortalPage({ siteData, newsData }) {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [quizForm, setQuizForm] = useState(initialQuiz);
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

  useEffect(() => {
    document.body.dataset.menu = menuOpen ? "open" : "closed";
    return () => {
      document.body.dataset.menu = "closed";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!quizResult) {
      return;
    }

    const summary = quizResult.restricted
      ? "Quiz result: Age 45+ selected. Direct PR may be restricted and employer-sponsored or alternative options should be reviewed."
      : `Quiz result: Estimated ${quizResult.score} points. ${
          quizResult.thresholdMet
            ? "Meets the minimum 65-point EOI threshold."
            : "Below the minimum 65-point EOI threshold."
        } Occupation status: ${quizForm.occupation}.`;

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
  }, [quizForm.occupation, quizResult]);

  const currentStep = quizResult?.restricted
    ? "Employer-sponsored review"
    : activeTab === "contact"
      ? "Visa Lodgement"
      : activeTab === "pathways"
        ? "Skills Assessment"
        : "Initial Assessment";

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMenuOpen(false);
  }

  function handleQuizChange(event) {
    const { name, value } = event.target;
    setQuizForm((current) => ({ ...current, [name]: value }));
  }

  function handleContactChange(event) {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
  }

  async function handleContactSubmit(event) {
    event.preventDefault();
    setContactState({ status: "loading", message: "" });

    const payload = {
      ...contactForm,
      quizSummary: quizResult
        ? quizResult.restricted
          ? "Age 45+ selected. Review employer-sponsored or alternative options."
          : `Estimated points: ${quizResult.score}. Threshold met: ${quizResult.thresholdMet ? "yes" : "no"}.`
        : "",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not submit enquiry.");
      }

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
    if (!chatInput.trim()) {
      return;
    }

    const nextMessages = [...chatMessages, { role: "user", content: chatInput.trim() }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatState({ loading: true, error: "" });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;

      if (!response.ok || !reply) {
        throw new Error(data.error || "Chat is not available right now.");
      }

      setChatMessages((current) => [...current, { role: "assistant", content: reply }]);
      setChatState({ loading: false, error: "" });
    } catch (error) {
      setChatState({ loading: false, error: error.message || "Chat is unavailable right now." });
    }
  }

  return (
    <div className="portal-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <button
            type="button"
            className="brand"
            onClick={() => handleTabChange("home")}
            aria-label="Open home tab"
          >
            <span className="brand__mark">MR</span>
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
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-primary site-nav__cta"
              onClick={() => handleTabChange("quiz")}
            >
              Check Eligibility
            </button>
          </nav>
        </div>
      </header>

      <main className="portal-main">
        <section className={`tab-panel ${activeTab === "home" ? "is-active" : ""}`}>
          <section className="hero">
            <div className="hero__content">
              <p className="eyebrow">{siteData.hero.eyebrow}</p>
              <h1>{siteData.hero.title}</h1>
              <p className="hero__lead">{siteData.hero.description}</p>
              <div className="hero__actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleTabChange("quiz")}
                >
                  {siteData.hero.primaryCta}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => handleTabChange("contact")}
                >
                  {siteData.hero.secondaryCta}
                </button>
              </div>
              <div className="hero__stats">
                {siteData.stats.map((stat) => (
                  <div key={stat.label} className="hero__stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero__media">
              <Image
                src="/images/hero-australia.svg"
                alt="Illustrated Australian harbour skyline"
                width={760}
                height={780}
                priority
              />
            </div>
          </section>

          <section className="trust-strip">
            {siteData.services.slice(0, 3).map((service) => (
              <article key={service.title} className="trust-strip__item">
                <p className="section-label">{service.title}</p>
                <p>{service.summary}</p>
              </article>
            ))}
          </section>

          <section className="split-section">
            <div>
              <p className="section-label">About MinRosh</p>
              <h2>{siteData.about.title}</h2>
              <p>{siteData.about.body}</p>
              <ul className="feature-list">
                {siteData.about.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="image-card">
              <Image
                src="/images/team-guidance.svg"
                alt="Illustrated MinRosh guidance workspace"
                width={620}
                height={540}
              />
            </div>
          </section>

          <section className="news-section">
            <div className="section-head">
              <div>
                <p className="section-label">Latest guidance</p>
                <h2>What clients usually need to know first</h2>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => handleTabChange("contact")}
              >
                Ask a question
              </button>
            </div>
            <div className="news-grid">
              {newsData.map((item) => (
                <article key={item.title} className="news-card">
                  <time dateTime={item.date}>
                    {new Date(item.date).toLocaleDateString("en-AU")}
                  </time>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className={`tab-panel ${activeTab === "quiz" ? "is-active" : ""}`}>
          <div className="panel-hero">
            <div>
              <p className="section-label">Preliminary points calculator</p>
              <h2>Estimate your 189 / 190 profile before you book</h2>
              <p>
                This quiz is a preliminary guide only. Final eligibility depends on current policy,
                occupation settings, evidence, and pathway competition.
              </p>
            </div>
            <div className="current-step">
              <span>Current Step</span>
              <strong>{currentStep}</strong>
            </div>
          </div>

          <div className="quiz-layout">
            <form className="quiz-card" onSubmit={(event) => event.preventDefault()}>
              <div className="quiz-grid">
                <label>
                  <span>Age</span>
                  <select name="age" value={quizForm.age} onChange={handleQuizChange}>
                    <option value="">Select age range</option>
                    {quizOptions.age.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Occupation on a skilled list?</span>
                  <select
                    name="occupation"
                    value={quizForm.occupation}
                    onChange={handleQuizChange}
                  >
                    <option value="yes">Yes</option>
                    <option value="unsure">Not sure yet</option>
                    <option value="no">No</option>
                  </select>
                </label>

                <label>
                  <span>English level</span>
                  <select name="english" value={quizForm.english} onChange={handleQuizChange}>
                    <option value="">Select English level</option>
                    {quizOptions.english.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Overseas work experience</span>
                  <select
                    name="overseasExperience"
                    value={quizForm.overseasExperience}
                    onChange={handleQuizChange}
                  >
                    <option value="">Select years</option>
                    {quizOptions.overseasExperience.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Education</span>
                  <select name="education" value={quizForm.education} onChange={handleQuizChange}>
                    <option value="">Select highest qualification</option>
                    {quizOptions.education.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Partner status</span>
                  <select name="partner" value={quizForm.partner} onChange={handleQuizChange}>
                    <option value="">Select partner status</option>
                    {quizOptions.partner.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </form>

            <aside className="quiz-result">
              <p className="section-label">Result</p>
              {quizResult ? (
                <>
                  <h3>
                    {quizResult.restricted
                      ? "Special pathway review needed"
                      : `${quizResult.score} points estimated`}
                  </h3>
                  <ul className="result-list">
                    {quizResult.messages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleTabChange("contact")}
                  >
                    Get Full Report
                  </button>
                </>
              ) : (
                <>
                  <h3>Build your profile</h3>
                  <p>
                    Fill out the quiz to get a preliminary score estimate and a clearer sense of
                    your next step.
                  </p>
                </>
              )}
            </aside>
          </div>
        </section>

        <section className={`tab-panel ${activeTab === "pathways" ? "is-active" : ""}`}>
          <div className="panel-hero">
            <div>
              <p className="section-label">5-Step Pathway to PR</p>
              <h2>A clearer journey from first review to visa lodgement</h2>
            </div>
            <div className="current-step">
              <span>Current Step</span>
              <strong>{currentStep}</strong>
            </div>
          </div>

          <div className="timeline">
            {siteData.pathwaySteps.map((step, index) => (
              <article
                key={step.title}
                className={`timeline-step ${index === 0 ? "is-current" : ""}`}
              >
                <span className="timeline-step__number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`tab-panel ${activeTab === "services" ? "is-active" : ""}`}>
          <div className="panel-hero">
            <div>
              <p className="section-label">Services</p>
              <h2>Support shaped around real migration decisions</h2>
            </div>
          </div>
          <div className="services-layout">
            {siteData.services.map((service) => (
              <article key={service.title} className="service-block">
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <ul className="feature-list">
                  {service.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={`tab-panel ${activeTab === "stories" ? "is-active" : ""}`}>
          <div className="panel-hero">
            <div>
              <p className="section-label">Success Stories</p>
              <h2>Trust-building stories around 189-focused planning</h2>
            </div>
          </div>
          <div className="stories-grid">
            {siteData.successStories.map((story) => (
              <article key={story.name} className="story-card">
                <p className="story-card__visa">{story.visa}</p>
                <h3>{story.name}</h3>
                <p className="story-card__location">{story.location}</p>
                <blockquote>{story.quote}</blockquote>
                <p className="story-card__outcome">{story.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`tab-panel ${activeTab === "contact" ? "is-active" : ""}`}>
          <div className="contact-layout">
            <div className="contact-copy">
              <p className="section-label">Contact</p>
              <h2>Start with a clear enquiry and we&apos;ll help shape the next steps.</h2>
              <p>
                Share your background, timing, and main goal. We&apos;ll review the enquiry and
                respond with the most relevant next move.
              </p>
              <div className="contact-details">
                <div>
                  <span>Email</span>
                  <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
                </div>
                <div>
                  <span>Phone</span>
                  <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>
                    {siteData.brand.phone}
                  </a>
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

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="contact-grid">
                <label>
                  <span>First name</span>
                  <input
                    name="firstName"
                    value={contactForm.firstName}
                    onChange={handleContactChange}
                    required
                  />
                </label>
                <label>
                  <span>Last name</span>
                  <input
                    name="lastName"
                    value={contactForm.lastName}
                    onChange={handleContactChange}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                  />
                </label>
                <label>
                  <span>Preferred country</span>
                  <select
                    name="preferredCountry"
                    value={contactForm.preferredCountry}
                    onChange={handleContactChange}
                  >
                    <option>Australia</option>
                    <option>New Zealand</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </label>
                <label>
                  <span>Main need</span>
                  <select
                    name="mainNeed"
                    value={contactForm.mainNeed}
                    onChange={handleContactChange}
                  >
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={contactState.status === "loading"}
              >
                {contactState.status === "loading" ? "Sending..." : "Submit enquiry"}
              </button>
              {contactState.message ? (
                <p className={`form-feedback is-${contactState.status}`}>
                  {contactState.message}
                </p>
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
            <div className="assistant-chat">
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={chatState.loading}
                >
                  {chatState.loading ? "Thinking..." : "Send"}
                </button>
              </form>
              {chatState.error ? (
                <p className="form-feedback is-error">{chatState.error}</p>
              ) : null}
              <p className="assistant-note">
                General information only. Always verify current requirements and seek formal advice
                for your situation.
              </p>
            </div>
          </section>
        </section>
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
      </footer>

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
