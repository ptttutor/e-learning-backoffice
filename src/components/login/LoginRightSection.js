"use client";
import { Card } from "antd";
import LoginForm from "./LoginForm";

export default function LoginRightSection({ error, setError, loading, onSubmit, isSmallMobile, isMobile, isTablet }) {
  const rightSideStyle = {
    width: isMobile ? "100%" : isTablet ? "400px" : "500px",
    background: "linear-gradient(135deg, #1890ff 0%, #1677ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isSmallMobile ? "16px" : "40px",
    flex: isMobile ? 1 : "none"
  };

  const cardStyle = {
    width: "100%",
    maxWidth: isMobile ? "100%" : isTablet ? "320px" : "380px",
    backgroundColor: "#ffffff",
    borderRadius: isSmallMobile ? "16px" : "20px",
    padding: isMobile ? "24px" : "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    border: "none"
  };

  return (
    <div style={rightSideStyle}>
      <Card style={cardStyle}>
        <LoginForm 
          error={error}
          setError={setError}
          loading={loading}
          onSubmit={onSubmit}
          isSmallMobile={isSmallMobile}
        />
      </Card>
    </div>
  );
}
