"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import futurePacingData from "../../data/home-pathway-future-pacing.json";

const ROUTES = [
  {
    id: "student-pr",
    label: "Student → PR",
    years: "Year 0 to Year 4",
    nodes: [
      {
        id: "coe",
        title: "CoE & Visa 500",
        hint: "Secure course + compliant visa setup",
        risk: "Weak provider or document mismatch can create delays.",
        actions: ["Lock institution + intake timing", "Prepare funds + identity evidence pack"],
        links: [{ href: "/student-visa-australia", label: "Student visa guide" }],
      },
      {
        id: "study",
        title: "Study + Part-time Work",
        hint: "Build local profile + references",
        risk: "No local evidence trail weakens later transitions.",
        actions: ["Track work history and role responsibilities", "Document skills growth during study"],
        links: [{ href: "/education-consultation", label: "Education consultation" }],
      },
      {
        id: "graduate",
        title: "Graduate Stage",
        hint: "Bridge to skilled or employer route",
        risk: "Late planning narrows skilled or sponsor options.",
        actions: ["Map post-study pathway before course end", "Run route comparison across skilled/employer options"],
        links: [{ href: "/employer-sponsored-visas", label: "Employer-sponsored routes" }],
      },
      {
        id: "nomination",
        title: "Nomination / PR Lodge",
        hint: "Submit strongest PR pathway evidence",
        risk: "Premature lodgement raises refusal and rework risk.",
        actions: ["Complete consistency checks", "Validate final evidence set before lodgement"],
        links: [{ href: "/book-consultation", label: "Book strategy review" }],
      },
    ],
  },
  {
    id: "skilled-direct",
    label: "Skilled Direct",
    years: "Year 0 to Year 2",
    nodes: [
      {
        id: "assessment",
        title: "Skills Assessment",
        hint: "Align occupation evidence early",
        risk: "Incorrect evidence framing can block progress.",
        actions: ["Confirm occupation alignment", "Prepare authority-specific employment records"],
        links: [{ href: "/skilled-migration", label: "Skilled migration overview" }],
      },
      {
        id: "eoi",
        title: "EOI + Points Lift",
        hint: "Improve invitation competitiveness",
        risk: "Static points strategy reduces invitation probability.",
        actions: ["Prioritize highest-impact points upgrades", "Set monthly profile review checkpoints"],
        links: [{ href: "/skilled-migration-australia-points-guide", label: "Points strategy guide" }],
      },
      {
        id: "invite",
        title: "Invite / Nomination",
        hint: "Proceed once criteria align",
        risk: "Missing timing windows can force pathway resets.",
        actions: ["Track nomination windows", "Prepare rapid-response document set"],
        links: [{ href: "/australian-visas-official-sources", label: "Official sources hub" }],
      },
      {
        id: "grant",
        title: "Visa Grant",
        hint: "Transition into settlement planning",
        risk: "No post-grant checklist slows early momentum.",
        actions: ["Create 14-day arrival plan", "Prioritize housing, work, and admin tasks"],
        links: [{ href: "/book-consultation", label: "Book next-stage plan" }],
      },
    ],
  },
  {
    id: "employer-pr",
    label: "Employer → PR",
    years: "Year 0 to Year 3",
    nodes: [
      {
        id: "sponsor",
        title: "Sponsor Match",
        hint: "Map role to approved sponsorship context",
        risk: "Poor sponsor-role fit creates avoidable setbacks.",
        actions: ["Validate sponsor readiness", "Align role scope with pathway requirements"],
        links: [{ href: "/employer-sponsored-visas", label: "Employer route details" }],
      },
      {
        id: "sid",
        title: "SID Stream",
        hint: "Choose specialist/core/essential pathway fit",
        risk: "Wrong stream positioning weakens long-term planning.",
        actions: ["Assess stream fit against occupation profile", "Prepare stream-specific evidence early"],
        links: [{ href: "/australian-visas-official-sources", label: "Verify current stream rules" }],
      },
      {
        id: "work-stage",
        title: "Australian Work Stage",
        hint: "Stabilize income + evidence quality",
        risk: "Inconsistent work records reduce PR conversion confidence.",
        actions: ["Maintain clean payslip + duty evidence", "Document employment continuity"],
        links: [{ href: "/visa-services", label: "Service pathways" }],
      },
      {
        id: "pr-stage",
        title: "PR Conversion",
        hint: "Lodge with strongest timing and documents",
        risk: "Rushed PR conversion can trigger avoidable complications.",
        actions: ["Run pre-lodgement checklist", "Final review of policy alignment and evidence"],
        links: [{ href: "/book-consultation", label: "Book conversion strategy" }],
      },
    ],
  },
];

