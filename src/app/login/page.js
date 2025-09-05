"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Alert
} from "antd";
import { 
  UserOutlined, 
  LockOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(0);

  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectUrl = searchParams.get("redirect");

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // ถ้าเป็น admin และมี redirect ไป admin
      if (user.role === 'ADMIN' && redirectUrl && redirectUrl.includes('/admin')) {
        router.push(redirectUrl);
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push(redirectUrl || "/dashboard");
      }
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    const result = await login(values.email, values.password);

    if (result.success) {
      // Redirect logic จะถูกจัดการใน useEffect
      // ไม่จำเป็นต้องทำ redirect ที่นี่ เพราะจะทำซ้ำ
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // Responsive variables
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;
  const isTablet = windowWidth <= 1024;

  const isTabletOrMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <>
      {/* Responsive CSS */}
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
        }
        
        .left-side {
          flex: 1;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        
        .right-side {
          width: 500px;
          background: linear-gradient(135deg, #1890ff 0%, #1677ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        
        .image-placeholder {
          width: 400px;
          height: 300px;
          background-color: #f8f9fa;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          border: 2px dashed #dee2e6;
        }
        
        .login-card {
          width: 100%;
          max-width: 380px;
          background-color: #ffffff;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: none;
        }
        
        /* Tablet styles */
        @media (max-width: 1024px) {
          .left-side {
            padding: 20px;
          }
          .right-side {
            width: 400px;
            padding: 20px;
          }
          .image-placeholder {
            width: 300px;
            height: 220px;
          }
          .login-card {
            max-width: 320px;
          }
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
          }
          .left-side {
            flex: none;
            min-height: 40vh;
            padding: 20px;
          }
          .right-side {
            flex: 1;
            width: 100%;
            padding: 20px;
          }
          .image-placeholder {
            width: 250px;
            height: 180px;
            margin-bottom: 20px;
          }
          .login-card {
            max-width: 100%;
            padding: 24px;
          }
        }
        
        /* Small mobile styles */
        @media (max-width: 480px) {
          .left-side {
            min-height: 30vh;
            padding: 16px;
          }
          .right-side {
            padding: 16px;
          }
          .image-placeholder {
            width: 200px;
            height: 150px;
          }
          .login-card {
            padding: 20px;
            border-radius: 16px;
          }
        }
      `}</style>

      <div className="login-container">
        {/* Left Side - White Background with Image */}
        <div className="left-side">
          <div style={{ textAlign: "center", width: "100%" }}>
            <div className="image-placeholder">
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

        {/* Right Side - Blue Background with White Login Form */}
        <div className="right-side">
          <Card className="login-card">
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Title level={2} style={{ 
                margin: "0 0 8px 0", 
                color: "#1f2937", 
                fontSize: isSmallMobile ? "24px" : "28px" 
              }}>
                เข้าสู่ระบบ
              </Title>
              <Paragraph style={{ 
                marginBottom: 0, 
                color: "#6b7280", 
                fontSize: isSmallMobile ? "14px" : "16px" 
              }}>
                กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
              </Paragraph>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                message="เข้าสู่ระบบไม่สำเร็จ"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError("")}
                style={{ marginBottom: "24px" }}
              />
            )}

            {/* Login Form */}
            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label="อีเมล"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#d1d5db" }} />}
                  placeholder="กรุณากรอกอีเมล"
                  style={{ 
                    height: isSmallMobile ? "44px" : "48px",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    fontSize: isSmallMobile ? "14px" : "16px"
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="รหัสผ่าน"
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#d1d5db" }} />}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  style={{ 
                    height: isSmallMobile ? "44px" : "48px",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    fontSize: isSmallMobile ? "14px" : "16px"
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "16px", marginTop: "24px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    height: isSmallMobile ? "46px" : "50px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #1890ff 0%, #1677ff 100%)",
                    border: "none",
                    fontSize: isSmallMobile ? "14px" : "16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)"
                  }}
                >
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </Form.Item>

              {/* Forgot Password */}
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Button type="link" style={{ 
                  color: "#9ca3af", 
                  padding: 0, 
                  fontSize: isSmallMobile ? "12px" : "14px" 
                }}>
                  ลืมรหัสผ่าน?
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
}
