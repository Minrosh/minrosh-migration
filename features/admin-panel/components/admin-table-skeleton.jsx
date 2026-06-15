/**
 * Table-shaped skeleton for admin list views (replaces plain “Loading…” text).
 */
export function AdminTableSkeleton({ rows = 6, cols = 5 }) {
  const gridStyle = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
  return (
    <div className="admin-table-skeleton" aria-busy="true" aria-label="Loading table">
      <div className="admin-table-skeleton__header" style={gridStyle}>
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} className="admin-table-skeleton__pulse admin-table-skeleton__cell admin-table-skeleton__cell--head" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="admin-table-skeleton__row" style={gridStyle}>
          {Array.from({ length: cols }, (_, c) => (
            <div
              key={c}
              className="admin-table-skeleton__pulse admin-table-skeleton__cell"
              style={{ width: c === 0 ? "72%" : "88%" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
