"use client";

import { useId, useMemo, useState } from "react";
import { buildGlossaryParts } from "../lib/glossary-split-plain";

function GlossaryTerm({ definition, children }) {
  const tipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="glossary-term-wrap">
      <button
        type="button"
        className="glossary-term"
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            event.currentTarget.blur();
          }
        }}
      >
        {children}
      </button>
      {open ? (
        <span id={tipId} role="tooltip" className="glossary-term__tip">
          {definition}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Long-form copy with flat hover/focus glossary tooltips (no heavy shadows).
 * @param {{ text: string, className?: string, as?: keyof JSX.IntrinsicElements }} props
 */
export function GlossaryParagraph({ text, className = "", as: Tag = "p" }) {
  const baseId = useId();
  const parts = useMemo(() => buildGlossaryParts(text), [text]);

  return (
    <Tag className={className}>
      {parts.map((part, index) => {
        if (part.type === "term" && part.definition) {
          return (
            <GlossaryTerm key={`${baseId}-${index}`} definition={part.definition}>
              {part.text}
            </GlossaryTerm>
          );
        }
        return <span key={`${baseId}-t-${index}`}>{part.text}</span>;
      })}
    </Tag>
  );
}
