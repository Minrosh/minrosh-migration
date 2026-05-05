export default function Custom500() {
  return (
    <main
      id="main-content"
      style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}
    >
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>We hit an unexpected error</h1>
        <p>Please refresh and try again in a moment.</p>
      </div>
    </main>
  );
}
