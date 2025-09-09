import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, Spin, Alert, Tag, Typography } from 'antd';
import {
  BookOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  DownloadOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const EbookSales = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState(30);

  const fetchEbookSales = async (selectedPeriod) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard/ebook-sales?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Error fetching ebook sales:', result.error);
      }
    } catch (error) {
      console.error('Error fetching ebook sales:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEbookSales(period);
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

  const ebookSalesColumns = [
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
      title: 'ชื่อ E-book',
      dataIndex: 'ebookTitle',
      key: 'ebookTitle',
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'ผู้เขียน',
      dataIndex: 'author',
      key: 'author'
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
  ];

  const recentOrdersColumns = [
    {
      title: 'เลขที่สั่งซื้อ',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: 'E-book',
      dataIndex: 'ebookTitle',
      key: 'ebookTitle',
      ellipsis: true,
    },
    {
      title: 'ผู้เขียน',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'ยอดเงิน',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 120,
      render: (value) => formatCurrency(value)
    },
    {
      title: 'วันที่ชำระ',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  ];

  if (!data && !loading) {
    return null;
  }

  return (
    <div>
      <Card>
        <Row align="middle" justify="space-between" className="mb-4">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <BookOutlined /> ยอดขาย E-book
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
              {/* สถิติรวม */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={4}>
                  <Card size="small">
                    <Statistic
                      title="รายได้รวม"
                      value={data.summary.totalRevenue}
                      prefix={<DollarOutlined />}
                      suffix="บาท"
                      valueStyle={{ color: '#3f8600', fontSize: '18px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Card size="small">
                    <Statistic
                      title="คำสั่งซื้อ"
                      value={data.summary.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                      valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Card size="small">
                    <Statistic
                      title="E-book ที่ขายได้"
                      value={data.summary.totalEbooks}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Card size="small">
                    <Statistic
                      title="ดาวน์โหลดทั้งหมด"
                      value={data.summary.totalDownloads}
                      prefix={<DownloadOutlined />}
                      valueStyle={{ color: '#fa541c', fontSize: '18px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Card size="small">
                    <Statistic
                      title="ผู้ดาวน์โหลด"
                      value={data.summary.uniqueDownloaders}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#13c2c2', fontSize: '18px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Card size="small">
                    <Statistic
                      title="ค่าเฉลี่ย/คำสั่งซื้อ"
                      value={data.summary.averageOrderValue}
                      precision={0}
                      suffix="บาท"
                      valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* E-book ขายดี */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} xl={14}>
                  <Card 
                    title={
                      <span>
                        <BookOutlined /> E-book ขายดี (Top 10)
                      </span>
                    }
                  >
                    <Table
                      dataSource={data.ebookSales}
                      columns={ebookSalesColumns}
                      rowKey="ebookId"
                      pagination={false}
                      size="small"
                      scroll={{ x: 800 }}
                    />
                  </Card>
                </Col>
                
                {/* คำสั่งซื้อล่าสุด */}
                <Col xs={24} xl={10}>
                  <Card
                    title={
                      <span>
                        <ShoppingCartOutlined /> คำสั่งซื้อล่าสุด
                      </span>
                    }
                  >
                    <Table
                      dataSource={data.recentOrders}
                      columns={recentOrdersColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      scroll={{ x: 600 }}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default EbookSales;
