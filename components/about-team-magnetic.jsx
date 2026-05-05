"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { PublicFileImg } from "./public-file-img";

export function AboutTeamMagnetic({ members = [] }) {
  return (
    <div className="services-layout mt-6">
      {members.map((member) => (
        <MagneticMemberCard key={member.name} member={member} />
      ))}
    </div>
  );
}

function MagneticMemberCard({ member }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 20, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 220, damping: 20, mass: 0.2 });

  function handleMove(event) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-10, Math.min(10, offsetX * 0.08)));
    y.set(Math.max(-10, Math.min(10, offsetY * 0.08)));
  }

  function resetMagnet() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.article
      ref={cardRef}
      tabIndex={0}
      className="about-team-magnetic-card group rounded-[var(--radius-xl)] border border-brand-plum/12 p-5 shadow-[var(--shadow-lux)] outline-none ring-brand-gold/0 transition duration-300 hover:border-[color:var(--brand-gold)]/35 hover:shadow-[var(--shadow-lux-lg)] focus-visible:ring-2 focus-visible:ring-[color:var(--brand-gold)] glass-card premium-frosted-surface bento-hover"
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={resetMagnet}
      onBlur={resetMagnet}
    >
      <motion.div
        className="mb-4 h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-gold/25 transition-[box-shadow] duration-300 group-hover:ring-[color:var(--brand-gold)]/55 group-focus-visible:ring-[color:var(--brand-gold)]"
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <PublicFileImg
          src={member.image}
          alt={`${member.name}: ${member.focus}`}
          width={240}
          height={240}
          className="h-full w-full object-cover"
        />
      </motion.div>
      <h3 className="text-lg font-bold leading-snug text-[var(--brand-navy)] [font-family:var(--font-display),Georgia,serif]">
        {member.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-brand-plum/80">{member.focus}</p>
      <span
        className="mt-4 block h-px w-12 rounded-full bg-[color:var(--brand-gold)]/60 opacity-80 transition-all duration-300 group-hover:w-full group-hover:opacity-100"
        aria-hidden
      />
    </motion.article>
  );
}
