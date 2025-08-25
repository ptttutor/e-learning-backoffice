"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  Spin,
  Tabs,
  message,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  BellOutlined,
  CloudUploadOutlined,
  ApiOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function TestAdminAPIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testAPI = async (endpoint, method = "GET", body = null) => {
    setLoading(true);
    setError(null);

    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();

      setResult({
        endpoint,
        method,
        status: response.status,
        data,
      });

      if (data.success) {
        message.success(`${method} ${endpoint} สำเร็จ!`);
      } else {
        message.error(`${method} ${endpoint} ล้มเหลว: ${data.message}`);
      }
    } catch (err) {
      setError(err.message);
      message.error(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const apiTests = {
    dashboard: [
      {
        name: "Dashboard Overview",
        endpoint: "/api/admin/dashboard",
        method: "GET",
        description: "ดึงข้อมูลสถิติและกราฟสำหรับ Dashboard",
      },
    ],
    users: [
      {
        name: "Get All Users",
        endpoint: "/api/admin/users?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการผู้ใช้ทั้งหมด",
      },
      {
        name: "Create Test User",
        endpoint: "/api/admin/users",
        method: "POST",
        body: {
          email: `testuser${Date.now()}@example.com`,
          firstName: "ทดสอบ",
          lastName: "ผู้ใช้",
          role: "student",
          password: "password123",
        },
        description: "สร้างผู้ใช้ทดสอบใหม่",
      },
    ],
    courses: [
      {
        name: "Get All Courses",
        endpoint: "/api/admin/courses?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการคอร์สทั้งหมด",
      },
      {
        name: "Get Course Chapters",
        endpoint: "/api/admin/course-chapters",
        method: "GET",
        description: "ดึงรายการบทเรียน",
      },
      {
        name: "Get Course Lessons",
        endpoint: "/api/admin/course-lessons",
        method: "GET",
        description: "ดึงรายการบทเรียนย่อย",
      },
    ],
    orders: [
      {
        name: "Get All Orders",
        endpoint: "/api/admin/orders?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการออเดอร์ทั้งหมด",
      },
      {
        name: "Get Payment Receipts",
        endpoint: "/api/admin/payment-receipts?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการใบเสร็จการชำระเงิน",
      },
    ],
    content: [
      {
        name: "Get Categories",
        endpoint: "/api/admin/categories",
        method: "GET",
        description: "ดึงรายการหมวดหมู่",
      },
      {
        name: "Get Subjects",
        endpoint: "/api/admin/subjects",
        method: "GET",
        description: "ดึงรายการวิชา",
      },
      {
        name: "Get Articles",
        endpoint: "/api/admin/articles?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการบทความ",
      },
      {
        name: "Get Article Tags",
        endpoint: "/api/admin/article-tags",
        method: "GET",
        description: "ดึงรายการแท็กบทความ",
      },
    ],
    exams: [
      {
        name: "Get Exam Types",
        endpoint: "/api/admin/exam-types",
        method: "GET",
        description: "ดึงรายการประเภทข้อสอบ",
      },
      {
        name: "Get Exam Sets",
        endpoint: "/api/admin/exam-sets?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการชุดข้อสอบ",
      },
    ],
    student: [
      {
        name: "Get Enrollments",
        endpoint: "/api/admin/enrollments?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการการลงทะเบียน",
      },
      {
        name: "Get Reviews",
        endpoint: "/api/admin/reviews?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการรีวิว",
      },
    ],
    promotions: [
      {
        name: "Get Promotions",
        endpoint: "/api/admin/promotions?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการโปรโมชั่น",
      },
    ],
    communication: [
      {
        name: "Get Announcements",
        endpoint: "/api/admin/announcements?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการประกาศ",
      },
      {
        name: "Get Notifications",
        endpoint: "/api/admin/notifications?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการการแจ้งเตือน",
      },
    ],
    system: [
      {
        name: "Get Settings",
        endpoint: "/api/admin/settings",
        method: "GET",
        description: "ดึงการตั้งค่าระบบ",
      },
      {
        name: "Get Uploaded Files",
        endpoint: "/api/admin/upload?page=1&limit=5",
        method: "GET",
        description: "ดึงรายการไฟล์ที่อัพโหลด",
      },
    ],
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Title level={1}>
          <ApiOutlined /> ทดสอบ Admin APIs
        </Title>

        <Alert
          message="Admin API Testing"
          description="ทดสอบ API endpoints ทั้งหมดสำหรับระบบจัดการ Admin"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Tabs defaultActiveKey="dashboard" type="card">
              <TabPane
                tab={
                  <span>
                    <DashboardOutlined />
                    Dashboard
                  </span>
                }
                key="dashboard"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {apiTests.dashboard.map((test, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>{test.name}</Text>
                        <Text type="secondary">{test.description}</Text>
                        <Text code>
                          {test.method} {test.endpoint}
                        </Text>
                        <Button
                          type="primary"
                          loading={loading}
                          onClick={() =>
                            testAPI(test.endpoint, test.method, test.body)
                          }
                        >
                          ทดสอบ
                        </Button>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Users
                  </span>
                }
                key="users"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {apiTests.users.map((test, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>{test.name}</Text>
                        <Text type="secondary">{test.description}</Text>
                        <Text code>
                          {test.method} {test.endpoint}
                        </Text>
                        <Button
                          type="primary"
                          loading={loading}
                          onClick={() =>
                            testAPI(test.endpoint, test.method, test.body)
                          }
                        >
                          ทดสอบ
                        </Button>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BookOutlined />
                    Courses
                  </span>
                }
                key="courses"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {apiTests.courses.map((test, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>{test.name}</Text>
                        <Text type="secondary">{test.description}</Text>
                        <Text code>
                          {test.method} {test.endpoint}
                        </Text>
                        <Button
                          type="primary"
                          loading={loading}
                          onClick={() =>
                            testAPI(test.endpoint, test.method, test.body)
                          }
                        >
                          ทดสอบ
                        </Button>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <ShoppingCartOutlined />
                    Orders
                  </span>
                }
                key="orders"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {apiTests.orders.map((test, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>{test.name}</Text>
                        <Text type="secondary">{test.description}</Text>
                        <Text code>
                          {test.method} {test.endpoint}
                        </Text>
                        <Button
                          type="primary"
                          loading={loading}
                          onClick={() =>
                            testAPI(test.endpoint, test.method, test.body)
                          }
                        >
                          ทดสอบ
                        </Button>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BookOutlined />
                    Content
                  </span>
                }
                key="content"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {apiTests.content.map((test, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>{test.name}</Text>
                        <Text type="secondary">{test.description}</Text>
                        <Text code>
                          {test.method} {test.endpoint}
                        </Text>
                        <Button
                          type="primary"
                          loading={loading}
                          onClick={() =>
                            testAPI(test.endpoint, test.method, test.body)
                          }
                        >
                          ทดสอบ
                        </Button>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BellOutlined />
                    Communication
                  </span>
                }
                key="communication"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {apiTests.communication.map((test, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>{test.name}</Text>
                        <Text type="secondary">{test.description}</Text>
                        <Text code>
                          {test.method} {test.endpoint}
                        </Text>
                        <Button
                          type="primary"
                          loading={loading}
                          onClick={() =>
                            testAPI(test.endpoint, test.method, test.body)
                          }
                        >
                          ทดสอบ
                        </Button>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </TabPane>
            </Tabs>

            <Card title="Quick Tests" style={{ marginTop: 16 }}>
              <Space wrap>
                <Button
                  icon={<DashboardOutlined />}
                  onClick={() => testAPI("/api/admin/dashboard")}
                  loading={loading}
                >
                  Dashboard
                </Button>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => testAPI("/api/admin/users?limit=3")}
                  loading={loading}
                >
                  Users
                </Button>
                <Button
                  icon={<BookOutlined />}
                  onClick={() => testAPI("/api/admin/courses?limit=3")}
                  loading={loading}
                >
                  Courses
                </Button>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => testAPI("/api/admin/settings")}
                  loading={loading}
                >
                  Settings
                </Button>
                <Button
                  icon={<ApiOutlined />}
                  onClick={() => testAPI("/api/admin")}
                  loading={loading}
                >
                  API Docs
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="ผลลัพธ์การทดสอบ"
              style={{ height: "fit-content", minHeight: "400px" }}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text>กำลังทดสอบ API...</Text>
                  </div>
                </div>
              ) : error ? (
                <Alert
                  message="เกิดข้อผิดพลาด"
                  description={error}
                  type="error"
                  showIcon
                />
              ) : result ? (
                <div>
                  <Space
                    direction="vertical"
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    <Text>
                      <Text strong>Endpoint:</Text> {result.method}{" "}
                      {result.endpoint}
                    </Text>
                    <Text>
                      <Text strong>Status:</Text> {result.status}
                    </Text>
                  </Space>
                  <pre
                    style={{
                      background: "#f6f8fa",
                      padding: "16px",
                      borderRadius: "6px",
                      overflow: "auto",
                      fontSize: "12px",
                      lineHeight: "1.5",
                      maxHeight: "500px",
                    }}
                  >
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#999",
                  }}
                >
                  <ApiOutlined style={{ fontSize: "48px", marginBottom: 16 }} />
                  <div>เลือก API เพื่อทดสอบ</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
