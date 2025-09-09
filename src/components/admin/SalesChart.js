import React, { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Row, Col, Statistic, Spin, message, Space, Typography } from 'antd';
import { Line } from '@ant-design/plots';
import { DollarOutlined, ShoppingCartOutlined, BookOutlined, RiseOutlined, BarChartOutlined, CalendarOutlined, ReadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const { RangePicker } = DatePicker;
const { Option } = Select;

dayjs.locale('th');

const SalesChart = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState(null);

  const fetchSalesData = async (selectedPeriod, customDateRange = null) => {
    setLoading(true);
    try {
      let url = `/api/admin/dashboard/sales-chart?period=${selectedPeriod}`;
      
      if (customDateRange && customDateRange.length === 2) {
        const startDate = customDateRange[0].format('YYYY-MM-DD');
        const endDate = customDateRange[1].format('YYYY-MM-DD');
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      message.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSalesData(period, dateRange);
  }, [period, dateRange]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setDateRange(null); // รีเซ็ตช่วงวันที่เมื่อเปลี่ยนประเภท
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // เตรียมข้อมูลสำหรับกราฟ
  const getChartData = () => {
    if (!data?.chartData) return [];
    
    return data.chartData.map(item => {
      let xValue, displayValue;
      
      switch (period) {
        case 'daily':
          xValue = item.date;
          displayValue = item.displayDate;
          break;
        case 'monthly':
          xValue = item.month;
          displayValue = item.displayMonth;
          break;
        case 'yearly':
          xValue = item.year;
          displayValue = item.displayYear;
          break;
        default:
          xValue = item.date;
          displayValue = item.displayDate;
      }
      
      return {
        x: xValue,
        y: item.revenue,
        orders: item.orders,
        courseCount: item.courseCount || 0,
        ebookCount: item.ebookCount || 0,
        totalItems: item.totalItems || 0,
        display: displayValue,
      };
    });
  };

  const chartConfig = {
    data: getChartData(),
    xField: 'x',
    yField: 'y',
    smooth: true,
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: 'ยอดขาย',
          value: `฿${datum.y?.toLocaleString() || 0}`,
        };
      },
      customContent: (title, data) => {
        if (data && data.length > 0) {
          const datum = data[0]?.data;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${datum?.display || title}</div>
              <div>ยอดขายรวม: ฿${datum?.y?.toLocaleString() || 0}</div>
              <div>จำนวนออร์เดอร์: ${datum?.orders || 0}</div>
              <div>Course ที่ขาย: ${datum?.courseCount || 0}</div>
              <div>E-book ที่ขาย: ${datum?.ebookCount || 0}</div>
              <div>รายการทั้งหมด: ${datum?.totalItems || 0}</div>
            </div>
          `;
        }
        return '';
      },
    },
    xAxis: {
      title: {
        text: period === 'daily' ? 'วันที่' : period === 'monthly' ? 'เดือน' : 'ปี',
      },
      label: {
        formatter: (text) => {
          // แสดงเฉพาะส่วนสำคัญของวันที่
          if (period === 'daily') {
            return dayjs(text).format('DD/MM');
          }
          return text;
        },
        rotate: period === 'daily' ? Math.PI / 6 : 0,
      },
    },
    yAxis: {
      title: {
        text: 'ยอดขาย (บาท)',
      },
      label: {
        formatter: (text) => `฿${parseInt(text).toLocaleString()}`,
      },
    },
    color: '#1890ff',
    lineStyle: {
      lineWidth: 2,
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
  };

  // ตัวเลือกช่วงเวลาเริ่มต้น
  const getDefaultDateRange = () => {
    const now = dayjs();
    switch (period) {
      case 'daily':
        return [now.subtract(30, 'day'), now];
      case 'monthly':
        return [now.subtract(12, 'month').startOf('month'), now.endOf('month')];
      case 'yearly':
        return [now.subtract(5, 'year').startOf('year'), now.endOf('year')];
      default:
        return [now.subtract(30, 'day'), now];
    }
  };

  return (
    <Card 
      title={
        <Space>
          <div style={{
            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChartOutlined style={{ color: '#fff', fontSize: '18px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>กราฟยอดขาย Course & E-book</span>
        </Space>
      }
      style={{ 
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={8}>
          <div>
            <Typography.Text style={{ marginBottom: '6px', display: 'block', fontWeight: '500', fontSize: '12px', color: '#666' }}>
              ประเภทกราฟ
            </Typography.Text>
            <Select
              value={period}
              onChange={handlePeriodChange}
              style={{ width: '100%' }}
              size="small"
            >
              <Option value="daily"><CalendarOutlined /> รายวัน</Option>
              <Option value="monthly"><BarChartOutlined /> รายเดือน</Option>
              <Option value="yearly"><RiseOutlined /> รายปี</Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} sm={12} md={16}>
          <div>
            <Typography.Text style={{ marginBottom: '6px', display: 'block', fontWeight: '500', fontSize: '12px', color: '#666' }}>
              ช่วงวันที่
            </Typography.Text>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              size="small"
              placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
              format="DD/MM/YYYY"
              allowClear
            />
          </div>
        </Col>
      </Row>

        {data && (
          <div style={{ 
            background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f4f8 100%)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <Space style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#434343'
            }}>
              <BarChartOutlined style={{ color: '#434343' }} />
              <span>สถิติการขาย</span>
            </Space>
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={8} lg={4}>
                <div style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  minHeight: '80px'
                }}>
                  <div style={{ color: '#52c41a', fontSize: '16px', marginBottom: '4px' }}>
                    <DollarOutlined />
                  </div>
                  <div style={{ color: '#999', fontSize: '10px', marginBottom: '2px' }}>
                    ยอดขายรวม
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#52c41a' }}>
                    ฿{data.summary.totalRevenue.toLocaleString()}
                  </div>
                </div>
              </Col>
              
              <Col xs={12} sm={8} lg={4}>
                <div style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  minHeight: '80px'
                }}>
                  <div style={{ color: '#1890ff', fontSize: '16px', marginBottom: '4px' }}>
                    <ShoppingCartOutlined />
                  </div>
                  <div style={{ color: '#999', fontSize: '10px', marginBottom: '2px' }}>
                    ออร์เดอร์ทั้งหมด
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                    {data.summary.totalOrders.toLocaleString()}
                  </div>
                </div>
              </Col>

              <Col xs={12} sm={8} lg={4}>
                <div style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  minHeight: '80px'
                }}>
                  <div style={{ color: '#722ed1', fontSize: '16px', marginBottom: '4px' }}>
                    <DollarOutlined />
                  </div>
                  <div style={{ color: '#999', fontSize: '10px', marginBottom: '2px' }}>
                    รายได้ Course
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#722ed1' }}>
                    ฿{(data.summary.courseRevenue || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '9px', color: '#999', marginTop: '1px' }}>
                    ({data.summary.courseOrders || 0} ออร์เดอร์)
                  </div>
                </div>
              </Col>

              <Col xs={12} sm={8} lg={4}>
                <div style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  minHeight: '80px'
                }}>
                  <div style={{ color: '#fa541c', fontSize: '16px', marginBottom: '4px' }}>
                    <BookOutlined />
                  </div>
                  <div style={{ color: '#999', fontSize: '10px', marginBottom: '2px' }}>
                    รายได้ E-book
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fa541c' }}>
                    ฿{(data.summary.ebookRevenue || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '9px', color: '#999', marginTop: '1px' }}>
                    ({data.summary.ebookOrders || 0} ออร์เดอร์)
                  </div>
                </div>
              </Col>

              <Col xs={12} sm={8} lg={4}>
                <div style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  minHeight: '80px'
                }}>
                  <div style={{ color: '#13c2c2', fontSize: '16px', marginBottom: '4px' }}>
                    <BookOutlined />
                  </div>
                  <div style={{ color: '#999', fontSize: '10px', marginBottom: '2px' }}>
                    Course ที่ขายได้
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#13c2c2' }}>
                    {data.summary.uniqueCourses || 0}
                  </div>
                </div>
              </Col>

              <Col xs={12} sm={8} lg={4}>
                <div style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  minHeight: '80px'
                }}>
                  <div style={{ color: '#eb2f96', fontSize: '16px', marginBottom: '4px' }}>
                    <ReadOutlined />
                  </div>
                  <div style={{ color: '#999', fontSize: '10px', marginBottom: '2px' }}>
                    E-book ที่ขายได้
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#eb2f96' }}>
                    {data.summary.uniqueEbooks || 0}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        <Spin spinning={loading}>
          <div style={{ height: '350px', minHeight: '350px' }}>
            {data && getChartData().length > 0 ? (
              <Line {...chartConfig} />
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                color: '#999'
              }}>
                {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่มีข้อมูลในช่วงเวลาที่เลือก'}
              </div>
            )}
          </div>
        </Spin>
      </Card>
  );
};

export default SalesChart;
