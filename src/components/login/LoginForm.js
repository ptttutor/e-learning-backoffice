"use client";
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Alert
} from "antd";
import { 
  UserOutlined, 
  LockOutlined
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function LoginForm({ error, setError, loading, onSubmit, isSmallMobile }) {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <>
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
    </>
  );
}
