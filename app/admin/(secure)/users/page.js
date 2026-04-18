"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function AdminUsersPage() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const mePayload = await fetch("/api/admin/me").then((r) => r.json());
      const m = mePayload?.data && typeof mePayload.data === "object" ? mePayload.data : mePayload;
      setMe(m);
      if (!m.isSuper) {
        setUsers([]);
        setLoading(false);
        return;
      }
      const u = await fetch("/api/admin/users").then((r) => r.json());
      if (!u.users) {
        setMsg(u.error || "Could not load users");
        setUsers([]);
      } else {
        setUsers(u.users);
      }
    } catch {
      setMsg("Network error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createUser(e) {
    e.preventDefault();
    setMsg("");
    setVerificationLink("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Create failed");
      return;
    }
    setEmail("");
    setPassword("");
    setRole("admin");
    if (data.verificationEmailSent) {
      setMsg(`Created ${data.user?.email || "user"}. A verification link was sent to their inbox (48-hour expiry).`);
    } else {
      setMsg(
        `Created ${data.user?.email || "user"}, but the verification email could not be sent (${data.verificationEmailError || "unknown"}). Configure SMTP or use “Resend verification”.`,
      );
      setVerificationLink(String(data.verificationUrl || ""));
    }
    setUsers((prev) => [...prev, data.user]);
  }

  async function resendVerification(id) {
    setMsg("");
    setVerificationLink("");
    const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}/resend`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Resend failed");
      return;
    }
    if (data.verificationEmailSent) {
      setMsg("Verification email sent.");
    } else {
      setMsg(`Could not send email (${data.verificationEmailError || "unknown"}). Check SMTP settings.`);
      setVerificationLink(String(data.verificationUrl || ""));
    }
  }

  async function removeUser(id) {
    if (!confirm("Remove this admin user? They will no longer be able to sign in with that email.")) return;
    setMsg("");
    const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Delete failed");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setMsg("User removed");
  }

  async function setUserRole(id, nextRole) {
    setMsg("");
    const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Update failed");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)));
    setMsg("Role updated");
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Users</h1>
        <AdminTableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!me?.isSuper) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Users</h1>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Super admin only</CardTitle>
            <CardDescription>
              Managing admin accounts is limited to the <strong>super</strong> role. Sign in with the main site admin
              password (leave email blank on the login page), or ask a super admin to grant you the{" "}
              <code className="rounded bg-muted px-1">super</code> role in{" "}
              <code className="rounded bg-muted px-1">data/admin-users.json</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Users</h1>
      <p className="mb-6 text-muted-foreground">
        Email + password accounts in <code className="rounded bg-muted px-1">data/admin-users.json</code>. New users
        must <strong>verify their email</strong> (link sent via SMTP) before they can sign in. Legacy sign-in (password
        only, no email) stays <strong>super</strong> and can manage this list.
      </p>
      {msg ? <p className="mb-4 text-sm text-muted-foreground">{msg}</p> : null}
      {verificationLink ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs">
          <span className="font-medium text-amber-900">Manual verification link:</span>
          <a className="max-w-full truncate text-primary underline" href={verificationLink} target="_blank" rel="noreferrer">
            {verificationLink}
          </a>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(verificationLink);
                setMsg("Verification link copied to clipboard.");
              } catch {
                setMsg("Could not copy link. Please copy manually.");
              }
            }}
          >
            Copy link
          </Button>
        </div>
      ) : null}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add admin</CardTitle>
          <CardDescription>
            Minimum password length is 8 characters. SMTP must be configured on the server so the verification email can
            be delivered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid max-w-md gap-4" onSubmit={createUser}>
            <div className="space-y-2">
              <Label htmlFor="nu-email">Email</Label>
              <Input
                id="nu-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nu-password">Password</Label>
              <Input
                id="nu-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nu-role">Role</Label>
              <select
                id="nu-role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">admin (full admin UI, cannot manage users)</option>
                <option value="super">super (can manage users)</option>
              </select>
            </div>
            <Button type="submit">Create user</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No email-based admins yet</CardTitle>
              <CardDescription>Add one above so teammates can sign in with email + password.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          users.map((u) => (
            <Card key={u.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {u.email}
                    {u.emailVerified === false ? (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950">
                        Awaiting email verification
                      </span>
                    ) : (
                      <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-950">
                        Verified
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    role: <span className="font-medium text-foreground">{u.role}</span> · id: {u.id}
                    {u.verificationExpiresAt && u.emailVerified === false ? (
                      <> · link expires {new Date(u.verificationExpiresAt).toLocaleString()}</>
                    ) : null}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {u.emailVerified === false ? (
                    <Button type="button" size="sm" variant="default" onClick={() => resendVerification(u.id)}>
                      Resend verification
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" onClick={() => removeUser(u.id)}>
                    Remove
                  </Button>
                  {u.role === "super" ? (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setUserRole(u.id, "admin")}>
                      Make admin
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setUserRole(u.id, "super")}>
                      Make super
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
