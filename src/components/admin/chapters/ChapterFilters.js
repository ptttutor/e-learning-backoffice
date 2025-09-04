"use client";
import {
  Input,
  Select,
  InputNumber,
  Button,
  Typography,
  Space,
  Badge,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

export default function ChapterFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  pagination,
}) {
  // นับจำนวน active filters
  const activeFiltersCount = [
    searchInput,
    filters.minOrder,
    filters.sortBy !== "order_asc" ? filters.sortBy : null,
  ].filter(Boolean).length;
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "end",
          marginBottom: "16px",
        }}
      >
        {/* Search */}
        <div style={{ minWidth: "250px", flex: 1 }}>
          <Text strong>
            <SearchOutlined style={{ marginRight: "4px" }} />
            ค้นหา Chapter:
          </Text>
          <Input
            placeholder="ค้นหาชื่อ Chapter..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            onClear={() => setSearchInput("")}
            style={{ marginTop: "4px" }}
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          />
        </div>

        {/* Sort By */}
        <div style={{ minWidth: "150px" }}>
          <Text strong>
            <FilterOutlined style={{ marginRight: "4px" }} />
            เรียงตาม:
          </Text>
          <Select
            value={filters.sortBy}
            onChange={(value) => onFilterChange("sortBy", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกการเรียง"
          >
            <Option value="order_asc">ลำดับ (น้อย → มาก)</Option>
            <Option value="order_desc">ลำดับ (มาก → น้อย)</Option>
            <Option value="title_asc">ชื่อ (A → Z)</Option>
            <Option value="title_desc">ชื่อ (Z → A)</Option>
            <Option value="created_desc">สร้างล่าสุด</Option>
            <Option value="created_asc">สร้างเก่าสุด</Option>
          </Select>
        </div>

        {/* Clear Filters */}
        <div>
          <Badge count={activeFiltersCount} size="small">
            <Button
              onClick={onReset}
              style={{ borderRadius: "6px" }}
              icon={<ClearOutlined />}
              disabled={activeFiltersCount === 0}
            >
              ล้างตัวกรอง
            </Button>
          </Badge>
        </div>
      </div>

      {/* Filter Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          border: "1px solid #e9ecef",
        }}
      >
        <div>
          <Space size="small">
            <BookOutlined style={{ color: "#1890ff" }} />
            {searchInput && (
              <Text type="secondary">
                🔍 ค้นหา: &quot;<strong>{searchInput}</strong>&quot;
              </Text>
            )}
            {filters.minOrder && (
              <Text type="secondary">📊 ลำดับต่ำสุด: {filters.minOrder}</Text>
            )}
            {filters.sortBy && filters.sortBy !== "order_asc" && (
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
          จาก <strong>{pagination.totalCount}</strong> Chapter
          {pagination.totalPages > 1 && (
            <span style={{ marginLeft: "8px", color: "#fa8c16" }}>
              (มีหลายหน้า)
            </span>
          )}
        </Text>

        {pagination.totalPages > 1 && (
          <Pagination
            current={pagination.page}
            total={pagination.totalCount}
            pageSize={pagination.pageSize}
            onChange={onPageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`
            }
            pageSizeOptions={["10", "20", "50", "100"]}
            onShowSizeChange={onPageSizeChange}
            style={{ marginTop: 16 }}
          />
        )}
      </div>
    </div>
  );
}

// Helper function สำหรับแสดงชื่อการเรียง
function getSortLabel(sortBy) {
  const labels = {
    order_asc: "ลำดับ ↑",
    order_desc: "ลำดับ ↓",
    title_asc: "ชื่อ A-Z",
    title_desc: "ชื่อ Z-A",
    created_desc: "ใหม่ล่าสุด",
    created_asc: "เก่าสุด",
  };
  return labels[sortBy] || sortBy;
}
