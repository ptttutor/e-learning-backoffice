import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, Spin, Tag, Typography } from 'antd';
import {
  BookOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const CourseSalesDetail = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState(30);

  const fetchCourseSales = async (selectedPeriod) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard/course-sales?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching course sales:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourseSales(period);
  }, [period]);

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
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (value) => formatCurrency(value)
    },
    {
      title: 'ยอดขาย',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right',
      sorter: (a, b) => a.totalSales - b.totalSales,
      render: (value) => <Text strong style={{ color: '#3f8600' }}>{formatCurrency(value)}</Text>
    },
    {
      title: 'จำนวนขาย',
      dataIndex: 'orderCount',
      key: 'orderCount',
      align: 'center',
      sorter: (a, b) => a.orderCount - b.orderCount,
      render: (value) => <Tag color="green">{formatNumber(value)}</Tag>
    },
    {
      title: 'นักเรียน',
      dataIndex: 'enrollmentCount',
      key: 'enrollmentCount',
      align: 'center',
      render: (value) => <Tag color="purple">{formatNumber(value)}</Tag>
    },
  ];

  return (
    <div>
      <Row align="middle" justify="space-between" className="mb-4">
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <BookOutlined /> รายละเอียดยอดขาย Course
          </Title>
        </Col>
        <Col>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 150 }}
          >
            <Option value={7}>7 วันล่าสุด</Option>
            <Option value={30}>30 วันล่าสุด</Option>
            <Option value={90}>90 วันล่าสุด</Option>
            <Option value={365}>1 ปีล่าสุด</Option>
          </Select>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {data && (
          <>
            {/* สถิติรวม Course */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="รายได้รวม Course"
                    value={data.summary.totalRevenue}
                    prefix={<DollarOutlined />}
                    suffix="บาท"
                    valueStyle={{ color: '#3f8600', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="ออร์เดอร์ Course"
                    value={data.summary.totalOrders}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Course ที่ขายได้"
                    value={data.summary.totalCourses}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="ค่าเฉลี่ย/ออร์เดอร์"
                    value={data.summary.averageOrderValue}
                    precision={0}
                    suffix="บาท"
                    valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* ตาราง Course ขายดี */}
            <Card 
              title={
                <span>
                  <TrophyOutlined /> Course ขายดี
                </span>
              }
            >
              <Table
                dataSource={data.courseSales}
                columns={courseSalesColumns}
                rowKey="courseId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `ทั้งหมด ${total} รายการ`
                }}
                scroll={{ x: 1000 }}
                size="small"
              />
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default CourseSalesDetail;
