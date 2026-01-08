import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Select,
  Spin,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  UserOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  useInstructorDashboardStats,
  useInstructorCourseSales,
} from "@/hooks/useInstructorDashboard";
import { useAuth } from "@/app/contexts/AuthContext";

const { Title } = Typography;
const { Option } = Select;

const InstructorDashboardOverview = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState(30);
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);

  // ดึงข้อมูล sales overview
  React.useEffect(() => {
    if (!user?.id) return;

    setSalesLoading(true);
    fetch(`/api/instructor/orders?instructorId=${user.id}&limit=100`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const data = result.data.map((order) => ({
            orderId: order.id,
            name: order.items?.[0]?.title || "-",
            amount: order.payment?.amount || order.total,
            date: order.payment?.paidAt || order.createdAt,
            user: order.user?.name || order.user?.email || "-",
          }));
          setSalesData(data);
        } else {
          setSalesData([]);
        }
      })
      .catch(() => setSalesData([]))
      .finally(() => setSalesLoading(false));
  }, [user?.id, period]);

  const { stats, loading: statsLoading } = useInstructorDashboardStats(user?.id, period);
  const { courseSales, loading: courseSalesLoading } = useInstructorCourseSales(user?.id, period);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("th-TH").format(number);
  };

  const salesDataWithIndex = salesData.map((item, idx) => ({
    ...item,
    rowNumber: idx + 1,
  }));

  const salesColumns = [
    {
      title: "#",
      dataIndex: "rowNumber",
      key: "rowNumber",
      width: 60,
    },
    {
      title: "คอร์ส",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "ผู้ซื้อ",
      dataIndex: "user",
      key: "user",
      ellipsis: true,
    },
    {
      title: "ยอดขาย",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => formatCurrency(amount),
      align: "right",
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
  ];

  const courseSalesColumns = [
    {
      title: "คอร์ส",
      dataIndex: "courseName",
      key: "courseName",
      ellipsis: true,
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency(price),
      align: "right",
    },
    {
      title: "จำนวนที่ขาย",
      dataIndex: "salesCount",
      key: "salesCount",
      align: "center",
    },
    {
      title: "รายได้รวม",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue) => formatCurrency(revenue),
      align: "right",
    },
  ];

  if (statsLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", padding: "0" }}>
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "32px",
          borderRadius: "0 0 24px 24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={2} style={{ color: "white", margin: 0 }}>
              Dashboard ครูผู้สอน
            </Title>
            <p style={{ color: "rgba(255,255,255,0.9)", margin: "8px 0 0 0" }}>
              ภาพรวมยอดขายและสถิติคอร์สของคุณ
            </p>
          </div>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 150 }}
            size="large"
          >
            <Option value={7}>7 วันที่แล้ว</Option>
            <Option value={30}>30 วันที่แล้ว</Option>
            <Option value={90}>90 วันที่แล้ว</Option>
            <Option value={365}>1 ปีที่แล้ว</Option>
          </Select>
        </div>
      </div>

      <div style={{ padding: "0 32px 32px 32px" }}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Statistic
                title="รายได้รวม"
                value={stats?.totalRevenue || 0}
                precision={2}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                suffix="฿"
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Statistic
                title="คำสั่งซื้อสำเร็จ"
                value={stats?.completedOrders || 0}
                prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Statistic
                title="จำนวนคอร์ส"
                value={stats?.totalCourses || 0}
                prefix={<BookOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Statistic
                title="จำนวนผู้เรียน"
                value={stats?.totalUsers || 0}
                prefix={<UserOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{ color: "#fa8c16", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Course Sales Table */}
        <Card
          title="ยอดขายแยกตามคอร์ส"
          
          style={{
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            marginBottom: "24px",
          }}
        >
          <Table
            columns={courseSalesColumns}
            dataSource={courseSales}
            loading={courseSalesLoading}
            rowKey="courseId"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Recent Sales Table */}
        <Card
          title="รายการขายล่าสุด"
          
          style={{
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Table
            columns={salesColumns}
            dataSource={salesDataWithIndex}
            loading={salesLoading}
            rowKey="orderId"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboardOverview;
