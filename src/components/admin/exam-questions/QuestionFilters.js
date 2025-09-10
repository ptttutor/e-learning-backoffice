"use client";
import { Card, Input, Select, Button, Space, Typography, Row, Col } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

export default function QuestionFilters({
  searchInput,
  setSearchInput,
  filters,
  onFilterChange,
  onResetFilters,
  loading,
  currentCount,
}) {
  const questionTypes = [
    { value: "MULTIPLE_CHOICE", label: "เลือกตอบ" },
    { value: "TRUE_FALSE", label: "จริง/เท็จ" },
    { value: "SHORT_ANSWER", label: "ตอบสั้น" },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8} lg={8}>
          <Input
            placeholder="ค้นหาคำถาม..."
            prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ borderRadius: "6px" }}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="ประเภทคำถาม"
            value={filters.questionType || undefined}
            onChange={(value) => onFilterChange("questionType", value || "")}
            style={{ width: "100%" }}
            allowClear
          >
            {questionTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="เรียงตาม"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              onFilterChange("sortBy", sortBy);
              onFilterChange("sortOrder", sortOrder);
            }}
            style={{ width: "100%" }}
          >
            <Option value="createdAt-asc">วันที่สร้าง (เก่า-ใหม่)</Option>
            <Option value="createdAt-desc">วันที่สร้าง (ใหม่-เก่า)</Option>
            <Option value="questionType-asc">ประเภท (A-Z)</Option>
            <Option value="questionType-desc">ประเภท (Z-A)</Option>
            <Option value="marks-asc">คะแนน (น้อย-มาก)</Option>
            <Option value="marks-desc">คะแนน (มาก-น้อย)</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Button
            icon={<ReloadOutlined />}
            onClick={onResetFilters}
            disabled={loading}
            style={{ borderRadius: "6px", width: "100%" }}
          >
            รีเซ็ต
          </Button>
        </Col>
      </Row>

      <Row style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Space align="center">
            <QuestionCircleOutlined style={{ color: "#8c8c8c" }} />
            <Text type="secondary">
              แสดง {currentCount} คำถาม
            </Text>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
