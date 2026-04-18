import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  const apiKey = String(process.env.GOOGLE_PLACES_API_KEY || "").trim();
  const placeId = String(process.env.GOOGLE_PLACES_PLACE_ID || "").trim();
  if (!apiKey || !placeId) {
    return apiOk({ reviews: [], reason: "places_not_configured" }, context);
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,reviews,user_ratings_total&reviews_sort=newest&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) {
      return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "places_http_error", status: 502 }, context);
    }
    const data = await res.json();
    if (data?.status && data.status !== "OK") {
      const status = String(data.status || "").toLowerCase();
      return apiFail(
        { code: API_ERROR_CODES.UPSTREAM_ERROR, message: `places_${status || "status_error"}`, status: 502 },
        context
      );
    }
    const result = data?.result || {};
    const reviews = Array.isArray(result.reviews) ? result.reviews.slice(0, 4) : [];
    return apiOk({
      placeName: result.name || "",
      rating: result.rating || null,
      totalRatings: result.user_ratings_total || null,
      reviews,
    }, context);
  } catch {
    return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "places_request_failed", status: 502 }, context);
  }
}
