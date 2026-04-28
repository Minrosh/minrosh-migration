"use client";

import { useEffect } from "react";

const RECOVERY_FLAG = "chunk-recovery-attempted";

function isChunkRuntimeFailureMessage(message) {
  if (!message) return false;
  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Refused to execute script") ||
    message.includes("MIME type ('text/html') is not executable")
  );
}

export function RuntimeChunkRecovery() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function recoverOnce() {
      if (window.sessionStorage.getItem(RECOVERY_FLAG) === "1") return;
      window.sessionStorage.setItem(RECOVERY_FLAG, "1");
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("__v", String(Date.now()));
      window.location.replace(nextUrl.toString());
    }

    function onError(event) {
      if (isChunkRuntimeFailureMessage(event?.message || "")) {
        recoverOnce();
      }
    }

    function onUnhandledRejection(event) {
      const reason = event?.reason;
      const message = typeof reason === "string" ? reason : reason?.message || "";
      if (isChunkRuntimeFailureMessage(message)) {
        recoverOnce();
      }
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