export function PathwaySequenceAnimated() {
  const [activeRouteId, setActiveRouteId] = useState(ROUTES[0].id);
  const activeRoute = useMemo(() => ROUTES.find((route) => route.id === activeRouteId) || ROUTES[0], [activeRouteId]);
  const [activeNodeId, setActiveNodeId] = useState(activeRoute.nodes[0]?.id);
  const routeProgress = useMemo(
    () => activeRoute.nodes.map((_, index) => Math.round(((index + 1) / activeRoute.nodes.length) * 100)),
    [activeRoute]
  );
  const activeNode =
    activeRoute.nodes.find((node) => node.id === activeNodeId) ?? activeRoute.nodes[0];
  const routeSignals = futurePacingData?.routeSignals && typeof futurePacingData.routeSignals === "object"
    ? futurePacingData.routeSignals
    : {};
  const signal = routeSignals[activeRoute.id] || null;
  const milestoneList = Array.isArray(futurePacingData?.progressMilestones) ? futurePacingData.progressMilestones : [];
  const activeProgress = routeProgress[activeRoute.nodes.findIndex((node) => node.id === activeNode?.id)] || 0;
  const activeMilestone = [...milestoneList]
    .sort((a, b) => Number(a.threshold || 0) - Number(b.threshold || 0))
    .find((item) => activeProgress <= Number(item.threshold || 0));

  useEffect(() => {
    setActiveNodeId(activeRoute.nodes[0]?.id);
  }, [activeRouteId, activeRoute]);

  return (
    <div className="relative z-10 rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
      <p className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-rose">Migration subway map</p>
      <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Choose your likely route</h3>
      <p className="mb-5 text-sm font-medium text-slate-600 sm:text-base">
        Hover or tap a route to preview the years ahead and the evidence milestones that matter.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {ROUTES.map((route) => (
          <button
            key={route.id}
            type="button"
            onMouseEnter={() => setActiveRouteId(route.id)}
            onFocus={() => setActiveRouteId(route.id)}
            onClick={() => setActiveRouteId(route.id)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              route.id === activeRouteId
                ? "border-brand-rose bg-brand-rose text-white"
                : "border-brand-plum/20 bg-white text-brand-plum hover:border-brand-rose/50"
            }`}
          >
            {route.label}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-brand-plum/10 bg-brand-cream/40 px-4 py-3 text-sm font-semibold text-brand-plum">
        Future pacing window: <span className="text-brand-rose">{activeRoute.years}</span>
      </div>
      {signal ? (
        <div className="mb-4 grid gap-2 sm:grid-cols-3" aria-label="Route confidence and social proof">
          <div className="rounded-xl border border-brand-plum/15 bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-plum/60">Confidence</p>
            <p className="text-sm font-extrabold text-brand-plum">{signal.confidence}</p>
          </div>
          <div className="rounded-xl border border-brand-plum/15 bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-plum/60">Momentum</p>
            <p className="text-sm font-extrabold text-brand-plum">{signal.momentum}</p>
          </div>
          <div className="rounded-xl border border-brand-plum/15 bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-plum/60">Social proof</p>
            <p className="text-xs font-medium text-brand-plum/85">{signal.socialProof}</p>
          </div>
        </div>
      ) : null}

      <div className="mb-5 rounded-2xl border border-brand-plum/10 bg-white p-4">
        <svg viewBox="0 0 620 90" className="h-20 w-full" role="img" aria-label={`${activeRoute.label} subway route`}>
          {activeRoute.nodes.map((node, index) => {
            const x = 60 + index * 170;
            const isLast = index === activeRoute.nodes.length - 1;
            return (
              <g key={`${activeRoute.id}-line-${node.id}`}>
                {!isLast ? (
                  <line
                    x1={x}
                    y1="45"
                    x2={x + 170}
                    y2="45"
                    stroke="rgba(91,42,74,0.35)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                ) : null}
                <circle cx={x} cy="45" r="14" fill="#9b4a6c" />
                <circle
                  cx={x}
                  cy="45"
                  r={node.id === activeNode?.id ? "7.5" : "6"}
                  fill="#f7f2ec"
                  onClick={() => setActiveNodeId(node.id)}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mb-5 rounded-2xl border border-brand-plum/10 bg-brand-cream/35 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-plum/60">Future pacing drill-down</p>
        <h4 className="mt-1 text-lg font-bold text-brand-plum">{activeNode?.title}</h4>
        <p className="mt-1 text-sm text-slate-600">{activeNode?.hint}</p>
        {activeNode?.risk ? (
          <p className="mt-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3 py-2 text-xs font-medium text-brand-plum/80">
            Risk signal: {activeNode.risk}
          </p>
        ) : null}
        {(activeNode?.actions ?? []).length ? (
          <ul className="mt-3 space-y-2 text-sm text-brand-plum/80">
            {activeNode.actions.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-rose" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {(activeNode?.links ?? []).length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeNode.links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-brand-plum/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand-plum transition hover:border-brand-plum/45"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
        {activeMilestone ? (
          <div className="mt-3 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-plum/60">Endowed progress</p>
            <p className="mt-1 text-sm font-semibold text-brand-plum">{activeMilestone.title}</p>
            <p className="text-xs text-brand-plum/75">{activeMilestone.description}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {activeRoute.nodes.map((node, index) => (
          <motion.div
            key={`${activeRoute.id}-${node.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: index * 0.05 }}
            className="relative"
            onMouseEnter={() => setActiveNodeId(node.id)}
          >
            {index < activeRoute.nodes.length - 1 ? (
              <span className="absolute left-4 top-8 h-9 w-1 rounded bg-brand-rose/60" aria-hidden />
            ) : null}
            <div className="ml-0 flex items-start gap-4 rounded-2xl border border-brand-plum/10 bg-white p-4 shadow-sm">
              <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-plum text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h4 className="font-bold text-brand-plum">{node.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{node.hint}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-rose">
                  Future pacing marker: {routeProgress[index]}% of your journey map
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
