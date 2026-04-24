const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const weekdayTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

const longDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function dayOffsetFromNow(targetMs) {
  const now = new Date();
  const target = new Date(targetMs);
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((startOfTarget - startOfNow) / 86400000);
}

export function retryAfterHint(rawRetryAfter) {
  const value = String(rawRetryAfter || "").trim();
  if (!value) return "";

  const toDurationText = (remainingSeconds) => {
    const secs = Math.max(1, Math.ceil(remainingSeconds));
    if (secs < 60) {
      return secs === 1 ? "about 1 second" : `about ${secs} seconds`;
    }
    const mins = Math.ceil(secs / 60);
    return mins <= 1 ? "about 1 minute" : `about ${mins} minutes`;
  };

  const toEtaText = (dateMs) => {
    const offsetDays = dayOffsetFromNow(dateMs);
    if (offsetDays === 0) {
      return ` (around ${timeFormatter.format(dateMs)} today)`;
    }
    if (offsetDays === 1) {
      return ` (around ${timeFormatter.format(dateMs)} tomorrow)`;
    }
    if (offsetDays > 6) {
      return ` (around ${longDateTimeFormatter.format(dateMs)})`;
    }
    return ` (around ${weekdayTimeFormatter.format(dateMs)})`;
  };

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) {
    const etaMs = Date.now() + seconds * 1000;
    return ` Please try again in ${toDurationText(seconds)}${toEtaText(etaMs)}.`;
  }

  const dateMs = Date.parse(value);
  if (!Number.isNaN(dateMs)) {
    const remainingSeconds = (dateMs - Date.now()) / 1000;
    if (remainingSeconds > 0) {
      return ` Please try again in ${toDurationText(remainingSeconds)}${toEtaText(dateMs)}.`;
    }
  }

  return "";
}
