import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "48px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            marginBottom: "24px",
          }}
        >
          ✅
        </div>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#28a745",
            margin: "0 0 16px 0",
          }}
        >
          Welcome
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#6c757d",
            margin: "0 0 32px 0",
          }}
        >
          Service is running successfully
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/courses"
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            📚 Courses
          </Link>

          <Link
            href="/ebooks"
            style={{
              padding: "12px 24px",
              backgroundColor: "#6f42c1",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            📖 E-books
          </Link>

          <Link
            href="/dashboard"
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            🏠 Dashboard
          </Link>
        </div>

        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#6c757d",
          }}
        >
          <strong>Status:</strong> All systems operational 🚀
        </div>
      </div>
    </div>
  );
}
