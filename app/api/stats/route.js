import { getFooterStats } from "../../../lib/site-stats";

export async function GET() {
  const stats = getFooterStats();
  return Response.json({
    ok: true,
    ...stats,
  });
}
