/**
 * Shared SMTP socket limits and send deadlines so routes and jobs do not hang
 * on a slow or stuck MTA (public forms, cron, admin actions).
 */

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
