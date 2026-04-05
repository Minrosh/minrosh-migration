/**
 * Strip sensitive fields from customer records for list / bulk API responses.
 */
export function toCustomerListRow(c) {
  if (!c || typeof c !== "object") return null;
  const docs = Array.isArray(c.documents) ? c.documents : [];
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    status: c.status,
    createdAt: c.createdAt,
    uploadFolder: c.uploadFolder,
    mobile: c.mobile ?? "",
    magicLinkIssuedAt: c.magicLinkIssuedAt ?? null,
    magicLinkExpiresAt: c.magicLinkExpiresAt ?? null,
    documentCount: docs.length,
    hasMagicLink: Boolean(c.magicToken),
  };
}

export function toCustomerListPayload(customers) {
  const list = Array.isArray(customers) ? customers : [];
  return list.map((c) => toCustomerListRow(c)).filter(Boolean);
}
