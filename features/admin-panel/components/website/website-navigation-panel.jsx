"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

export function WebsiteNavigationPanel() {
  const [navLinks, setNavLinks] = useState([{ label: "", href: "" }]);
  const [footerLine, setFooterLine] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [navRes, footerRes] = await Promise.all([
      fetch("/api/admin/website/navigation", { cache: "no-store" }),
      fetch("/api/admin/website/footer", { cache: "no-store" }),
    ]);
    const navPayload = await parseJsonResponseSafe(navRes);
    const footerPayload = await parseJsonResponseSafe(footerRes);
    const links = navPayload?.data?.navigation?.primaryLinks || navPayload?.navigation?.primaryLinks;
    if (Array.isArray(links) && links.length) setNavLinks(links);
    const line = footerPayload?.data?.footer?.complianceLine || footerPayload?.footer?.complianceLine;
    if (line) setFooterLine(line);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveNav() {
    setMessage("");
    const res = await fetch("/api/admin/website/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLinks: navLinks, updatedBy: "admin" }),
    });
    if (!res.ok) {
      setMessage("Navigation save failed");
      return;
    }
    setMessage("Navigation saved to data/website-navigation.json");
  }

  async function saveFooter() {
    setMessage("");
    const res = await fetch("/api/admin/website/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complianceLine: footerLine, linkGroups: [], updatedBy: "admin" }),
    });
    if (!res.ok) {
      setMessage("Footer save failed");
      return;
    }
    setMessage("Footer saved to data/website-footer.json");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Header primary links</h2>
        {navLinks.map((link, index) => (
          <div key={`nav-${index}`} className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Label</Label>
              <Input
                value={link.label}
                onChange={(e) =>
                  setNavLinks((prev) => prev.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)))
                }
              />
            </div>
            <div>
              <Label>Link</Label>
              <Input
                value={link.href}
                onChange={(e) =>
                  setNavLinks((prev) => prev.map((l, i) => (i === index ? { ...l, href: e.target.value } : l)))
                }
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setNavLinks((p) => [...p, { label: "", href: "" }])}>
          + Add link
        </Button>
        <Button type="button" onClick={saveNav}>
          Save navigation
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Footer compliance line</h2>
        <Input value={footerLine} onChange={(e) => setFooterLine(e.target.value)} />
        <Button type="button" onClick={saveFooter}>
          Save footer line
        </Button>
      </section>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
}
