import { randomUUID } from "node:crypto";
import { readCustomers, writeCustomers } from "./json-store";

export function findCustomerByMagicToken(token) {
  const { customers } = readCustomers();
  return customers.find((c) => c.magicToken === token) || null;
}

export function findCustomerById(id) {
  const { customers } = readCustomers();
  return customers.find((c) => c.id === id) || null;
}

export function addCustomer({ name, email, status }) {
  const data = readCustomers();
  const customers = data.customers || [];
  const row = {
    id: `cust-${randomUUID()}`,
    magicToken: randomUUID(),
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    status: ["current", "past", "prospective"].includes(status) ? status : "prospective",
    createdAt: new Date().toISOString(),
    documents: [],
  };
  customers.unshift(row);
  writeCustomers({ customers });
  return row;
}

export function updateCustomer(id, patch) {
  const data = readCustomers();
  const customers = data.customers || [];
  const i = customers.findIndex((c) => c.id === id);
  if (i === -1) return null;
  const next = { ...customers[i], ...patch };
  if (patch.status && !["current", "past", "prospective"].includes(patch.status)) {
    delete next.status;
  }
  customers[i] = next;
  writeCustomers({ customers });
  return customers[i];
}

export function deleteCustomer(id) {
  const data = readCustomers();
  const customers = (data.customers || []).filter((c) => c.id !== id);
  writeCustomers({ customers });
}

export function regenerateMagicLink(id) {
  return updateCustomer(id, { magicToken: randomUUID() });
}

export function addDocumentToCustomer(customerId, doc) {
  const data = readCustomers();
  const customers = data.customers || [];
  const i = customers.findIndex((c) => c.id === customerId);
  if (i === -1) return null;
  const docs = [...(customers[i].documents || []), doc];
  customers[i] = { ...customers[i], documents: docs };
  writeCustomers({ customers });
  return customers[i];
}
