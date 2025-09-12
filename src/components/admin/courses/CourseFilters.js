"use client";
import { Input, Select, InputNumber, Button, Typography, Space } from "antd";
import { getSubjectOptions } from "@/lib/constants";

const { Option } = Select;
const { Text } = Typography;

export default function CourseFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  instructors,
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
            placeholder="ค้นหาชื่อคอร์สหรือรายละเอียด"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            onClear={() => setSearchInput("")}
            style={{ marginTop: "4px" }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: "150px" }}>
          <Text strong>สถานะ:</Text>
          <Select
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกสถานะ"
          >
            <Option value="ALL">ทั้งหมด</Option>
            <Option value="ACTIVE">ใช้งานอยู่</Option>
            <Option value="DRAFT">ฉบับร่าง</Option>
            <Option value="PUBLISHED">เผยแพร่</Option>
            <Option value="CLOSED">ปิด</Option>
            <Option value="DELETED">ถูกลบ</Option>
          </Select>
        </div>

        {/* Instructor Filter */}
        <div style={{ minWidth: "180px" }}>
          <Text strong>ผู้สอน:</Text>
          <Select
            value={filters.instructorId}
            onChange={(value) => onFilterChange("instructorId", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกผู้สอน"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {instructors.map((instructor) => (
              <Option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </Option>
            ))}
          </Select>
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
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Subject Filter */}
        <div style={{ minWidth: "180px" }}>
          <Text strong>วิชา:</Text>
          <Select
            value={filters.subject}
            onChange={(value) => onFilterChange("subject", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกวิชา"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {getSubjectOptions().map((subject) => (
              <Option key={subject.value} value={subject.value}>
                {subject.label}
              </Option>
            ))}
          </Select>
        </div>

        {/* Price Range */}
        <div style={{ minWidth: "120px" }}>
          <Text strong>ราคาต่ำสุด:</Text>
          <InputNumber
            value={filters.minPrice}
            onChange={(value) => onFilterChange("minPrice", value || "")}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="0"
            min={0}
            formatter={(value) =>
              value ? `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
          />
        </div>

        <div style={{ minWidth: "120px" }}>
          <Text strong>ราคาสูงสุด:</Text>
          <InputNumber
            value={filters.maxPrice}
            onChange={(value) => onFilterChange("maxPrice", value || "")}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="ไม่จำกัด"
            min={0}
            formatter={(value) =>
              value ? `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
          />
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