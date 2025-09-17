import React, { useState } from "react";
import {
  Card,
  Tabs,
  Row,
  Col,
  Statistic,
  Switch,
  Space,
  Typography,
  Avatar,
  Divider,
  Badge,
  Table,
} from "antd";
import { Bar } from "@ant-design/charts";
import {
  DashboardOutlined,
  BookOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  BarChartOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import CourseSalesDetail from "../CourseSalesDetail";
import EbookSalesDetail from "../EbookSalesDetail";
import {
  useDashboardStats,
  useCourseSales,
  useEbookSales,
} from "@/hooks/useDashboard";

const { Title } = Typography;
const { TabPane } = Tabs;

const DashboardOverview = () => {
  const [period, setPeriod] = useState(30);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  // ดึงข้อมูล sales overview จาก /api/admin/orders?paymentStatus=COMPLETED
  React.useEffect(() => {
    setSalesLoading(true);
    fetch(`/api/admin/orders?paymentStatus=COMPLETED&limit=100`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          // สร้างข้อมูลสำหรับตารางจาก orders
          const data = result.data.map((order) => ({
            orderId: order.id,
            type: order.course ? "Course" : order.ebook ? "Ebook" : "-",
            name:
              order.course?.title ||
              order.ebook?.title ||
              order.items?.[0]?.title ||
              "-",
            amount: order.payment?.amount || order.total,
            date: order.payment?.paidAt || order.createdAt,
          }));
          setSalesData(data);
        } else {
          setSalesData([]);
        }
      })
      .catch(() => setSalesData([]))
      .finally(() => setSalesLoading(false));
  }, [period]);

  const { stats, loading: statsLoading } = useDashboardStats(period);
  const { courseSales, loading: courseSalesLoading } = useCourseSales(period);
  const { ebookSales, loading: ebookSalesLoading } = useEbookSales(period);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("th-TH").format(number);
  };
  // Add row number to salesData
  const salesDataWithIndex = salesData.map((item, idx) => ({
    ...item,
    rowNumber: idx + 1,
  }));
  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", padding: "0" }}>
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "32px",
          marginBottom: "24px",
          borderRadius: "0 0 24px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="start">
              <Avatar
                size={64}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: "24px",
                }}
              >
                <DashboardOutlined />
              </Avatar>
              <div>
                <Title
                  level={1}
                  style={{ margin: 0, color: "#fff", fontWeight: "300" }}
                >
                  Dashboard
                </Title>
                <Typography.Text
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
                >
                  ภาพรวมการขายและสถิติ
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Card
              size="small"
              style={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: "12px",
                border: "none",
                backdropFilter: "blur(10px)",
              }}
            >
              <Space align="center">
                <SettingOutlined style={{ color: "#667eea" }} />
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Overview Stats */}
        {stats && (
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  สถิติโดยรวม
                </span>
              </Space>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              padding: "20px",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col md={6}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                    border: "none",
                    minHeight: "170px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        ยอดขายรวม
                      </span>
                    }
                    value={stats.stats.revenue.total}
                    prefix={
                      <DollarOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    suffix="บาท"
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "3px 6px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "4px",
                      fontSize: "10px",
                      color: "#fff",
                    }}
                  >
                    <RiseOutlined /> รายได้จากคำสั่งซื้อที่สำเร็จ
                  </div>
                </Card>
              </Col>

              <Col md={6}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    border: "none",
                    minHeight: "170px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        ออร์เดอร์ทั้งหมด
                      </span>
                    }
                    value={stats.stats.orders.total}
                    prefix={
                      <ShoppingCartOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div style={{ marginTop: "6px", fontSize: "10px" }}>
                    <Badge status="success" />
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>
                      สำเร็จ: {stats.stats.orders.completed}
                    </span>
                    <br />
                    <Badge status="processing" />
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>
                      รออนุมัติ: {stats.stats.orders.pending}
                    </span>
                  </div>
                </Card>
              </Col>

              <Col md={6}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                    border: "none",
                    minHeight: "170px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        รายได้ Course
                      </span>
                    }
                    value={stats.stats.revenue.course}
                    prefix={
                      <DollarOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    suffix="บาท"
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    ออร์เดอร์: {formatNumber(stats.stats.courses.sold)}
                  </div>
                </Card>
              </Col>

              <Col md={6}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #13c2c2 0%, #08979c 100%)",
                    border: "none",
                    minHeight: "170px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        รายได้ E-book
                      </span>
                    }
                    value={stats.stats.revenue.ebook}
                    prefix={
                      <DollarOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    suffix="บาท"
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    ออร์เดอร์: {formatNumber(stats.stats.ebooks.sold)}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        )}
        {/* Sales Chart */}
        {stats && (
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#fa8c16" }} />
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  Sales Bar Chart
                </span>
              </Space>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              padding: "20px",
            }}
          >
            <Bar
              data={[
                { type: "ยอดขายรวม", value: stats.stats.revenue.total },
                { type: "รายได้ Course", value: stats.stats.revenue.course },
                { type: "รายได้ E-book", value: stats.stats.revenue.ebook },
              ]}
              xField="type"
              yField="value"
              color={["#fa8c16", "#722ed1", "#13c2c2"]}
              height={300}
              label={{ position: "top", style: { fill: "#fff" } }}
              meta={{ value: { alias: "ยอดขาย (บาท)" } }}
              barStyle={{ radius: [8, 8, 0, 0] }}
            />
          </Card>
        )}
        {/* Sales Detail Table */}
        <Card
          title={
            <span style={{ fontWeight: 600 }}>รายละเอียดการขายล่าสุด</span>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            padding: "20px",
          }}
        >
          <Table
            columns={[
              { title: "#", dataIndex: "rowNumber", key: "rowNumber" },
              { title: "Order ID", dataIndex: "orderId", key: "orderId" },
              { title: "ประเภท", dataIndex: "type", key: "type" },
              { title: "ชื่อสินค้า", dataIndex: "name", key: "name" },
              {
                title: "ยอดขาย (บาท)",
                dataIndex: "amount",
                key: "amount",
                render: (v) => formatCurrency(v),
              },
              {
                title: "วันที่",
                dataIndex: "date",
                key: "date",
                render: (d) => new Date(d).toLocaleString("th-TH"),
              },
            ]}
            dataSource={salesDataWithIndex}
            loading={salesLoading}
            rowKey="orderId"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
