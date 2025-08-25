"use client";

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Button,
  Table,
  Tag,
  Progress,
  Alert,
  Spin,
  List,
  Avatar,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>กำลังโหลดข้อมูล Dashboard...</Text>
        </div>
      </div>
    );
  }

  // Mock data สำหรับแสดงผล
  const mockStats = {
    totalUsers: 1250,
    totalCourses: 45,
    totalOrders: 320,
    totalRevenue: 125000,
    newUsersToday: 12,
    activeUsers: 89,
    pendingOrders: 8,
    completedOrders: 312,
  };

  const recentOrders = [
    {
      key: "1",
      orderNumber: "ORD-2024-001",
      customer: "สมชาย ใจดี",
      course: "ฟิสิกส์ ม.6 เทอม 1",
      amount: 1500,
      status: "paid",
      date: "2024-01-15",
    },
    {
      key: "2",
      orderNumber: "ORD-2024-002",
      customer: "สมหญิง รักเรียน",
      course: "เคมี ม.5 เทอม 2",
      amount: 1200,
      status: "pending",
      date: "2024-01-15",
    },
    {
      key: "3",
      orderNumber: "ORD-2024-003",
      customer: "วิทยา ขยันเรียน",
      course: "คณิตศาสตร์ ม.4",
      amount: 1000,
      status: "processing",
      date: "2024-01-14",
    },
  ];

  const recentActivities = [
    {
      title: "ผู้ใช้ใหม่ลงทะเบียน",
      description: "สมชาย ใจดี ลงทะเบียนเข้าใช้งานระบบ",
      time: "5 นาทีที่แล้ว",
      avatar: <Avatar icon={<UserOutlined />} />,
    },
    {
      title: "คำสั่งซื้อใหม่",
      description: "ORD-2024-004 - คอร์สฟิสิกส์ ม.6",
      time: "15 นาทีที่แล้ว",
      avatar: <Avatar icon={<ShoppingCartOutlined />} />,
    },
    {
      title: "รีวิวใหม่",
      description: "คอร์สเคมี ม.5 ได้รับรีวิว 5 ดาว",
      time: "1 ชั่วโมงที่แล้ว",
      avatar: <Avatar icon={<BookOutlined />} />,
    },
    {
      title: "การชำระเงินสำเร็จ",
      description: "ORD-2024-001 ชำระเงินเรียบร้อยแล้ว",
      time: "2 ชั่วโมงที่แล้ว",
      avatar: <Avatar icon={<CheckCircleOutlined />} />,
    },
  ];

  const orderColumns = [
    {
      title: "หมายเลขคำสั่งซื้อ",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "ลูกค้า",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "คอร์ส",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `฿${amount.toLocaleString()}`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          paid: { color: "green", text: "ชำระแล้ว" },
          pending: { color: "orange", text: "รอชำระ" },
          processing: { color: "blue", text: "กำลังดำเนินการ" },
        };
        return (
          <Tag color={statusConfig[status]?.color}>
            {statusConfig[status]?.text}
          </Tag>
        );
      },
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">ภาพรวมระบบจัดการเรียนรู้ฟิสิกส์พี่เต้ย</Text>
      </div>

      {/* สถิติหลัก */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ผู้ใช้ทั้งหมด"
              value={mockStats.totalUsers}
              prefix={<UserOutlined />}
              suffix={
                <Text type="success" style={{ fontSize: "12px" }}>
                  +{mockStats.newUsersToday} วันนี้
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="คอร์สทั้งหมด"
              value={mockStats.totalCourses}
              prefix={<BookOutlined />}
              suffix={
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  คอร์ส
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="คำสั่งซื้อ"
              value={mockStats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              suffix={
                <Text type="warning" style={{ fontSize: "12px" }}>
                  {mockStats.pendingOrders} รอดำเนินการ
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รายได้รวม"
              value={mockStats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={0}
              suffix="บาท"
            />
          </Card>
        </Col>
      </Row>

      {/* แจ้งเตือนและสถานะระบบ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Alert
            message="ระบบทำงานปกติ"
            description="ระบบทั้งหมดทำงานปกติ ไม่มีปัญหาที่ต้องแก้ไข"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card
            title="คำสั่งซื้อล่าสุด"
            extra={<Button type="link">ดูทั้งหมด</Button>}
          >
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="สถิติการใช้งาน" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text>ผู้ใช้ที่ใช้งานอยู่</Text>
                <Progress
                  percent={(mockStats.activeUsers / mockStats.totalUsers) * 100}
                  format={() =>
                    `${mockStats.activeUsers}/${mockStats.totalUsers}`
                  }
                />
              </div>
              <div>
                <Text>คำสั่งซื้อที่เสร็จสิ้น</Text>
                <Progress
                  percent={
                    (mockStats.completedOrders / mockStats.totalOrders) * 100
                  }
                  format={() =>
                    `${mockStats.completedOrders}/${mockStats.totalOrders}`
                  }
                  status="success"
                />
              </div>
            </Space>
          </Card>

          <Card title="กิจกรรมล่าสุด">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.avatar}
                    title={item.title}
                    description={
                      <div>
                        <div>{item.description}</div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <ClockCircleOutlined /> {item.time}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* ปุ่มด่วน */}
      <Card title="การดำเนินการด่วน">
        <Space wrap>
          <Button type="primary" icon={<UserOutlined />}>
            เพิ่มผู้ใช้ใหม่
          </Button>
          <Button icon={<BookOutlined />}>สร้างคอร์สใหม่</Button>
          <Button icon={<ShoppingCartOutlined />}>ตรวจสอบคำสั่งซื้อ</Button>
          <Button icon={<EyeOutlined />}>ดูรายงาน</Button>
          <Button icon={<RiseOutlined />}>วิเคราะห์ข้อมูล</Button>
        </Space>
      </Card>
    </div>
  );
}
