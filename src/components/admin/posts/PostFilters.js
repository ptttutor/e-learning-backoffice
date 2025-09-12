"use client";
import React from "react";
import {
  Input,
  Select,
  Button,
  Space,
  Badge,
  Typography,
  Pagination,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  FileTextOutlined,
  TagOutlined,
  CalendarOutlined,
  FolderOutlined,
  SortAscendingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function PostFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  pagination,
  onPageChange,
  onPageSizeChange,
  postTypes = [], // Default เป็น empty array
}) {
  // นับจำนวน active filters
  const activeFiltersCount = [
    searchInput,
    filters.postTypeId,
    filters.dateFrom || filters.dateTo,
    filters.sortBy !== "created_desc" ? filters.sortBy : null,
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
        <div style={{ minWidth: "300px", flex: 1 }}>
          <Text strong>
            <SearchOutlined style={{ marginRight: "4px" }} />
            ค้นหาโพสต์:
          </Text>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ค้นหาจากหัวข้อ เนื้อหา หรือสรุป..."
            style={{ marginTop: "4px" }}
            allowClear
          />
        </div>

        {/* Post Type Filter */}
        <div style={{ minWidth: "180px" }}>
          <Text strong>
            <TagOutlined style={{ marginRight: "4px" }} />
            ประเภทโพสต์:
          </Text>
          <Select
            value={filters.postTypeId}
            onChange={(value) => onFilterChange("postTypeId", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกประเภท"
            allowClear
          >
            {Array.isArray(postTypes) && postTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                {type.name || 'ไม่ระบุประเภท'}
              </Option>
            ))}
          </Select>
        </div>

        {/* Date Range Filter */}
        <div style={{ minWidth: "250px" }}>
          <Text strong>
            <CalendarOutlined style={{ marginRight: "4px" }} />
            ช่วงวันที่สร้าง:
          </Text>
          <RangePicker
            value={[
              filters.dateFrom ? dayjs(filters.dateFrom) : null,
              filters.dateTo ? dayjs(filters.dateTo) : null,
            ]}
            onChange={(dates) => {
              onFilterChange("dateFrom", dates?.[0] ? dates[0].format('YYYY-MM-DD') : '');
              onFilterChange("dateTo", dates?.[1] ? dates[1].format('YYYY-MM-DD') : '');
            }}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder={["วันที่เริ่มต้น", "วันที่สิ้นสุด"]}
            format="DD/MM/YYYY"
          />
        </div>

        {/* Sort By */}
        <div style={{ minWidth: "180px" }}>
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
            <Option value="created_desc">สร้างล่าสุด</Option>
            <Option value="created_asc">สร้างเก่าสุด</Option>
            <Option value="title_asc">หัวข้อ (A → Z)</Option>
            <Option value="title_desc">หัวข้อ (Z → A)</Option>
            <Option value="author_asc">ผู้เขียน (A → Z)</Option>
            <Option value="author_desc">ผู้เขียน (Z → A)</Option>
            <Option value="type_asc">ประเภท (A → Z)</Option>
            <Option value="type_desc">ประเภท (Z → A)</Option>
            <Option value="published_desc">เผยแพร่ล่าสุด</Option>
            <Option value="published_asc">เผยแพร่เก่าสุด</Option>
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
            {filters.postTypeId && (
              <Text type="secondary">
                                <FolderOutlined /> ประเภท: <strong>{postTypes.find(t => t.id === filters.postTypeId)?.name}</strong>
              </Text>
            )}
            {filters.authorId && (
              <Text type="secondary">
                <UserOutlined /> ผู้เขียน: <strong>{authors.find(a => a.id === filters.authorId)?.name}</strong>
              </Text>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <Text type="secondary">
                <CalendarOutlined /> วันที่: <strong>
                  {filters.dateFrom && dayjs(filters.dateFrom).format('DD/MM/YYYY')} 
                  {filters.dateFrom && filters.dateTo && ' - '}
                  {filters.dateTo && dayjs(filters.dateTo).format('DD/MM/YYYY')}
                </strong>
              </Text>
            )}
            {filters.sortBy && filters.sortBy !== "created_desc" && (
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
          </strong> จาก <strong>{pagination.totalCount}</strong> โพสต์
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

// Helper function สำหรับแสดงชื่อการเรียง
function getSortLabel(sortBy) {
  const labels = {
    created_desc: "สร้างล่าสุด",
    created_asc: "สร้างเก่าสุด",
    title_asc: "หัวข้อ A-Z",
    title_desc: "หัวข้อ Z-A",
    author_asc: "ผู้เขียน A-Z",
    author_desc: "ผู้เขียน Z-A",
    type_asc: "ประเภท A-Z",
    type_desc: "ประเภท Z-A",
    published_desc: "เผยแพร่ล่าสุด",
    published_asc: "เผยแพร่เก่าสุด"
  };
  return labels[sortBy] || sortBy;
}
