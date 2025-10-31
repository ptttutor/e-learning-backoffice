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
  const [allSalesData, setAllSalesData] = useState([]);
  const [allSalesLoading, setAllSalesLoading] = useState(false);
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

  // ดึงข้อมูล sales ทั้งหมดสำหรับตารางสำเนา
  React.useEffect(() => {
    setAllSalesLoading(true);
    fetch(`/api/admin/orders?paymentStatus=COMPLETED`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          // สร้างข้อมูลสำหรับตารางจาก orders ทั้งหมด
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
          setAllSalesData(data);
        } else {
          setAllSalesData([]);
        }
      })
      .catch(() => setAllSalesData([]))
      .finally(() => setAllSalesLoading(false));
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

  // Add row number to allSalesData และรวมยอดขายจาก Order ID เดียวกัน
  const groupedAllSalesData = allSalesData.reduce((acc, current) => {
    const existingOrder = acc.find(item => item.orderId === current.orderId);
    
    if (existingOrder) {
      // ถ้ามี Order ID เดียวกันแล้ว ให้รวมยอดขาย
      existingOrder.amount += current.amount;
      existingOrder.count = (existingOrder.count || 1) + 1;
    } else {
      // ถ้ายังไม่มี ให้เพิ่ม record ใหม่
      acc.push({
        ...current,
        count: 1
      });
    }
    
    return acc;
  }, []);

  const allSalesDataWithIndex = groupedAllSalesData.map((item, idx) => ({
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

      <div style={{ padding: "0 32px 32px 32px" }}>
        {/* Overview Stats */}
        {stats && (
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col span={24}>
              <Title level={3} style={{ margin: "0 0 24px 0", color: "#1f2937" }}>
                <BarChartOutlined style={{ color: "#1890ff", marginRight: "8px" }} />
                สถิติโดยรวม
              </Title>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                  border: "none",
                  height: "160px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(82, 196, 26, 0.2)",
                }}
                bodyStyle={{ padding: "24px", width: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  <DollarOutlined 
                    style={{ 
                      fontSize: "32px", 
                      color: "#fff", 
                      marginBottom: "12px",
                      display: "block"
                    }} 
                  />
                  <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginBottom: "8px" }}>
                    ยอดขายรวม
                  </div>
                  <div style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>
                    {formatCurrency(stats.stats.revenue.total)}
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  height: "160px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(24, 144, 255, 0.2)",
                }}
                bodyStyle={{ padding: "24px", width: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  <ShoppingCartOutlined 
                    style={{ 
                      fontSize: "32px", 
                      color: "#fff", 
                      marginBottom: "12px",
                      display: "block"
                    }} 
                  />
                  <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginBottom: "8px" }}>
                    ออร์เดอร์ทั้งหมด
                  </div>
                  <div style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>
                    {formatNumber(stats.stats.orders.total)}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>
                    สำเร็จ: {stats.stats.orders.completed} | รอ: {stats.stats.orders.pending}
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                  border: "none",
                  height: "160px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(114, 46, 209, 0.2)",
                }}
                bodyStyle={{ padding: "24px", width: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  <BookOutlined 
                    style={{ 
                      fontSize: "32px", 
                      color: "#fff", 
                      marginBottom: "12px",
                      display: "block"
                    }} 
                  />
                  <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginBottom: "8px" }}>
                    รายได้ Course
                  </div>
                  <div style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>
                    {formatCurrency(stats.stats.revenue.course)}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>
                    ขาย: {formatNumber(stats.stats.courses.sold)} คอร์ส
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #13c2c2 0%, #08979c 100%)",
                  border: "none",
                  height: "160px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(19, 194, 194, 0.2)",
                }}
                bodyStyle={{ padding: "24px", width: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  <UserOutlined 
                    style={{ 
                      fontSize: "32px", 
                      color: "#fff", 
                      marginBottom: "12px",
                      display: "block"
                    }} 
                  />
                  <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginBottom: "8px" }}>
                    รายได้ E-book
                  </div>
                  <div style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>
                    {formatCurrency(stats.stats.revenue.ebook)}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>
                    ขาย: {formatNumber(stats.stats.ebooks.sold)} เล่ม
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Charts Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          {/* Overview Chart */}
          {stats && (
            <Col xs={24} lg={12}>
              <Card
                title={
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "600",
                    color: "#1f2937",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <BarChartOutlined style={{ color: "#fa8c16", marginRight: "8px" }} />
                    ภาพรวมยอดขาย
                  </div>
                }
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #f0f0f0",
                }}
                bodyStyle={{ padding: "24px" }}
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
                  height={280}
                  label={{ position: "top", style: { fill: "#333", fontSize: "12px" } }}
                  meta={{ value: { alias: "ยอดขาย (บาท)" } }}
                  barStyle={{ radius: [8, 8, 0, 0] }}
                />
              </Card>
            </Col>
          )}

          {/* Product Sales Chart */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "600",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <RiseOutlined style={{ color: "#1890ff", marginRight: "8px" }} />
                  ยอดขายสินค้า
                </div>
              }
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {allSalesLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '100px 0',
                  color: '#666'
                }}>
                  กำลังโหลดข้อมูล...
                </div>
              ) : (
                <Bar
                  data={groupedAllSalesData.slice(0, 10).map(item => ({
                    orderId: `Order ${item.orderId}`,
                    amount: item.amount,
                    count: item.count,
                    type: item.type,
                    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
                    displayName: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name
                  }))}
                  xField="displayName"
                  yField="amount"
                  height={280}
                  color="#1890ff"
                  label={{ 
                    position: "top", 
                    style: { fill: "#333", fontSize: "10px" },
                    formatter: (value) => formatCurrency(value)
                  }}
                  meta={{ 
                    amount: { alias: "ยอดขาย (บาท)" },
                    displayName: { alias: "ชื่อสินค้า" }
                  }}
                  barStyle={{ radius: [4, 4, 0, 0] }}
                  tooltip={{
                    customContent: (title, items) => {
                      if (!items || items.length === 0) return null;
                      const data = items[0]?.data;
                      return (
                        <div style={{ 
                          background: '#fff', 
                          padding: '16px', 
                          border: '1px solid #e6f7ff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                            {data.orderId}
                          </div>
                          <div style={{ marginBottom: '4px' }}>ประเภท: <strong>{data.type}</strong></div>
                          <div style={{ marginBottom: '4px' }}>ชื่อสินค้า: <strong>{data.name}</strong></div>
                          <div style={{ marginBottom: '4px' }}>จำนวนครั้ง: <strong>{data.count} ครั้ง</strong></div>
                          <div style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '16px' }}>
                            ยอดขาย: {formatCurrency(data.amount)}
                          </div>
                        </div>
                      );
                    }
                  }}
                  interactions={[
                    { type: 'element-active' },
                    { type: 'brush' }
                  ]}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Tables Section */}
        <Row gutter={[24, 24]}>
          {/* Recent Sales Table */}
          <Col span={24}>
            <Card
              title={
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "600",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <DashboardOutlined style={{ color: "#52c41a", marginRight: "8px" }} />
                  รายการขายล่าสุด (100 รายการ)
                </div>
              }
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <Table
                columns={[
                  { 
                    title: "#", 
                    dataIndex: "rowNumber", 
                    key: "rowNumber",
                    width: 60,
                    align: "center"
                  },
                  // { 
                  //   title: "Order ID", 
                  //   dataIndex: "orderId", 
                  //   key: "orderId",
                  //   width: 100,
                  //   render: (text) => <span style={{ fontWeight: "500", color: "#1890ff" }}>{text}</span>
                  // },
                  { 
                    title: "ประเภท", 
                    dataIndex: "type", 
                    key: "type",
                    width: 100,
                    render: (text) => (
                      <span style={{ 
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: text === "Course" ? "#f6ffed" : "#fff7e6",
                        color: text === "Course" ? "#52c41a" : "#fa8c16",
                        border: `1px solid ${text === "Course" ? "#b7eb8f" : "#ffd591"}`
                      }}>
                        {text}
                      </span>
                    )
                  },
                  { 
                    title: "ชื่อสินค้า", 
                    dataIndex: "name", 
                    key: "name",
                    ellipsis: true
                  },
                  {
                    title: "ยอดขาย",
                    dataIndex: "amount",
                    key: "amount",
                    width: 120,
                    align: "right",
                    render: (v) => <span style={{ fontWeight: "600", color: "#52c41a" }}>{formatCurrency(v)}</span>,
                  },
                  {
                    title: "วันที่",
                    dataIndex: "date",
                    key: "date",
                    width: 160,
                    render: (d) => (
                      <span style={{ color: "#666" }}>
                        {new Date(d).toLocaleString("th-TH")}
                      </span>
                    ),
                  },
                ]}
                dataSource={salesDataWithIndex}
                loading={salesLoading}
                rowKey="orderId"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
                }}
                size="middle"
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardOverview;
