import React, { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Row, Col, Statistic, Spin, message } from 'antd';
import { Line } from '@ant-design/plots';
import { DollarOutlined, ShoppingCartOutlined, BookOutlined, RiseOutlined } from '@ant-design/icons';
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
    <div>
      <Card title="กราฟยอดขาย" className="mb-4">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Select
              value={period}
              onChange={handlePeriodChange}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="daily">รายวัน</Option>
              <Option value="monthly">รายเดือน</Option>
              <Option value="yearly">รายปี</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={16}>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              size="large"
              placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
              format="DD/MM/YYYY"
              allowClear
            />
          </Col>
        </Row>

        {data && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="ยอดขายรวม"
                  value={data.summary.totalRevenue}
                  prefix={<DollarOutlined />}
                  suffix="บาท"
                  valueStyle={{ color: '#3f8600', fontSize: '16px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="ออร์เดอร์ทั้งหมด"
                  value={data.summary.totalOrders}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="รายได้ Course"
                  value={data.summary.courseRevenue || 0}
                  suffix="บาท"
                  valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ({data.summary.courseOrders || 0} ออร์เดอร์)
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="รายได้ E-book"
                  value={data.summary.ebookRevenue || 0}
                  suffix="บาท"
                  valueStyle={{ color: '#fa541c', fontSize: '16px' }}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ({data.summary.ebookOrders || 0} ออร์เดอร์)
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="Course ที่ขายได้"
                  value={data.summary.uniqueCourses || 0}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#13c2c2', fontSize: '16px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card size="small">
                <Statistic
                  title="E-book ที่ขายได้"
                  value={data.summary.uniqueEbooks || 0}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#eb2f96', fontSize: '16px' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Spin spinning={loading}>
          <div style={{ height: '400px', minHeight: '400px' }}>
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
    </div>
  );
};

export default SalesChart;
