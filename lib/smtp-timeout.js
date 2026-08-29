import { checkSmtpDailySendCap, recordSmtpDailySend } from "./security/smtp-send-cap";
import { logSecurityEvent } from "./security/monitoring-log";

/**
 * Shared SMTP socket limits and send deadlines so routes and jobs do not hang
 * on a slow or stuck MTA (public forms, cron, admin actions).
 */

export class SmtpDailyCapError extends Error {
  constructor() {
    super("Daily SMTP send limit reached");
    this.code = "SMTP_DAILY_CAP";
  }
}

/** Nodemailer connection/greeting/socket idle cap and manual send race (ms). */
export const SMTP_SOCKET_TIMEOUT_MS = 10_000;

/** Spread into `nodemailer.createTransport({ host, port, ... })`. */
export function smtpSocketTimeoutFields() {
  const ms = SMTP_SOCKET_TIMEOUT_MS;
  return {
    connectionTimeout: ms,
    greetingTimeout: ms,
    socketTimeout: ms,
  };
}

/**
 * @template T
 * @param {Promise<T>} promise — typically `transporter.sendMail(...)`
 * @param {number} [ms]
 * @returns {Promise<T>}
 */
export function withSmtpDeadline(promise, ms = SMTP_SOCKET_TIMEOUT_MS) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      reject(Object.assign(new Error("SMTP send timed out"), { code: "ETIMEDOUT" }));
    }, ms);
  });
  return Promise.race([
    promise.then(
      (v) => {
        if (timeoutId) clearTimeout(timeoutId);
        return v;
      },
      (err) => {
        if (timeoutId) clearTimeout(timeoutId);
        throw err;
      }
    ),
    timeoutPromise,
  ]);
}

/**
 * Send mail with optional daily cap enforcement (public forms only).
 * @param {import("nodemailer").Transporter} transporter
 * @param {import("nodemailer/lib/mailer").Options} mailOptions
 * @param {{ enforceDailyCap?: boolean, deadlineMs?: number }} [opts]
 */
export async function sendSmtpMail(transporter, mailOptions, opts = {}) {
  const enforceDailyCap = opts.enforceDailyCap === true;
  if (enforceDailyCap) {
    const cap = checkSmtpDailySendCap(1);
    if (!cap.allowed) {
      logSecurityEvent("smtp_daily_cap_blocked", { count: cap.count, max: cap.max, date: cap.date });
      throw new SmtpDailyCapError();
    }
  }
  await withSmtpDeadline(transporter.sendMail(mailOptions), opts.deadlineMs);
  if (enforceDailyCap) {
    recordSmtpDailySend(1);
  }
}
