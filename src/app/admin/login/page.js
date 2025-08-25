"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // ตรวจสอบ admin credentials (ในการใช้งานจริงควรเชื่อมต่อกับ API)
      if (values.email === "admin@physics.com" && values.password === "admin123") {
        // เก็บ session ใน localStorage (ในการใช้งานจริงควรใช้ JWT token)
        localStorage.setItem("adminSession", JSON.stringify({
          email: values.email,
          role: "admin",
          loginTime: new Date().toISOString()
        }));
        
        router.push("/admin/dashboard");
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
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
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <SafetyOutlined
            style={{
              fontSize: "48px",
              color: "#1890ff",
              marginBottom: "16px",
            }}
          />
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            Admin Panel
          </Title>
          <Text type="secondary">ระบบจัดการฟิสิกส์พี่เต้ย</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        )}

        <Form
          name="adminLogin"
          onFinish={onFinish}
          layout="vertical"
          size="large"
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
              prefix={<UserOutlined />}
              placeholder="admin@physics.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="รหัสผ่าน"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<LoginOutlined />}
            >
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: "center" }}>
          <Space direction="vertical" size="small">
            <Text type="secondary" style={{ fontSize: "12px" }}>
              ข้อมูลสำหรับทดสอบ:
            </Text>
            <Text code style={{ fontSize: "11px" }}>
              Email: admin@physics.com
            </Text>
            <Text code style={{ fontSize: "11px" }}>
              Password: admin123
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
}