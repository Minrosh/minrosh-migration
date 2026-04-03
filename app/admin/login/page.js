import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
