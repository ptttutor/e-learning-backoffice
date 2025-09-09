import React, { useState } from 'react';
import { Card, Tabs, Row, Col, Statistic, Switch, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import SalesChart from './SalesChart';
import CourseSalesDetail from './CourseSalesDetail';
import EbookSalesDetail from './EbookSalesDetail';
import { useDashboardStats, useCourseSales } from '@/hooks/useDashboard';

const { Title } = Typography;
const { TabPane } = Tabs;

const DashboardOverview = () => {
  const [period, setPeriod] = useState(30);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { stats, loading: statsLoading } = useDashboardStats(period);
  const { courseSales, loading: courseSalesLoading } = useCourseSales(period);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('th-TH').format(number);
  };

  return (
    <div>
      {/* Header Controls */}
      <Card className="mb-4">
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <DashboardOutlined /> Dashboard
            </Title>
          </Col>
          <Col>
            <Space>
              <span>มุมมองแบบละเอียด:</span>
              <Switch
                checked={showDetailedView}
                onChange={setShowDetailedView}
                checkedChildren="เปิด"
                unCheckedChildren="ปิด"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Sales Chart - Always Show */}
      <SalesChart />

      {/* Overview Stats */}
      {stats && (
        <Card title="สถิติรวม" className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="รายได้รวม"
                  value={stats.stats.revenue.total}
                  prefix={<DollarOutlined />}
                  suffix="บาท"
                  valueStyle={{ color: '#3f8600', fontSize: '18px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="คำสั่งซื้อทั้งหมด"
                  value={stats.stats.orders.total}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  prefix={<ShoppingCartOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px' }}>
                  <span style={{ color: '#52c41a' }}>สำเร็จ: {stats.stats.orders.completed}</span>
                  <br />
                  <span style={{ color: '#faad14' }}>รออนุมัติ: {stats.stats.orders.pending}</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="ผู้ใช้ใหม่"
                  value={stats.stats.users.new}
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                  prefix={<UserOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  ผู้ใช้ทั้งหมด: {formatNumber(stats.stats.users.total)}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="Course ทั้งหมด"
                  value={stats.stats.courses.total}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#13c2c2', fontSize: '18px' }}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  ใช้งาน: {stats.stats.courses.published}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="E-book ทั้งหมด"
                  value={stats.stats.ebooks?.total || 0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#fa541c', fontSize: '18px' }}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  ใช้งาน: {stats.stats.ebooks?.published || 0}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="การลงทะเบียนใหม่"
                  value={stats.stats.enrollments.total}
                  valueStyle={{ color: '#eb2f96', fontSize: '18px' }}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  ใช้งานอยู่: {stats.stats.enrollments.active}
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* Detailed View */}
      {showDetailedView && (
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            <TabPane 
              tab={
                <span>
                  <DashboardOutlined />
                  ภาพรวม
                </span>
              } 
              key="overview"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="สถิติ Course" size="small">
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Statistic
                          title="รายได้ Course"
                          value={courseSales?.summary?.totalRevenue || 0}
                          suffix="บาท"
                          valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="ออร์เดอร์ Course"
                          value={courseSales?.summary?.totalOrders || 0}
                          valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Course ที่ขายได้"
                          value={courseSales?.summary?.totalCourses || 0}
                          valueStyle={{ fontSize: '16px', color: '#722ed1' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="ค่าเฉลี่ย/ออร์เดอร์"
                          value={courseSales?.summary?.averageOrderValue || 0}
                          precision={0}
                          suffix="บาท"
                          valueStyle={{ fontSize: '16px', color: '#fa8c16' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="สถิติ E-book" size="small">
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Statistic
                          title="รายได้ E-book"
                          value={0} // จะได้จาก API ใหม่
                          suffix="บาท"
                          valueStyle={{ fontSize: '16px', color: '#fa541c' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="ออร์เดอร์ E-book"
                          value={0} // จะได้จาก API ใหม่
                          valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="E-book ที่ขายได้"
                          value={0} // จะได้จาก API ใหม่
                          valueStyle={{ fontSize: '16px', color: '#13c2c2' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="ดาวน์โหลดทั้งหมด"
                          value={0} // จะได้จาก API ใหม่
                          valueStyle={{ fontSize: '16px', color: '#eb2f96' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <BookOutlined />
                  Course รายละเอียด
                </span>
              } 
              key="courses"
            >
              <CourseSalesDetail />
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <FileTextOutlined />
                  E-book รายละเอียด
                </span>
              } 
              key="ebooks"
            >
              <EbookSalesDetail />
            </TabPane>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default DashboardOverview;
