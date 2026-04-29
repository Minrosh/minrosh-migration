"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const TONE_CLASS = {
  rose: "bg-brand-rose",
  plum: "bg-brand-plum",
  gold: "bg-[#caa64d]",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
};

export function DestinationRouteGraph({ destinationName, nodes = [], routes = [], nodeGuides = {} }) {
  const safeNodes = useMemo(() => (Array.isArray(nodes) ? nodes : []), [nodes]);
  const safeRoutes = useMemo(() => (Array.isArray(routes) ? routes : []), [routes]);
  const [activeRouteId, setActiveRouteId] = useState(safeRoutes[0]?.id ?? null);
  const activeRoute = safeRoutes.find((route) => route.id === activeRouteId) ?? safeRoutes[0] ?? null;
  const [activeNodeId, setActiveNodeId] = useState(safeRoutes[0]?.nodeIds?.[0] ?? safeNodes[0]?.id ?? null);

  if (!safeNodes.length || !activeRoute) return null;

  const activeNodeIds = new Set(activeRoute.nodeIds ?? []);
  const activeNode =
    safeNodes.find((node) => node.id === activeNodeId) ??
    safeNodes.find((node) => activeNodeIds.has(node.id)) ??
    safeNodes[0];
  const nodeGuide = nodeGuides?.[activeNode?.id] ?? null;

  return (
    <section className="mt-8 rounded-[1.75rem] border border-brand-plum/10 bg-white/90 p-5 shadow-lux backdrop-blur-sm md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">Route graph</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
        {destinationName} migration route map
      </h2>
      <p className="mt-2 text-sm text-brand-plum/70 md:text-base">
        Visualize the likely path before you commit. Hover-free, tap-ready clarity for desktop and
        mobile.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {safeRoutes.map((route) => {
          const selected = route.id === activeRoute.id;
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => {
                setActiveRouteId(route.id);
                setActiveNodeId(route.nodeIds?.[0] ?? null);
              }}
              className={`min-h-[48px] touch-manipulation rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-brand-plum bg-brand-plum text-white"
                  : "border-brand-plum/20 bg-white text-brand-plum/80 hover:border-brand-plum/40"
              }`}
              aria-pressed={selected}
            >
              {route.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-brand-plum/10 bg-brand-cream/40 p-3 md:p-4">
        <div className="relative h-56 w-full md:h-64">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {(activeRoute.nodeIds ?? []).map((nodeId, index, arr) => {
              if (index === arr.length - 1) return null;
              const from = safeNodes.find((node) => node.id === nodeId);
              const to = safeNodes.find((node) => node.id === arr[index + 1]);
              if (!from || !to) return null;
              return (
                <motion.line
                  key={`${from.id}-${to.id}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#9b4a6c"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.4 + index * 0.08 }}
                />
              );
            })}
          </svg>

          {safeNodes.map((node) => {
            const active = activeNodeIds.has(node.id);
            const selected = node.id === activeNode?.id;
            return (
              <motion.div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                animate={{ scale: selected ? 1.12 : active ? 1.06 : 1, opacity: active ? 1 : 0.55 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  className={`mx-auto block min-h-[48px] min-w-[48px] touch-manipulation rounded-full ring-offset-2 transition ${
                    selected ? "ring-2 ring-brand-plum/45" : ""
                  } ${TONE_CLASS[node.tone] || "bg-brand-plum"}`}
                  onClick={() => setActiveNodeId(node.id)}
                  aria-label={`Inspect ${node.label}`}
                />
                <p className="mt-2 max-w-[110px] text-center text-[11px] font-medium leading-tight text-brand-plum/80 md:max-w-[140px] md:text-xs">
                  {node.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-brand-plum/10 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/55">Estimated runway</p>
          <p className="mt-1 text-lg font-semibold text-brand-plum">{activeRoute.eta}</p>
        </div>
        <div className="rounded-xl border border-brand-plum/10 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/55">Confidence signal</p>
          <p className="mt-1 text-lg font-semibold text-brand-plum">{activeRoute.certainty}/100</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-brand-plum/10 bg-white p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/55">Node drill-down</p>
        <h3 className="mt-1 text-lg font-semibold text-brand-plum">
          {nodeGuide?.title ?? activeNode?.label ?? "Route node insight"}
        </h3>
        <p className="mt-2 text-sm text-brand-plum/75">
          {nodeGuide?.summary ?? "Select a highlighted node to inspect risks and next actions."}
        </p>
        {nodeGuide?.risk ? (
          <p className="mt-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3 py-2 text-xs font-medium text-brand-plum/80">
            Risk signal: {nodeGuide.risk}
          </p>
        ) : null}
        {(nodeGuide?.actions ?? []).length ? (
          <ul className="mt-3 space-y-2 text-sm text-brand-plum/80">
            {nodeGuide.actions.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-rose" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {(nodeGuide?.docLinks ?? []).length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {nodeGuide.docLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-[48px] touch-manipulation items-center rounded-full border border-brand-plum/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand-plum/80 transition hover:border-brand-plum/45"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
