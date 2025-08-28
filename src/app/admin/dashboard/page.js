"use client";
import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Progress } from "antd";
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  UserOutlined, 
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined 
} from "@ant-design/icons";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/orders?limit=10')
      ]);

      const statsResult = await statsResponse.json();
      const ordersResult = await ordersResponse.json();

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (ordersResult.success) {
        setRecentOrders(ordersResult.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING_PAYMENT': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING_VERIFICATION': return 'processing';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const recentOrdersColumns = [
    {
      title: 'รหัสคำสั่งซื้อ',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.slice(-8)}`,
      width: 120,
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'user',
      key: 'customer',
      render: (user) => user?.name || 'N/A',
      width: 150,
    },
    {
      title: 'สินค้า',
      key: 'product',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {record.ebook?.title || record.course?.title}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.orderType === 'EBOOK' ? 'หนังสือ' : 'คอร์ส'}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'ยอดรวม',
      dataIndex: 'total',
      key: 'total',
      render: (total) => formatPrice(total),
      width: 100,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getOrderStatusColor(status)}>
          {status === 'COMPLETED' ? 'สำเร็จ' :
           status === 'PENDING_PAYMENT' ? 'รอตรวจสอบ' :
           status === 'CANCELLED' ? 'ยกเลิก' : status}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'วันที่',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      width: 100,
    },
  ];

  const completionRate = stats.totalOrders > 0 
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
    : 0;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          📊 แดชบอร์ด
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          ภาพรวมระบบจัดการคำสั่งซื้อ
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="คำสั่งซื้อทั้งหมด"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รายได้รวม"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatPrice(value)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ลูกค้าทั้งหมด"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="สินค้าทั้งหมด"
              value={stats.totalProducts}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="สถานะคำสั่งซื้อ" extra={<ShoppingCartOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="รอตรวจสอบ"
                  value={stats.pendingOrders}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="สำเร็จแล้ว"
                  value={stats.completedOrders}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="อัตราความสำเร็จ" extra={<CheckCircleOutlined />}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={completionRate}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size={120}
              />
              <div style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
                {stats.completedOrders} จาก {stats.totalOrders} คำสั่งซื้อ
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card title="คำสั่งซื้อล่าสุด" extra={<ShoppingCartOutlined />}>
        <Table
          columns={recentOrdersColumns}
          dataSource={recentOrders}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}