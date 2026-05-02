/**
 * Map browser FormData from the public contact/consultation form into a JSON-shaped body
 * for {@link parseContactSubmission}.
 * @param {FormData} formData
 * @returns {Record<string, string | boolean>}
 */
export function contactFieldsFromFormData(formData) {
  /** @type {Record<string, string | boolean>} */
  const body = {};
  for (const [key, value] of formData.entries()) {
    if (key === "resume") continue;
    if (typeof value === "string") {
      if (key === "privacyPolicyAccepted") {
        body[key] = value === "true" || value === "on";
      } else {
        body[key] = value;
      }
    }
  }
  return body;
}
