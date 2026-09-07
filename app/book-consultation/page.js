import { permanentRedirect } from "next/navigation";

/** Legacy booking URL — permanently moved to information-session route. */
export default function BookConsultationRedirectPage() {
  permanentRedirect("/book-information-session");
}
