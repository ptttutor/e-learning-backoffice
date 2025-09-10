"use client";
import { Table, Button, Space, Tag, Typography } from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function ExamTable({
  exams,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onManageQuestions,
  onTableChange,
}) {
  const getExamTypeColor = (type) => {
    switch (type) {
      case "PRETEST":
        return "blue";
      case "POSTTEST":
        return "green";
      case "QUIZ":
        return "orange";
      case "MIDTERM":
        return "purple";
      case "FINAL":
        return "red";
      case "PRACTICE":
        return "cyan";
      default:
        return "default";
    }
  };

  const getExamTypeText = (type) => {
    switch (type) {
      case "PRETEST":
        return "ทดสอบก่อนเรียน";
      case "POSTTEST":
        return "ทดสอบหลังเรียน";
      case "QUIZ":
        return "แบบทดสอบ";
      case "MIDTERM":
        return "สอบกลางภาค";
      case "FINAL":
        return "สอบปลายภาค";
      case "PRACTICE":
        return "ฝึกทำ";
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    return status ? "success" : "default";
  };

  const getStatusText = (status) => {
    return status ? "เปิดใช้งาน" : "ปิดใช้งาน";
  };

  const columns = [
    {
      title: "ชื่อข้อสอบ",
      dataIndex: "title",
      key: "title",
      sorter: true,
      sortOrder:
        filters.sortBy === "title"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (title) => (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <Text strong>{title}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "ประเภทข้อสอบ",
      dataIndex: "examType",
      key: "examType",
      sorter: true,
      sortOrder:
        filters.sortBy === "examType"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (examType) => (
        <Tag color={getExamTypeColor(examType)}>
          {getExamTypeText(examType)}
        </Tag>
      ),
      width: 150,
    },
    {
      title: "จำนวนข้อ",
      key: "questionCount",
      render: (_, record) => (
        <Space>
          <QuestionCircleOutlined style={{ color: "#8c8c8c" }} />
          <Text>{record._count?.questions || 0} ข้อ</Text>
        </Space>
      ),
      width: 100,
    },
    {
      title: "เวลาจำกัด",
      dataIndex: "timeLimit",
      key: "timeLimit",
      sorter: true,
      sortOrder:
        filters.sortBy === "timeLimit"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (timeLimit) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#fa8c16" }} />
          <Text>{timeLimit ? `${timeLimit} นาที` : "ไม่จำกัด"}</Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: "คะแนนรวม",
      dataIndex: "totalMarks",
      key: "totalMarks",
      sorter: true,
      sortOrder:
        filters.sortBy === "totalMarks"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (totalMarks) => (
        <Text strong style={{ color: "#52c41a" }}>
          {totalMarks} คะแนน
        </Text>
      ),
      width: 100,
    },
    {
      title: "คะแนนผ่าน",
      dataIndex: "passingMarks",
      key: "passingMarks",
      sorter: true,
      sortOrder:
        filters.sortBy === "passingMarks"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (passingMarks) => (
        <Text style={{ color: "#fa541c" }}>
          {passingMarks} คะแนน
        </Text>
      ),
      width: 100,
    },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "isActive",
      sorter: true,
      sortOrder:
        filters.sortBy === "isActive"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (isActive) => (
        <Tag 
          color={getStatusColor(isActive)}
          icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
        >
          {getStatusText(isActive)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder:
        filters.sortBy === "createdAt"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (createdAt) => (
        <Text style={{ color: "#8c8c8c" }}>
          {new Date(createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      ),
      width: 120,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            icon={<QuestionCircleOutlined />}
            size="small"
            type="default"
            onClick={() => onManageQuestions(record)}
            style={{ borderRadius: "6px" }}
          >
            จัดการคำถาม
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => onDelete(record)}
            style={{ borderRadius: "6px" }}
          >
            ลบ
          </Button>
        </Space>
      ),
      width: 300,
      fixed: "right",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={exams}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1400 }}
      onChange={onTableChange}
      pagination={{
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.totalCount,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} จาก ${total} รายการ`,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
      size="middle"
    />
  );
}
