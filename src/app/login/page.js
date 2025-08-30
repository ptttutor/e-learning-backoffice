"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithLine, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      router.push(redirect || "/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      router.push(redirect || "/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleLineLogin = async () => {
    setLineLoading(true);
    setError("");
    try {
      await loginWithLine();
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย LINE");
      setLineLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Background Animation */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: "float 6s ease-in-out infinite",
        }}
      ></div>

      <div
        style={{
          backgroundColor: "white",
          padding: "48px",
          borderRadius: "20px",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "64px",
              marginBottom: "20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🚀
          </div>
          <h1
            style={{
              margin: "0 0 12px 0",
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ยินดีต้อนรับกลับ
          </h1>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          >
            เข้าสู่ระบบเพื่อเริ่มต้นการเรียนรู้ที่ยอดเยี่ยม
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              borderRadius: "12px",
              marginBottom: "24px",
              fontSize: "14px",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>⚠️</span>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#374151",
                fontSize: "14px",
              }}
            >
              📧 อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.3s ease",
                backgroundColor: "#f9fafb",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
              placeholder="example@email.com"
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#374151",
                fontSize: "14px",
              }}
            >
              🔒 รหัสผ่าน
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "16px 50px 16px 20px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: "#f9fafb",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.backgroundColor = "#f9fafb";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="รหัสผ่านของคุณ"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#6b7280",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              background: loading
                ? "#9ca3af"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 8px 25px rgba(102, 126, 234, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #ffffff40",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></span>
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "18px" }}>🚀</span>
                เข้าสู่ระบบ
              </span>
            )}
          </button>
        </form>

        {/* LINE Login */}
        <div
          style={{
            textAlign: "center",
            margin: "32px 0",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "24px 0",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
              }}
            ></div>
            <span
              style={{
                backgroundColor: "white",
                padding: "0 20px",
                color: "#6b7280",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              หรือเข้าสู่ระบบด้วย
            </span>
          </div>

          <button
            onClick={handleLineLogin}
            disabled={lineLoading}
            style={{
              width: "100%",
              padding: "16px 24px",
              backgroundColor: lineLoading ? "#9ca3af" : "#00C300",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: lineLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!lineLoading) {
                e.target.style.backgroundColor = "#00B300";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(0, 195, 0, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!lineLoading) {
                e.target.style.backgroundColor = "#00C300";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {lineLoading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #ffffff40",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></span>
                กำลังเชื่อมต่อ LINE...
              </span>
            ) : (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                เข้าสู่ระบบด้วย LINE
              </>
            )}
          </button>
        </div>

        {/* Register Link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
            paddingTop: "32px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <p
            style={{ margin: "0 0 20px 0", color: "#6b7280", fontSize: "15px" }}
          >
            ยังไม่มีบัญชี?
          </p>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              padding: "14px 28px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              textDecoration: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <span style={{ marginRight: "8px" }}>📝</span>
            สมัครสมาชิก
          </Link>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            href="/"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#5a67d8")}
            onMouseLeave={(e) => (e.target.style.color = "#667eea")}
          >
            ← กลับไปหน้าหลัก
          </Link>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
