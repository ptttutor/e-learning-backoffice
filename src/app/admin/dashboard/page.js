"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Typography,
  Avatar,
  Spin,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FolderOutlined,
  DashboardOutlined,
  RiseOutlined,
  CalendarOutlined,
  EyeOutlined,
  AppstoreOutlined,
  FileOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/orders?limit=10"),
      ]);

      const statsResult = await statsResponse.json();
      const ordersResult = await ordersResponse.json();

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        message.error("เกิดข้อผิดพลาดในการโหลดสถิติ");
      }

      if (ordersResult.success) {
        setRecentOrders(ordersResult.data);
      } else {
        message.error("เกิดข้อผิดพลาดในการโหลดคำสั่งซื้อ");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH");
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING_PAYMENT":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const recentOrdersColumns = [
    {
      title: "รหัสคำสั่งซื้อ",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <Text code style={{ fontSize: "12px" }}>
          #{id.slice(-8)}
        </Text>
      ),
      width: 120,
    },
    {
      title: "ลูกค้า",
      dataIndex: "user",
      key: "customer",
      render: (user) => (
        <Space size={8}>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text style={{ fontSize: "13px" }}>{user?.name || "N/A"}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "สินค้า",
      key: "product",
      render: (_, record) => (
        <Space size={8}>
          <Avatar
            icon={
              record.orderType === "EBOOK" ? (
                <BookOutlined />
              ) : (
                <FileTextOutlined />
              )
            }
            size="small"
            style={{
              backgroundColor:
                record.orderType === "EBOOK" ? "#1890ff" : "#52c41a",
            }}
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "13px" }}>
                {record.ebook?.title || record.course?.title}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "11px" }}>
                {record.orderType === "EBOOK" ? "หนังสือ" : "คอร์ส"}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: 250,
    },
    {
      title: "ยอดรวม",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatPrice(total)}
        </Text>
      ),
      width: 120,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={getOrderStatusColor(status)}
          icon={
            status === "COMPLETED" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
        >
          {status === "COMPLETED"
            ? "สำเร็จ"
            : status === "PENDING_PAYMENT"
            ? "รอตรวจสอบ"
            : status === "CANCELLED"
            ? "ยกเลิก"
            : status}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "12px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 130,
    },
  ];

  const completionRate =
    stats.totalOrders > 0
      ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
      : 0;

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <DashboardOutlined style={{ marginRight: "8px" }} />
            แดชบอร์ด
          </Title>
          <Text type="secondary">ภาพรวมระบบจัดการคำสั่งซื้อและข้อมูลสำคัญ</Text>
        </Space>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: "8px", padding: "20px" }}>
            <Statistic
              title={
                <Space>
                  <ShoppingCartOutlined style={{ color: "#1890ff" }} />
                  <Text>คำสั่งซื้อทั้งหมด</Text>
                </Space>
              }
              value={stats.totalOrders}
              valueStyle={{
                color: "#1890ff",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: "8px", padding: "20px" }}>
            <Statistic
              title={
                <Space>
                  <DollarOutlined style={{ color: "#52c41a" }} />
                  <Text>รายได้รวม</Text>
                </Space>
              }
              value={stats.totalRevenue}
              formatter={(value) => formatPrice(value)}
              valueStyle={{
                color: "#52c41a",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: "8px", padding: "20px" }}>
            <Statistic
              title={
                <Space>
                  <UserOutlined style={{ color: "#722ed1" }} />
                  <Text>ลูกค้าทั้งหมด</Text>
                </Space>
              }
              value={stats.totalCustomers}
              valueStyle={{
                color: "#722ed1",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: "8px", padding: "20px" }}>
            <Statistic
              title={
                <Space>
                  <BookOutlined style={{ color: "#fa8c16" }} />
                  <Text>สินค้าทั้งหมด</Text>
                </Space>
              }
              value={stats.totalProducts}
              valueStyle={{
                color: "#fa8c16",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: "#1890ff" }} />
                <Text strong>สถานะคำสั่งซื้อ</Text>
              </Space>
            }
            style={{ borderRadius: "8px", padding: "20px" }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#fff7e6",
                    border: "1px solid #ffd591",
                  }}
                >
                  <Statistic
                    title={
                      <Space>
                        <ClockCircleOutlined style={{ color: "#faad14" }} />
                        <Text>รอตรวจสอบ</Text>
                      </Space>
                    }
                    value={stats.pendingOrders}
                    valueStyle={{
                      color: "#faad14",
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Statistic
                    title={
                      <Space>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <Text>สำเร็จแล้ว</Text>
                      </Space>
                    }
                    value={stats.completedOrders}
                    valueStyle={{
                      color: "#52c41a",
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: "#52c41a" }} />
                <Text strong>อัตราความสำเร็จ</Text>
              </Space>
            }
            style={{ borderRadius: "8px", padding: "20px" }}
          >
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={completionRate}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                size={120}
                strokeWidth={8}
              />
              <div style={{ marginTop: "16px" }}>
                <Text style={{ fontSize: "16px", color: "#666" }}>
                  <Text strong style={{ color: "#52c41a" }}>
                    {stats.completedOrders}
                  </Text>{" "}
                  จาก{" "}
                  <Text strong style={{ color: "#1890ff" }}>
                    {stats.totalOrders}
                  </Text>{" "}
                  คำสั่งซื้อ
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: "#1890ff" }} />
                <Text strong>จัดการคลังข้อสอบ</Text>
              </Space>
            }
            style={{ borderRadius: "8px", padding: "20px" }}
          >
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: "16px" }}
            >
              จัดการหมวดหมู่ข้อสอบ คลังข้อสอบ และไฟล์ที่เกี่ยวข้อง
            </Text>
            <Space size="middle" wrap>
              <Link href="/admin/exam-categories">
                <Button
                  type="primary"
                  icon={<FolderOutlined />}
                  style={{ borderRadius: "6px" }}
                >
                  จัดการหมวดหมู่ข้อสอบ
                </Button>
              </Link>
              <Link href="/admin/exam-bank">
                <Button
                  icon={<FileTextOutlined />}
                  style={{ borderRadius: "6px" }}
                >
                  จัดการคลังข้อสอบ
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <AppstoreOutlined style={{ color: "#52c41a" }} />
                <Text strong>จัดการเนื้อหา</Text>
              </Space>
            }
            style={{ borderRadius: "8px", padding: "20px" }}
          >
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: "16px" }}
            >
              จัดการหมวดหมู่ eBook, โพสต์ และเนื้อหาต่างๆ
            </Text>
            <Space size="middle" wrap>
              <Link href="/admin/categories">
                <Button
                  type="primary"
                  icon={<AppstoreOutlined />}
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  จัดการหมวดหมู่
                </Button>
              </Link>
              <Link href="/admin/posts">
                <Button icon={<FileOutlined />} style={{ borderRadius: "6px" }}>
                  จัดการโพสต์
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card
        title={
          <Space>
            <ShoppingCartOutlined style={{ color: "#1890ff" }} />
            <Text strong>คำสั่งซื้อล่าสุด</Text>
          </Space>
        }
        extra={
          <Link href="/admin/orders">
            <Button type="link" icon={<EyeOutlined />} style={{ padding: 0 }}>
              ดูทั้งหมด
            </Button>
          </Link>
        }
        style={{ borderRadius: "8px", padding: "20px" }}
      >
        <Table
          columns={recentOrdersColumns}
          dataSource={recentOrders}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
          size="middle"
          locale={{
            emptyText: (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <ShoppingCartOutlined
                  style={{
                    fontSize: "48px",
                    color: "#bfbfbf",
                    marginBottom: "16px",
                  }}
                />
                <div>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    ยังไม่มีคำสั่งซื้อ
                  </Text>
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}
