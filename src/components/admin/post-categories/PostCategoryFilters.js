"use client";
import React from "react";
import {
  Row,
  Col,
  Input,
  Button,
  Space,
  Select,
  Tag,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function PostCategoryFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  totalCount,
  currentCount,
}) {
  const handleSearch = (value) => {
    onFilterChange("search", value);
  };

  const handleStatusChange = (value) => {
    onFilterChange("status", value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ALL":
        return "default";
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ALL":
        return "ทั้งหมด";
      case "ACTIVE":
        return "ใช้งาน";
      case "INACTIVE":
        return "ไม่ใช้งาน";
      default:
        return status;
    }
  };

  return (
    <div>
      <Row gutter={16} align="middle">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Search
            placeholder="ค้นหาหมวดหมู่โพสต์..."
            allowClear
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={handleSearch}
            style={{ width: "100%" }}
            enterButton={<SearchOutlined />}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="สถานะ"
            value={filters.status}
            onChange={handleStatusChange}
            style={{ width: "100%" }}
            allowClear={false}
          >
            <Option value="ALL">ทั้งหมด</Option>
            <Option value="ACTIVE">ใช้งาน</Option>
            <Option value="INACTIVE">ไม่ใช้งาน</Option>
          </Select>
        </Col>

        <Col xs={24} sm={24} md={8} lg={12}>
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              style={{ borderRadius: "6px" }}
            >
              รีเซ็ต
            </Button>

            {filters.search && (
              <Tag
                closable
                onClose={() => {
                  setSearchInput("");
                  onFilterChange("search", "");
                }}
                color="blue"
              >
                <SearchOutlined /> {filters.search}
              </Tag>
            )}

            {filters.status && filters.status !== "ALL" && (
              <Tag
                closable
                onClose={() => onFilterChange("status", "ALL")}
                color={getStatusColor(filters.status)}
              >
                <FilterOutlined /> {getStatusText(filters.status)}
              </Tag>
            )}
          </Space>
        </Col>
      </Row>

      {/* Results Summary */}
      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <Space size={16}>
          <Text type="secondary">
            <TagOutlined style={{ marginRight: "4px" }} />
            แสดง {currentCount} จาก {totalCount} หมวดหมู่
          </Text>
        </Space>
      </div>
    </div>
  );
}
