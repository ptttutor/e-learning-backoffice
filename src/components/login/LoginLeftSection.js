"use client";
import { UserOutlined } from "@ant-design/icons";

export default function LoginLeftSection({ isMobile, isSmallMobile }) {
  const leftSideStyle = {
    flex: isMobile ? "none" : 1,
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isSmallMobile ? "16px" : isMobile ? "20px" : "40px",
    minHeight: isMobile ? "40vh" : "auto"
  };

  const imagePlaceholderStyle = {
    width: isSmallMobile ? "200px" : isMobile ? "250px" : "400px",
    height: isSmallMobile ? "150px" : isMobile ? "180px" : "300px",
    backgroundColor: "#f8f9fa",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: isMobile ? "0 auto 20px" : "0 auto 30px",
    border: "2px dashed #dee2e6"
  };

  return (
    <div style={leftSideStyle}>
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={imagePlaceholderStyle}>
          {/* Image placeholder */}
          <div style={{ textAlign: "center", color: "#6c757d" }}>
            <UserOutlined style={{ 
              fontSize: isSmallMobile ? "40px" : "60px", 
              marginBottom: "16px" 
            }} />
            <div style={{ 
              fontSize: isSmallMobile ? "14px" : "16px", 
              fontWeight: "500" 
            }}>
              ระบบจัดการการเรียนรู้
            </div>
            <div style={{ 
              fontSize: isSmallMobile ? "12px" : "14px", 
              marginTop: "8px" 
            }}>
              E-Learning Management System
            </div>
          </div>
        </div>
        <div style={{ 
          color: "#495057", 
          fontSize: isSmallMobile ? "16px" : "18px", 
          fontWeight: "600" 
        }}>
          ยินดีต้อนรับสู่ระบบ
        </div>
        <div style={{ 
          color: "#6c757d", 
          fontSize: isSmallMobile ? "12px" : "14px", 
          marginTop: "8px" 
        }}>
          จัดการคอร์สเรียนและผู้เรียนอย่างมีประสิทธิภาพ
        </div>
      </div>
    </div>
  );
}
