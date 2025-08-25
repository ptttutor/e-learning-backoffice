"use client";

import { Card, Button, Space, Typography, Row, Col } from "antd";
import { 
  SafetyOutlined, 
  DatabaseOutlined, 
  UserOutlined, 
  BookOutlined,
  BarChartOutlined,
  ApiOutlined 
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

export default function Home() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <Title level={1} style={{ color: "white", fontSize: "48px", marginBottom: "16px" }}>
            ฟิสิกส์พี่เต้ย
          </Title>
          <Title level={3} style={{ color: "rgba(255,255,255,0.8)", fontWeight: "normal" }}>
            ระบบจัดการเรียนรู้ออนไลน์
          </Title>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              style={{ 
                height: "100%",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}
            >
              <SafetyOutlined style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }} />
              <Title level={4}>Admin Panel</Title>
              <Text type="secondary">
                เข้าสู่ระบบจัดการสำหรับผู้ดูแลระบบ
              </Text>
              <div style={{ marginTop: "24px" }}>
                <Link href="/admin/login">
                  <Button type="primary" size="large" block>
                    เข้าสู่ระบบ Admin
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              style={{ 
                height: "100%",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}
            >
              <DatabaseOutlined style={{ fontSize: "48px", color: "#52c41a", marginBottom: "16px" }} />
              <Title level={4}>จัดการฐานข้อมูล</Title>
              <Text type="secondary">
                ดูและจัดการข้อมูลในระบบ
              </Text>
              <div style={{ marginTop: "24px" }}>
                <Link href="/admin/database/tables">
                  <Button size="large" block>
                    เข้าสู่ฐานข้อมูล
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              style={{ 
                height: "100%",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}
            >
              <ApiOutlined style={{ fontSize: "48px", color: "#fa8c16", marginBottom: "16px" }} />
              <Title level={4}>ทดสอบ API</Title>
              <Text type="secondary">
                ทดสอบ API endpoints ทั้งหมด
              </Text>
              <div style={{ marginTop: "24px" }}>
                <Link href="/test-admin-api">
                  <Button size="large" block>
                    ทดสอบ API
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              style={{ 
                height: "100%",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}
            >
              <UserOutlined style={{ fontSize: "48px", color: "#eb2f96", marginBottom: "16px" }} />
              <Title level={4}>จัดการผู้ใช้</Title>
              <Text type="secondary">
                จัดการข้อมูลผู้ใช้ทั้งหมด
              </Text>
              <div style={{ marginTop: "24px" }}>
                <Link href="/admin/users">
                  <Button size="large" block>
                    จัดการผู้ใช้
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              style={{ 
                height: "100%",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}
            >
              <BookOutlined style={{ fontSize: "48px", color: "#722ed1", marginBottom: "16px" }} />
              <Title level={4}>จัดการคอร์ส</Title>
              <Text type="secondary">
                จัดการคอร์สเรียนทั้งหมด
              </Text>
              <div style={{ marginTop: "24px" }}>
                <Link href="/admin/courses">
                  <Button size="large" block>
                    จัดการคอร์ส
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              style={{ 
                height: "100%",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}
            >
              <BarChartOutlined style={{ fontSize: "48px", color: "#13c2c2", marginBottom: "16px" }} />
              <Title level={4}>Dashboard</Title>
              <Text type="secondary">
                ภาพรวมและสถิติของระบบ
              </Text>
              <div style={{ marginTop: "24px" }}>
                <Link href="/admin/dashboard">
                  <Button size="large" block>
                    ดู Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
        </Row>

        <div style={{ 
          textAlign: "center", 
          marginTop: "60px",
          padding: "40px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)"
        }}>
          <Title level={4} style={{ color: "white", marginBottom: "16px" }}>
            ข้อมูลสำหรับทดสอบ
          </Title>
          <Space direction="vertical" size="small">
            <Text style={{ color: "rgba(255,255,255,0.9)" }}>
              <strong>Admin Email:</strong> admin@physics.com
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.9)" }}>
              <strong>Admin Password:</strong> admin123
            </Text>
          </Space>
        </div>
      </div>
    </div>
  );
}