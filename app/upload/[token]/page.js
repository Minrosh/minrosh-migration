import { notFound } from "next/navigation";
import { findCustomerByMagicToken } from "@/lib/admin/customers-service";
import { PublicUploadForm } from "@/components/admin/public-upload-form";
import { COMPLIANCE_FEATURE_FLAGS, DISABLED_PENDING_AUTHORISED_PROFESSIONAL_REVIEW } from "@/lib/compliance";

export default async function PublicUploadPage({ params }) {
  const { token } = await params;
  const customer = findCustomerByMagicToken(token);
  if (!customer) notFound();

  if (!COMPLIANCE_FEATURE_FLAGS.PUBLIC_MIGRATION_MATTER_PORTAL) {
    return (
      <main id="main-content" className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Document upload unavailable</h1>
        <p className="mt-2 text-slate-600">
          The public migration document portal is currently disabled. Historical records are retained for authorised
          admin review only and have not been deleted. For education-course or general information document requests,
          please contact MinRosh directly.
        </p>
        <p className="mt-4 text-xs text-slate-400" aria-hidden="true">
          {DISABLED_PENDING_AUTHORISED_PROFESSIONAL_REVIEW}
        </p>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Secure document centre</h1>
      <p className="mt-2 text-slate-600">
        Hi {customer.name || "there"}, use this private link (unique token) to upload your files, download templates,
        and track your submission timeline. Keep this URL confidential; request a new link from us if it may have been
        exposed.
      </p>
      <PublicUploadForm token={token} />
    </main>
  );
}
