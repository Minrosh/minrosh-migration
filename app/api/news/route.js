import { getNewsData } from "@/lib/news-data";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  return apiOk(getNewsData(), context);
}
