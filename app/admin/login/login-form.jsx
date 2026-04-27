"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyNotice = useMemo(() => {
    const v = searchParams.get("verify");
    if (v === "ok") return { tone: "ok", text: "Email verified. You can sign in below." };
    if (v === "expired") return { tone: "bad", text: "That verification link has expired. Ask a super admin to resend it from Admin → Users." };
    if (v === "invalid" || v === "missing") return { tone: "bad", text: "That verification link is invalid. Request a new one from your admin." };
    if (v === "rate") return { tone: "bad", text: "Too many attempts. Try again in a few minutes." };
    return null;
  }, [searchParams]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          password,
          totp: totp.trim() || undefined,
        }),
      });
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      if (!res.ok) {
        const errorMessage = payload?.error?.message || payload?.error || data?.error || "Login failed";
        setError(errorMessage);
        setLoading(false);
        return;
      }
      const dest = searchParams.get("from") || "/admin";
      router.push(dest.startsWith("/admin") ? dest : "/admin");
      router.refresh();
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin sign in</CardTitle>
        <CardDescription>
          Optional <strong>email</strong> for accounts created under Admin → Users. Otherwise use the main{" "}
          <code className="rounded bg-muted px-1">ADMIN_PASSWORD</code> (or stored bcrypt hash). If{" "}
          <code className="rounded bg-muted px-1">ADMIN_TOTP_SECRET</code> is set, enter your 6-digit code too.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verifyNotice ? (
          <p
            className={
              verifyNotice.tone === "ok"
                ? "mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900"
                : "mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            }
          >
            {verifyNotice.text}
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="Leave blank for main admin password"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totp">Authenticator code (if enabled)</Label>
            <Input
              id="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
