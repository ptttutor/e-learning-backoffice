"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Spin,
  message,
  Select,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  LineChartOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    totalStats: { totalRevenue: 0, totalOrders: 0 },
    dailySales: [],
    monthlyStats: [],
    courseSales: [],
    ebookSales: [],
    topSellingItems: [],
    recentOrders: []
  });
  const [period, setPeriod] = useState('month');

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard/sales?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setSalesData(result.data);
      } else {
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลยอดขาย");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getOrderStatusColor = (status) => {
    const statusColors = {
      "COMPLETED": "success",
      "PENDING_PAYMENT": "warning", 
      "PENDING_VERIFICATION": "processing",
      "CANCELLED": "error",
      "REFUNDED": "default"
    };
    return statusColors[status] || "default";
  };

  const getOrderStatusText = (status) => {
    const statusText = {
      "COMPLETED": "สำเร็จ",
      "PENDING_PAYMENT": "รอชำระเงิน",
      "PENDING_VERIFICATION": "รอตรวจสอบ",
      "CANCELLED": "ยกเลิก",
      "REFUNDED": "คืนเงิน"
    };
    return statusText[status] || status;
  };

  // Columns สำหรับตารางยอดขาย Course
  const courseSalesColumns = [
    {
      title: "ลำดับ",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "ชื่อคอร์ส",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      render: (price) => formatPrice(price),
      width: 120,
    },
    {
      title: "จำนวนขาย",
      dataIndex: "_count",
      key: "count",
      width: 100,
      align: "center",
    },
    {
      title: "ยอดขายรวม",
      dataIndex: ["_sum", "total"],
      key: "total",
      render: (total) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatPrice(total)}
        </Text>
      ),
      width: 140,
    },
  ];

  // Columns สำหรับตารางยอดขาย Ebook
  const ebookSalesColumns = [
    {
      title: "ลำดับ",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "ชื่อหนังสือ",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "ผู้เขียน",
      dataIndex: "author",
      key: "author",
      width: 120,
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      render: (price) => formatPrice(price),
      width: 120,
    },
    {
      title: "จำนวนขาย",
      dataIndex: "_count",
      key: "count",
      width: 100,
      align: "center",
    },
    {
      title: "ยอดขายรวม",
      dataIndex: ["_sum", "total"],
      key: "total",
      render: (total) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatPrice(total)}
        </Text>
      ),
      width: 140,
    },
  ];

  // Columns สำหรับตารางคำสั่งซื้อล่าสุด
  const recentOrdersColumns = [
    {
      title: "รหัสคำสั่งซื้อ",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber) => (
        <Text code style={{ fontSize: "12px" }}>
          #{orderNumber}
        </Text>
      ),
      width: 140,
    },
    {
      title: "ลูกค้า",
      dataIndex: "user",
      key: "customer",
      render: (user) => (
        <Space size={8}>
          <UserOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{user?.name || user?.email || "N/A"}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "สินค้า",
      key: "product",
      render: (_, record) => (
        <Space size={8}>
          {record.orderType === "EBOOK" ? <BookOutlined style={{ color: "#1890ff" }} /> : <FileTextOutlined style={{ color: "#52c41a" }} />}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 500 }}>
              {record.course?.title || record.ebook?.title || "สินค้าหลายชิ้น"}
            </div>
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {record.orderType === "EBOOK" ? "E-Book" : "คอร์สเรียน"}
            </Text>
          </div>
        </Space>
      ),
      width: 200,
    },
    {
      title: "ยอดรวม",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <Text strong style={{ color: "#1890ff" }}>
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
        <Tag color={getOrderStatusColor(status)} style={{ fontSize: "11px" }}>
          {getOrderStatusText(status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
      width: 120,
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0 }}>
          <LineChartOutlined style={{ marginRight: "12px" }} />
          Dashboard ยอดขาย
        </Title>
        <Text type="secondary">
          ภาพรวมยอดขายและสถิติการขายทั้งหมด
        </Text>
      </div>

      {/* Filter Controls */}
      <Card style={{ marginBottom: "24px" }}>
        <Space size="large" wrap>
          <div>
            <Text strong>ช่วงเวลา: </Text>
            <Select 
              value={period} 
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value="day">รายวัน</Option>
              <Option value="month">รายเดือน</Option>
              <Option value="year">รายปี</Option>
            </Select>
          </div>
          <Button 
            icon={<CalendarOutlined />} 
            onClick={fetchSalesData}
          >
            รีเฟรชข้อมูล
          </Button>
        </Space>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="ยอดขายรวมทั้งหมด"
              value={salesData.totalStats.totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatPrice(value)}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="คำสั่งซื้อทั้งหมด"
              value={salesData.totalStats.totalOrders}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="คอร์สที่ขายได้"
              value={salesData.courseSales.length}
              valueStyle={{ color: "#722ed1" }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="E-Book ที่ขายได้"
              value={salesData.ebookSales.length}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>ยอดขายรายวัน (30 วันล่าสุด)</span>
              </Space>
            }
          >
            {salesData.dailySales.length > 0 ? (
              <div style={{ height: "300px", display: "flex", alignItems: "end", gap: "4px" }}>
                {salesData.dailySales.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      backgroundColor: "#1890ff",
                      height: `${Math.max((item.amount / Math.max(...salesData.dailySales.map(d => d.amount))) * 100, 5)}%`,
                      borderRadius: "2px",
                      minHeight: "20px",
                      position: "relative",
                    }}
                    title={`${formatDate(item.date)}: ${formatPrice(item.amount)} (${item.orders} orders)`}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Text type="secondary">ไม่มีข้อมูลยอดขาย</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>ยอดขายรายเดือน (12 เดือนล่าสุด)</span>
              </Space>
            }
          >
            {salesData.monthlyStats.length > 0 ? (
              <div style={{ height: "300px", display: "flex", alignItems: "end", gap: "8px" }}>
                {salesData.monthlyStats.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      backgroundColor: "#52c41a",
                      height: `${Math.max((item.amount / Math.max(...salesData.monthlyStats.map(d => d.amount))) * 100, 5)}%`,
                      borderRadius: "4px",
                      minHeight: "30px",
                      position: "relative",
                    }}
                    title={`${dayjs(item.month).format('MM/YYYY')}: ${formatPrice(item.amount)} (${item.orders} orders)`}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Text type="secondary">ไม่มีข้อมูลยอดขาย</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Course Sales Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>ยอดขายแยกตามคอร์ส</span>
                <Tag color="purple">{salesData.courseSales.length} รายการ</Tag>
              </Space>
            }
            extra={
              <Button size="small" icon={<EyeOutlined />}>
                ดูทั้งหมด
              </Button>
            }
          >
            <Table
              dataSource={salesData.courseSales.slice(0, 10)}
              columns={courseSalesColumns}
              pagination={false}
              size="small"
              rowKey={(record) => record.courseId}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BookOutlined />
                <span>ยอดขายแยกตาม E-Book</span>
                <Tag color="magenta">{salesData.ebookSales.length} รายการ</Tag>
              </Space>
            }
            extra={
              <Button size="small" icon={<EyeOutlined />}>
                ดูทั้งหมด
              </Button>
            }
          >
            <Table
              dataSource={salesData.ebookSales.slice(0, 10)}
              columns={ebookSalesColumns}
              pagination={false}
              size="small"
              rowKey={(record) => record.ebookId}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>คำสั่งซื้อล่าสุด</span>
            <Tag color="blue">{salesData.recentOrders.length} รายการ</Tag>
          </Space>
        }
        extra={
          <Button size="small" icon={<EyeOutlined />}>
            ดูทั้งหมด
          </Button>
        }
      >
        <Table
          dataSource={salesData.recentOrders}
          columns={recentOrdersColumns}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          size="small"
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
