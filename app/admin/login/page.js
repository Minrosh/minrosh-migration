import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";
import { getAdminSetupStatus } from "@/lib/admin/setup-status";

export default function AdminLoginPage() {
  const setup = getAdminSetupStatus();

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4">
      {!setup.adminAuthConfigured ? (
        <p className="absolute left-4 right-4 top-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Admin authentication is not configured. Please set{" "}
          <code className="rounded bg-amber-100 px-1">ADMIN_SESSION_SECRET</code> (24+ characters) and{" "}
          <code className="rounded bg-amber-100 px-1">ADMIN_PASSWORD</code> on the server.
        </p>
      ) : null}
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
