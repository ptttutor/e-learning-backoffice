import { Card, Row, Col, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function CouponFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  loading
}) {
  return (
    <Card style={{ marginBottom: 24 }} title="ตัวกรอง">
      <Row gutter={[16, 16]}>
        {/* Search */}
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="ค้นหารหัสคูปอง, ชื่อ หรือคำอธิบาย..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
          />
        </Col>

        {/* Type Filter */}
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="ประเภทคูปอง"
            style={{ width: '100%' }}
            value={filters.type || undefined}
            onChange={(value) => onFilterChange('type', value)}
            allowClear
          >
            <Option value="PERCENTAGE">ส่วนลด %</Option>
            <Option value="FIXED_AMOUNT">ส่วนลดจำนวนคงที่</Option>
            <Option value="FREE_SHIPPING">ฟรีค่าส่ง</Option>
          </Select>
        </Col>

        {/* Status Filter */}
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="สถานะ"
            style={{ width: '100%' }}
            value={filters.status || undefined}
            onChange={(value) => onFilterChange('status', value)}
            allowClear
          >
            <Option value="active">ใช้งานได้</Option>
            <Option value="inactive">ไม่ใช้งาน</Option>
          </Select>
        </Col>

        {/* Applicable Type Filter */}
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="ขอบเขตการใช้งาน"
            style={{ width: '100%' }}
            value={filters.applicable || undefined}
            onChange={(value) => onFilterChange('applicable', value)}
            allowClear
          >
            <Option value="ALL">ทุกสินค้า</Option>
            <Option value="COURSE_ONLY">คอร์สเท่านั้น</Option>
            <Option value="EBOOK_ONLY">E-book เท่านั้น</Option>
            <Option value="CATEGORY">หมวดหมู่ที่กำหนด</Option>
            <Option value="SPECIFIC_ITEM">สินค้าที่กำหนด</Option>
          </Select>
        </Col>
      </Row>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
          <Button
            icon={<ClearOutlined />}
            onClick={onReset}
            disabled={loading}
          >
            ล้างตัวกรอง
          </Button>
        </Space>
      </div>
    </Card>
  );
}
