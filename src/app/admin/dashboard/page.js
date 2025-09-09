'use client';

import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  Spin,
  Alert,
  Typography,
  Space,
  Tag,
  Progress
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { useDashboardStats, useCourseSales } from '@/hooks/useDashboard';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminDashboard() {
  const [period, setPeriod] = useState(30);
  
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats(period);
  const { courseSales, loading: salesLoading, error: salesError } = useCourseSales(period);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('th-TH').format(number);
  };

  const courseSalesColumns = [
    {
      title: 'อันดับ',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <Tag color={index < 3 ? ['gold', 'silver', '#cd7f32'][index] : 'default'}>
          #{index + 1}
        </Tag>
      )
    },
    {
      title: 'ชื่อคอร์ส',
      dataIndex: 'courseName',
      key: 'courseName',
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'ผู้สอน',
      dataIndex: 'instructor',
      key: 'instructor'
    },
    {
      title: 'หมวดหมู่',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: 'ยอดขาย',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.totalSales - b.totalSales,
      defaultSortOrder: 'descend'
    },
    {
      title: 'จำนวนคำสั่งซื้อ',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      align: 'center',
      render: (count) => formatNumber(count)
    },
    {
      title: 'มูลค่าเฉลี่ย/คำสั่งซื้อ',
      dataIndex: 'averageOrderValue',
      key: 'averageOrderValue',
      align: 'right',
      render: (amount) => formatCurrency(amount)
    }
  ];

  if (statsError || salesError) {
    return (
      <Alert
        message="เกิดข้อผิดพลาด"
        description={statsError || salesError}
        type="error"
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          แดชบอร์ดผู้ดูแลระบบ
        </Title>
        <Select
          value={period}
          onChange={setPeriod}
          style={{ width: 200 }}
          placeholder="เลือกช่วงเวลา"
        >
          <Option value={7}>7 วันล่าสุด</Option>
          <Option value={30}>30 วันล่าสุด</Option>
          <Option value={90}>90 วันล่าสุด</Option>
          <Option value={365}>1 ปีล่าสุด</Option>
        </Select>
      </div>

      <Spin spinning={statsLoading}>
        {stats && (
          <>
            {/* สถิติภาพรวม */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="รายได้ทั้งหมด"
                    value={stats.stats.revenue.total}
                    precision={2}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DollarOutlined />}
                    suffix="บาท"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="คำสั่งซื้อทั้งหมด"
                    value={stats.stats.orders.total}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ShoppingCartOutlined />}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="success">สำเร็จ: {stats.stats.orders.completed}</Text>
                    <br />
                    <Text type="warning">รออนุมัติ: {stats.stats.orders.pending}</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="ผู้ใช้ใหม่"
                    value={stats.stats.users.new}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<UserOutlined />}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text>ผู้ใช้ทั้งหมด: {formatNumber(stats.stats.users.total)}</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="การลงทะเบียนใหม่"
                    value={stats.stats.enrollments.total}
                    valueStyle={{ color: '#eb2f96' }}
                    prefix={<BookOutlined />}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="success">ใช้งานอยู่: {stats.stats.enrollments.active}</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* กราฟรายได้ 7 วันล่าสุด */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card 
                  title={
                    <Space>
                      <RiseOutlined />
                      <span>แนวโน้มรายได้ 7 วันล่าสุด</span>
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    {stats.stats.revenue.trend.map((day, index) => (
                      <Col span={24/7} key={day.date}>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                          <Text style={{ fontSize: 12 }}>
                            {new Date(day.date).toLocaleDateString('th-TH', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </Text>
                        </div>
                        <Progress
                          type="dashboard"
                          percent={Math.round((day.revenue / Math.max(...stats.stats.revenue.trend.map(d => d.revenue))) * 100)}
                          width={60}
                          format={() => formatCurrency(day.revenue)}
                        />
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* สถิติคอร์ส */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card 
                  title={
                    <Space>
                      <BookOutlined />
                      <span>สถิติคอร์ส</span>
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="คอร์สทั้งหมด"
                        value={stats.stats.courses.total}
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="เผยแพร่แล้ว"
                        value={stats.stats.courses.published}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="ร่าง"
                        value={stats.stats.courses.draft}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Spin>

      {/* ตารางยอดขาย Course */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            <span>ยอดขายคอร์ส ({period} วันล่าสุด)</span>
          </Space>
        }
        style={{ marginTop: 24 }}
      >
        <Spin spinning={salesLoading}>
          {courseSales && (
            <>
              {/* สรุปยอดขาย */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="รายได้รวม"
                      value={courseSales.summary.totalRevenue}
                      precision={2}
                      suffix="บาท"
                      valueStyle={{ color: '#3f8600', fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="คำสั่งซื้อ"
                      value={courseSales.summary.totalOrders}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="มูลค่าเฉลี่ย"
                      value={courseSales.summary.averageOrderValue}
                      precision={2}
                      suffix="บาท"
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="คอร์สที่มียпродาж"
                      value={courseSales.summary.totalCourses}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* ตารางรายละเอียด */}
              <Table
                columns={courseSalesColumns}
                dataSource={courseSales.courseSales}
                rowKey="courseId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `ทั้งหมด ${total} รายการ`
                }}
                scroll={{ x: 800 }}
              />
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
}
