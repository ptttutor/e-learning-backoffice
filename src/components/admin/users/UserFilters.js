import { Card, Row, Col, Input, Select, Button, Space, Typography } from "antd";
import { SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

export default function UserFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  totalCount,
  currentCount,
  loading
}) {
  return (
    <Card style={{ marginBottom: "24px" }}>
      <Row gutter={[16, 16]} align="middle">
        {/* Search Input */}
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="ค้นหาชื่อ อีเมล หรือ LINE ID..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
          />
        </Col>

        {/* Role Filter */}
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="บทบาท"
            value={filters.role}
            onChange={(value) => onFilterChange('role', value)}
            style={{ width: '100%' }}
          >
            <Option value="all">ทั้งหมด</Option>
            <Option value="STUDENT">นักเรียน</Option>
            <Option value="INSTRUCTOR">ผู้สอน</Option>
            <Option value="ADMIN">ผู้ดูแลระบบ</Option>
          </Select>
        </Col>

        {/* Status Filter */}
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="สถานะ"
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            style={{ width: '100%' }}
          >
            <Option value="all">ทั้งหมด</Option>
            <Option value="active">เปิดใช้งาน</Option>
            <Option value="inactive">ปิดใช้งาน</Option>
          </Select>
        </Col>

        {/* Sort Order */}
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="เรียงลำดับ"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              onFilterChange('sortBy', sortBy);
              onFilterChange('sortOrder', sortOrder);
            }}
            style={{ width: '100%' }}
          >
            <Option value="createdAt-desc">ใหม่ล่าสุด</Option>
            <Option value="createdAt-asc">เก่าสุด</Option>
            <Option value="name-asc">ชื่อ A-Z</Option>
            <Option value="name-desc">ชื่อ Z-A</Option>
            <Option value="email-asc">อีเมล A-Z</Option>
            <Option value="email-desc">อีเมล Z-A</Option>
          </Select>
        </Col>

        {/* Reset Button */}
        <Col xs={24} sm={12} md={4}>
          <Space style={{ width: '100%' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              disabled={loading}
            >
              รีเซ็ต
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Results Summary */}
      <Row style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
        <Col span={24}>
          <Text type="secondary">
            แสดงผลลัพธ์ {currentCount} จากทั้งหมด {totalCount} รายการ
            {filters.search && (
              <span style={{ marginLeft: "8px" }}>
                ค้นหา: &quot;<strong>{filters.search}</strong>&quot;
              </span>
            )}
            {filters.role !== 'all' && (
              <span style={{ marginLeft: "8px" }}>
                บทบาท: <strong>
                  {filters.role === 'STUDENT' ? 'นักเรียน' :
                   filters.role === 'INSTRUCTOR' ? 'ผู้สอน' :
                   filters.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : filters.role}
                </strong>
              </span>
            )}
            {filters.status !== 'all' && (
              <span style={{ marginLeft: "8px" }}>
                สถานะ: <strong>
                  {filters.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </strong>
              </span>
            )}
          </Text>
        </Col>
      </Row>
    </Card>
  );
}
