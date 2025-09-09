"use client";
import React from "react";
import {
  Input,
  Select,
  Button,
  Space,
  Card,
  Badge,
  Typography,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  FileTextOutlined,
  SortAscendingOutlined,
  FolderOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

export default function ContentFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  // นับจำนวน active filters
  const activeFiltersCount = [
    searchInput,
    filters.contentType,
    filters.sortBy !== "order_asc" ? filters.sortBy : null,
  ].filter(Boolean).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        {/* Search */}
        <div style={{ minWidth: "250px", flex: 1 }}>
          <Text strong>
            <SearchOutlined style={{ marginRight: "4px" }} />
            ค้นหาชื่อเนื้อหา:
          </Text>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="พิมพ์ชื่อเนื้อหาที่ต้องการค้นหา..."
            style={{ marginTop: "4px" }}
            allowClear
          />
        </div>

        {/* Content Type Filter */}
        <div style={{ minWidth: "180px" }}>
          <Text strong>ประเภทเนื้อหา:</Text>
          <Select
            value={filters.contentType}
            onChange={(value) => onFilterChange("contentType", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกประเภท"
            allowClear
          >
            <Option value="VIDEO">วิดีโอ</Option>
            <Option value="PDF">PDF</Option>
            <Option value="AUDIO">เสียง</Option>
            <Option value="TEXT">ข้อความ</Option>
            <Option value="QUIZ">แบบทดสอบ</Option>
            <Option value="EXAM">ข้อสอบ</Option>
          </Select>
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
            <Option value="type_asc">ประเภท (A → Z)</Option>
            <Option value="type_desc">ประเภท (Z → A)</Option>
            <Option value="created_desc">สร้างล่าสุด</Option>
            <Option value="created_asc">เก่าสุด</Option>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <div style={{ display: "flex", alignItems: "end" }}>
          <Badge count={activeFiltersCount} size="small">
            <Button
              icon={<ClearOutlined />}
              onClick={onReset}
              disabled={activeFiltersCount === 0}
              style={{ borderRadius: "6px" }}
            >
              ล้างตัวกรอง
            </Button>
          </Badge>
        </div>
      </div>

      {/* Summary and Status */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          border: "1px solid #e9ecef"
        }}
      >
        <div>
          <Space size="small">
            <FileTextOutlined style={{ color: "#1890ff" }} />
            {searchInput && (
              <Text type="secondary">
                                <SearchOutlined /> ค้นหา: &quot;<strong>{searchInput}</strong>&quot;
              </Text>
            )}
            {filters.contentType && (
              <Text type="secondary">
                <FolderOutlined /> ประเภท: <strong>{getContentTypeLabel(filters.contentType)}</strong>
              </Text>
            )}
            {filters.sortBy && filters.sortBy !== "order_asc" && (
              <Text type="secondary">
                <SortAscendingOutlined /> เรียงตาม: {getSortLabel(filters.sortBy)}
              </Text>
            )}
            {activeFiltersCount === 0 && (
              <Text type="secondary">ไม่มีตัวกรอง</Text>
            )}
          </Space>
        </div>
        
        <Text type="secondary">
          หน้า {pagination.page} จาก {pagination.totalPages} | 
          แสดง <strong style={{ color: pagination.totalCount === 0 ? "#ff4d4f" : "#52c41a" }}>
            {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
          </strong> จาก <strong>{pagination.totalCount}</strong> เนื้อหา
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
            pageSizeOptions={['10', '20', '50', '100']}
            onShowSizeChange={onPageSizeChange}
            style={{ marginTop: 16 }}
          />
        )}
      </div>
    </div>
  );
}

// Helper function สำหรับแสดงชื่อประเภทเนื้อหา
function getContentTypeLabel(contentType) {
  const labels = {
    VIDEO: "วิดีโอ",
    PDF: "PDF", 
    AUDIO: "เสียง",
    TEXT: "ข้อความ",
    QUIZ: "แบบทดสอบ",
    EXAM: "ข้อสอบ"
  };
  return labels[contentType] || contentType;
}

// Helper function สำหรับแสดงชื่อการเรียง
function getSortLabel(sortBy) {
  const labels = {
    order_asc: "ลำดับ ↑",
    order_desc: "ลำดับ ↓", 
    title_asc: "ชื่อ A-Z",
    title_desc: "ชื่อ Z-A",
    type_asc: "ประเภท A-Z", 
    type_desc: "ประเภท Z-A",
    created_desc: "ใหม่ล่าสุด",
    created_asc: "เก่าสุด"
  };
  return labels[sortBy] || sortBy;
}
