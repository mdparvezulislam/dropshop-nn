"use client";

// Root-level crash screen (replaces the entire layout when the root layout
// itself fails). Deliberately hook-free and dependency-free: Next's built-in
// default fails to prerender on this canary (null dispatcher inside the
// framework chunk), and the less this page depends on, the less can break
// while everything else is already broken.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="bn">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
          color: "#0f172a",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "3rem", margin: 0 }} aria-hidden>
            ⚠️
          </p>
          <h1 style={{ fontSize: "1.25rem", margin: "1rem 0 0.5rem" }}>কিছু একটা সমস্যা হয়েছে</h1>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 1.5rem" }}>
            অনুগ্রহ করে আবার চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "#f59e0b",
              color: "#0f172a",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}
