"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/client-analytics";

export function TrackedLink({ eventName, eventParams, onClick, ...props }) {
  function handleClick(event) {
    trackEvent(eventName, eventParams || {});
    if (typeof onClick === "function") {
      onClick(event);
    }
  }

  return <Link {...props} onClick={handleClick} />;
}
