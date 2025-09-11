"use client";
import { Input, Select, Button, Typography, Space } from "antd";

const { Option } = Select;
const { Text } = Typography;

export default function EbookFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  categories,
  totalCount,
  currentCount,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "end",
        }}
      >
        {/* Search */}
        <div style={{ minWidth: "200px" }}>
          <Text strong>ค้นหา:</Text>
          <Input
            placeholder="ค้นหาชื่อหนังสือ ผู้เขียน หรือ ISBN"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            onClear={() => setSearchInput("")}
            style={{ marginTop: "4px" }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ minWidth: "150px" }}>
          <Text strong>หมวดหมู่:</Text>
          <Select
            value={filters.categoryId}
            onChange={(value) => onFilterChange("categoryId", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกหมวดหมู่"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {Array.isArray(categories) && categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: "120px" }}>
          <Text strong>สถานะ:</Text>
          <Select
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกสถานะ"
          >
            <Option value="ALL">ทั้งหมด</Option>
            <Option value="ACTIVE">เปิดใช้งาน</Option>
            <Option value="INACTIVE">ปิดใช้งาน</Option>
          </Select>
        </div>

        {/* Format Filter */}
        <div style={{ minWidth: "120px" }}>
          <Text strong>รูปแบบ:</Text>
          <Select
            value={filters.format}
            onChange={(value) => onFilterChange("format", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกรูปแบบ"
            allowClear
          >
            <Option value="PDF">PDF</Option>
            <Option value="EPUB">EPUB</Option>
            <Option value="MOBI">MOBI</Option>
          </Select>
        </div>

        {/* Featured Filter */}
        <div style={{ minWidth: "120px" }}>
          <Text strong>แนะนำ:</Text>
          <Select
            value={filters.featured}
            onChange={(value) => onFilterChange("featured", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือก"
          >
            <Option value="ALL">ทั้งหมด</Option>
            <Option value="FEATURED">แนะนำ</Option>
            <Option value="NOT_FEATURED">ไม่แนะนำ</Option>
          </Select>
        </div>

        {/* Physical Book Filter */}
        <div style={{ minWidth: "120px" }}>
          <Text strong>ประเภท:</Text>
          <Select
            value={filters.physical}
            onChange={(value) => onFilterChange("physical", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกประเภท"
          >
            <Option value="ALL">ทั้งหมด</Option>
            <Option value="DIGITAL">ดิจิทัล</Option>
            <Option value="PHYSICAL">กายภาพ</Option>
          </Select>
        </div>

        {/* Clear Filters */}
        <div>
          <Button onClick={onReset} style={{ borderRadius: "6px" }}>
            ล้างตัวกรอง
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "12px", textAlign: "right" }}>
        <Text type="secondary">
          แสดง {currentCount} จาก {totalCount} รายการ
        </Text>
      </div>
    </div>
  );
}