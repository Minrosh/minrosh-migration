import newsData from "../../../data/news.json";

export async function GET() {
  return Response.json(newsData);
}
