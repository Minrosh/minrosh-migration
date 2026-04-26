"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

function contextualError(operation, message, fallback) {
  const detail = String(message || fallback || "Unexpected error").trim();
  return `${operation}: ${detail}`;
}

function Icon({ children, className }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const nav = [
  {
    href: "/admin",
    label: "Overview",
    group: "Dashboard",
    icon: (
      <Icon>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </Icon>
    ),
  },
  {
    href: "/admin/crm",
    label: "CRM",
    group: "CRM",
    icon: (
      <Icon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    ),
  },
  {
    href: "/admin/crm-insights",
    label: "CRM Insights",
    group: "CRM",
    icon: (
      <Icon>
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 2 5-6" />
      </Icon>
    ),
  },
  {
    href: "/admin/leads",
    label: "Leads",
    group: "CRM",
    icon: (
      <Icon>
        <path d="M12 2v4" />
        <path d="m16 6-4-4-4 4" />
        <path d="M4 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10" />
      </Icon>
    ),
  },
  {
    href: "/admin/pipeline",
    label: "Pipeline",
    group: "CRM",
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="4" rx="1" />
        <rect x="14" y="10" width="7" height="11" rx="1" />
        <rect x="3" y="12" width="7" height="9" rx="1" />
      </Icon>
    ),
  },
  {
    href: "/admin/inbox",
    label: "Inbox",
    group: "CRM",
    icon: (
      <Icon>
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </Icon>
    ),
  },
  {
    href: "/admin/tasks",
    label: "Tasks",
    group: "CRM",
    icon: (
      <Icon>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </Icon>
    ),
  },
  {
    href: "/admin/automations",
    label: "Automations",
    group: "CRM",
    icon: (
      <Icon>
        <path d="M12 2v4" />
        <path d="m16.2 7.8 2.9-2.9" />
        <path d="M18 12h4" />
        <path d="m16.2 16.2 2.9 2.9" />
        <path d="M12 18v4" />
        <path d="m7.8 16.2-2.9 2.9" />
        <path d="M6 12H2" />
        <path d="m7.8 7.8-2.9-2.9" />
        <circle cx="12" cy="12" r="3" />
      </Icon>
    ),
  },
  {
    href: "/admin/intelligence",
    label: "Intelligence",
    group: "Content",
    icon: (
      <Icon>
        <path d="M12 2a7 7 0 0 0-7 7c0 2.1.92 3.99 2.38 5.27.4.35.62.85.62 1.38V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.35c0-.53.23-1.03.63-1.39A7 7 0 0 0 19 9a7 7 0 0 0-7-7Z" />
        <path d="M9 22h6" />
        <path d="M10 18h4" />
      </Icon>
    ),
  },
  {
    href: "/admin/news",
    label: "News",
    group: "Content",
    icon: (
      <Icon>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </Icon>
    ),
  },
  {
    href: "/admin/reports",
    label: "Reports",
    group: "Admin",
    icon: (
      <Icon>
        <path d="M3 3v18h18" />
        <path d="M7 12v5" />
        <path d="M12 8v9" />
        <path d="M17 5v12" />
      </Icon>
    ),
  },
  {
    href: "/admin/quotes",
    label: "Quotes",
    group: "Finance",
    icon: (
      <Icon>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </Icon>
    ),
  },
  {
    href: "/admin/invoices",
    label: "Invoices",
    group: "Finance",
    icon: (
      <Icon>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </Icon>
    ),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    group: "CRM",
    icon: (
      <Icon>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </Icon>
    ),
  },
  {
    href: "/admin/success-stories",
    label: "Success Stories",
    group: "Content",
    icon: (
      <Icon>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </Icon>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    group: "Admin",
    icon: (
      <Icon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    ),
  },
  {
    href: "/admin/audit",
    label: "Audit Log",
    group: "Admin",
    icon: (
      <Icon>
        <path d="M15 12h-5" />
        <path d="M15 8h-5" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
        <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
      </Icon>
    ),
  },
];

export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [compactNav, setCompactNav] = useState(true);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState("info");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function changePassword() {
    setPasswordMessage("");
    setPasswordMessageType("info");
    const currentPassword = prompt("Enter current admin password:");
    if (!currentPassword) return;
    const newPassword = prompt("Enter new admin password (min 8 chars):");
    if (!newPassword) return;
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      if (!res.ok) {
        setPasswordMessage(
          contextualError(
            "Change password",
            payload?.error?.message || payload?.error || data?.error,
            "Could not update password."
          )
        );
        setPasswordMessageType("error");
        return;
      }
      setPasswordMessage("Change password: Admin password updated successfully.");
      setPasswordMessageType("success");
    } catch {
      setPasswordMessage(contextualError("Change password", "", "Network error while updating password."));
      setPasswordMessageType("error");
    }
  }

  const asideClass =
    "fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border/80 bg-card/95 backdrop-blur-md shadow-sm transition-transform max-md:w-[min(100vw-3rem,16rem)]";

  const navGroups = ["Dashboard", "CRM", "Finance", "Content", "Admin"];
  const compactAllowedByGroup = {
    Dashboard: new Set(["Overview"]),
    CRM: new Set(["CRM", "CRM Insights", "Customers", "Leads"]),
    Finance: new Set(["Invoices", "Quotes"]),
    Content: new Set(["Intelligence", "News"]),
    Admin: new Set(["Users", "Audit Log"]),
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <button
        type="button"
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card shadow md:hidden"
        aria-label="Open menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <span className="text-lg leading-none">☰</span>
      </button>
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside
        className={cn(asideClass, "max-md:-translate-x-full", mobileNavOpen && "max-md:translate-x-0")}
      >
        <div className="border-b border-border p-4 bg-gradient-to-r from-primary/5 to-transparent">
          <Link href="/" className="text-lg font-semibold text-primary" onClick={() => setMobileNavOpen(false)}>
            MinRosh Admin
          </Link>
          <p className="text-xs text-muted-foreground">CRM workspace</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">Navigation</p>
            <button
              type="button"
              className="text-[11px] font-medium text-primary hover:underline"
              onClick={() => setCompactNav((v) => !v)}
            >
              {compactNav ? "Show all" : "Compact"}
            </button>
          </div>
          {navGroups.map((group) => {
            const items = nav.filter((item) => {
              if (item.group !== group) return false;
              if (!compactNav) return true;
              const allow = compactAllowedByGroup[group];
              return allow ? allow.has(item.label) : true;
            });
            if (items.length === 0) return null;
            return (
              <div key={group} className="mb-2">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {group}
                </p>
                <div className="flex flex-col gap-1">
                  {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        onClick={() => setMobileNavOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          {passwordMessage ? (
            <p
              className={cn(
                "mb-2 text-xs",
                passwordMessageType === "error" ? "text-destructive" : "text-emerald-600"
              )}
            >
              {passwordMessage}
            </p>
          ) : null}
          <Button
            variant="secondary"
            className="mb-2 w-full justify-start gap-2"
            type="button"
            onClick={changePassword}
          >
            <Icon>
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V8a5 5 0 0 1 10 0v3" />
            </Icon>
            Change password
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" type="button" onClick={logout}>
            <Icon>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </Icon>
            Log out
          </Button>
          <Link
            href="/"
            className="mt-2 block text-center text-xs text-muted-foreground hover:underline"
            onClick={() => setMobileNavOpen(false)}
          >
            View public site
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-4 pt-16 md:ml-56 md:p-8 md:pt-8">{children}</main>
    </div>
  );
}
