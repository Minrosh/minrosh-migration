/** Plain-text body → paragraphs (no HTML from sources). */
export function NewsArticleProse({ text }) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const blocks = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="news-article-prose">
      {blocks.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}
