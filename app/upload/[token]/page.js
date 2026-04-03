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
        Hi {customer.name || "there"}, use this secure link to send PDF or image files to MinRosh Migration.
      </p>
      <PublicUploadForm token={token} />
    </div>
  );
}
