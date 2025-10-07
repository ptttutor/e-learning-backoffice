"use client";
import {
  Button,
  Card,
  Space,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import {
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

export default function OrderFilters({
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  loading,
}) {
  return (
    <Card style={{ marginBottom: "16px" }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="ค้นหาคำสั่งซื้อ, ลูกค้า, สินค้า"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            style={{ width: '100%' }}
            allowClear
          />
        </Col>
        {/* <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="สถานะคำสั่งซื้อ"
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="PENDING">รอชำระเงิน</Option>
            <Option value="PENDING_VERIFICATION">รอตรวจสอบ</Option>
            <Option value="COMPLETED">สำเร็จ</Option>
            <Option value="CANCELLED">ยกเลิก</Option>
          </Select>
        </Col> */}
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="สถานะการชำระเงิน"
            value={filters.paymentStatus}
            onChange={(value) => onFilterChange('paymentStatus', value)}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="PENDING">รอชำระ</Option>
            <Option value="PENDING_VERIFICATION">รอตรวจสอบ</Option>
            <Option value="COMPLETED">ชำระแล้ว</Option>
            <Option value="REJECTED">ปฏิเสธ</Option>
            {/* <Option value="FREE">ฟรี</Option> */}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="ประเภทสินค้า"
            value={filters.orderType}
            onChange={(value) => onFilterChange('orderType', value)}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="COURSE">คอร์สเรียน</Option>
            <Option value="EBOOK">หนังสือ</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              รีเฟรช
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={onResetFilters}
            >
              ล้างตัวกรอง
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}