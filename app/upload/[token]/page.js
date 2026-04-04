import { notFound } from "next/navigation";
import { findCustomerByMagicToken } from "@/lib/admin/customers-service";
import { PublicUploadForm } from "@/components/admin/public-upload-form";

export const metadata = {
  title: "Upload documents | MinRosh Migration",
  robots: { index: false, follow: false },
};

export default async function PublicUploadPage({ params }) {
  const { token } = await params;
  const customer = findCustomerByMagicToken(token);
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Upload documents</h1>
      <p className="mt-2 text-slate-600">
        Hi {customer.name || "there"}, use this private link (unique token) to send PDF or image files to MinRosh
        Migration. Files are stored in secured application storage, not under a public web folder. Keep this URL
        confidential; request a new link from us if it may have been exposed.
      </p>
      <PublicUploadForm token={token} />
    </div>
  );
}
