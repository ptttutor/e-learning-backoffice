"use client";
import { Card, Input, Select, Button, Space, Typography, Row, Col } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

export default function ExamFilters({
  searchInput,
  setSearchInput,
  filters,
  onFilterChange,
  onResetFilters,
  loading,
  currentCount,
}) {
  const examTypes = [
    { value: "PRETEST", label: "ทดสอบก่อนเรียน" },
    { value: "POSTTEST", label: "ทดสอบหลังเรียน" },
    { value: "QUIZ", label: "แบบทดสอบ" },
    { value: "MIDTERM", label: "สอบกลางภาค" },
    { value: "FINAL", label: "สอบปลายภาค" },
    { value: "PRACTICE", label: "ฝึกทำ" },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            placeholder="ค้นหาชื่อข้อสอบ..."
            prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ borderRadius: "6px" }}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            placeholder="ประเภทข้อสอบ"
            value={filters.examType || undefined}
            onChange={(value) => onFilterChange("examType", value || "")}
            style={{ width: "100%" }}
            allowClear
          >
            {examTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            placeholder="สถานะ"
            value={filters.status || undefined}
            onChange={(value) => onFilterChange("status", value || "")}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="active">เปิดใช้งาน</Option>
            <Option value="inactive">ปิดใช้งาน</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
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
            <Option value="title-asc">ชื่อข้อสอบ (ก-ฮ)</Option>
            <Option value="title-desc">ชื่อข้อสอบ (ฮ-ก)</Option>
            <Option value="examType-asc">ประเภท (ก-ฮ)</Option>
            <Option value="examType-desc">ประเภท (ฮ-ก)</Option>
            <Option value="totalMarks-asc">คะแนน (น้อย-มาก)</Option>
            <Option value="totalMarks-desc">คะแนน (มาก-น้อย)</Option>
            <Option value="createdAt-desc">วันที่สร้าง (ใหม่-เก่า)</Option>
            <Option value="createdAt-asc">วันที่สร้าง (เก่า-ใหม่)</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={onResetFilters}
              disabled={loading}
              style={{ borderRadius: "6px" }}
            >
              รีเซ็ต
            </Button>
          </Space>
        </Col>
      </Row>

      <Row style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Space align="center">
            <FileTextOutlined style={{ color: "#8c8c8c" }} />
            <Text type="secondary">
              แสดง {currentCount} ข้อสอบ
            </Text>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
