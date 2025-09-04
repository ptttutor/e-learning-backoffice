"use client";
import {
  Input,
  Select,
  InputNumber,
  Button,
  Typography,
  Space,
  Badge,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

export default function ExamBankFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  categories,
  totalCount,
  currentCount,
  pagination,
  onPageChange,
}) {
  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(
    (value, index, array) => {
      const keys = Object.keys(filters);
      const key = keys[index];
      if (key === "sortBy" && value === "createdAt") return false;
      if (key === "sortOrder" && value === "desc") return false;
      return value && value.toString().trim() !== "";
    }
  ).length;

  const getSortLabel = (sortBy) => {
    switch (sortBy) {
      case "createdAt":
        return "วันที่สร้าง";
      case "name":
        return "ชื่อข้อสอบ";
      case "categoryId":
        return "หมวดหมู่";
      case "fileCount":
        return "จำนวนไฟล์";
      default:
        return sortBy;
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Search Input */}
      <div style={{ marginBottom: "16px" }}>
        <Input
          placeholder="ค้นหาข้อสอบ..."
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: "300px" }}
          allowClear
        />
      </div>

      {/* Filter Controls */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Category Filter */}
        <div style={{ minWidth: "200px" }}>
          <Text strong style={{ display: "block", marginBottom: "4px" }}>
            หมวดหมู่
          </Text>
          <Select
            placeholder="เลือกหมวดหมู่"
            value={filters.categoryId || undefined}
            onChange={(value) => onFilterChange("categoryId", value)}
            style={{ width: "200px" }}
            allowClear
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* File Count Filters */}
        <div style={{ minWidth: "120px" }}>
          <Text strong style={{ display: "block", marginBottom: "4px" }}>
            ไฟล์ขั้นต่ำ
          </Text>
          <InputNumber
            placeholder="0"
            min={0}
            value={filters.minFiles}
            onChange={(value) => onFilterChange("minFiles", value)}
            style={{ width: "120px" }}
          />
        </div>

        <div style={{ minWidth: "120px" }}>
          <Text strong style={{ display: "block", marginBottom: "4px" }}>
            ไฟล์สูงสุด
          </Text>
          <InputNumber
            placeholder="ไม่จำกัด"
            min={0}
            value={filters.maxFiles}
            onChange={(value) => onFilterChange("maxFiles", value)}
            style={{ width: "120px" }}
          />
        </div>

        {/* Sort Options */}
        <div style={{ minWidth: "150px" }}>
          <Text strong style={{ display: "block", marginBottom: "4px" }}>
            เรียงตาม
          </Text>
          <Select
            value={filters.sortBy}
            onChange={(value) => onFilterChange("sortBy", value)}
            style={{ width: "150px" }}
          >
            <Option value="createdAt">วันที่สร้าง</Option>
            <Option value="name">ชื่อข้อสอบ</Option>
            <Option value="categoryId">หมวดหมู่</Option>
            <Option value="fileCount">จำนวนไฟล์</Option>
          </Select>
        </div>

        <div style={{ minWidth: "120px" }}>
          <Text strong style={{ display: "block", marginBottom: "4px" }}>
            ลำดับ
          </Text>
          <Select
            value={filters.sortOrder}
            onChange={(value) => onFilterChange("sortOrder", value)}
            style={{ width: "120px" }}
          >
            <Option value="desc">มากไปน้อย</Option>
            <Option value="asc">น้อยไปมาก</Option>
          </Select>
        </div>

        {/* Reset Button */}
        <div style={{ alignSelf: "flex-end" }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            disabled={activeFiltersCount === 0}
          >
            รีเซ็ต
          </Button>
        </div>
      </div>

      {/* Filter Summary */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          border: "1px solid #e9ecef",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Space size="small">
              <BookOutlined style={{ color: "#1890ff" }} />
              {searchInput && (
                <Text type="secondary">
                  🔍 ค้นหา: &quot;<strong>{searchInput}</strong>&quot;
                </Text>
              )}
              {filters.categoryId && (
                <Text type="secondary">
                  📂 หมวดหมู่: <strong>{categories.find(c => c.id === filters.categoryId)?.name}</strong>
                </Text>
              )}
              {filters.minFiles && (
                <Text type="secondary">📊 ไฟล์ขั้นต่ำ: {filters.minFiles}</Text>
              )}
              {filters.maxFiles && (
                <Text type="secondary">📊 ไฟล์สูงสุด: {filters.maxFiles}</Text>
              )}
              {filters.sortBy && filters.sortBy !== "createdAt" && (
                <Text type="secondary">
                  🔄 เรียงตาม: {getSortLabel(filters.sortBy)}
                </Text>
              )}
              {activeFiltersCount === 0 && (
                <Text type="secondary">ไม่มีตัวกรอง</Text>
              )}
            </Space>
          </div>

          <Text type="secondary">
            หน้า {pagination.page} จาก {pagination.totalPages} | แสดง{" "}
            <strong
              style={{
                color: pagination.totalCount === 0 ? "#ff4d4f" : "#52c41a",
              }}
            >
              {(pagination.page - 1) * pagination.pageSize + 1}-
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.totalCount
              )}
            </strong>{" "}
            จาก <strong>{pagination.totalCount}</strong> ข้อสอบ
            {pagination.totalPages > 1 && (
              <span style={{ marginLeft: "8px", color: "#fa8c16" }}>
                (มีหลายหน้า)
              </span>
            )}
          </Text>
        </div>

        {/* Active Filters Badge */}
        {activeFiltersCount > 0 && (
          <div style={{ marginTop: "8px" }}>
            <Badge
              count={activeFiltersCount}
              style={{ backgroundColor: "#52c41a" }}
            >
              <FilterOutlined style={{ color: "#52c41a", marginRight: "4px" }} />
              <Text style={{ color: "#52c41a" }}>
                ใช้ตัวกรอง {activeFiltersCount} รายการ
              </Text>
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
