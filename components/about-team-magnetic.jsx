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
      className="service-block bento-hover group transition duration-300"
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={resetMagnet}
      onBlur={resetMagnet}
    >
      <motion.div
        className="mb-4 h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-rose/25"
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <PublicFileImg
          src={member.image}
          alt={`${member.name} profile`}
          width={240}
          height={240}
          className="h-full w-full object-cover"
        />
      </motion.div>
      <h3>{member.name}</h3>
      <p>{member.focus}</p>
    </motion.article>
  );
}
