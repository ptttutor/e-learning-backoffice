"use client";
import { Table, Button, Space, Tag, Typography, Image } from "antd";
import {
  QuestionCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

export default function QuestionTable({
  questions,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onTableChange,
}) {
  const getQuestionTypeColor = (type) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "blue";
      case "TRUE_FALSE":
        return "green";
      case "SHORT_ANSWER":
        return "orange";
      default:
        return "default";
    }
  };

  const getQuestionTypeText = (type) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "เลือกตอบ";
      case "TRUE_FALSE":
        return "จริง/เท็จ";
      case "SHORT_ANSWER":
        return "ตอบสั้น";
      default:
        return type;
    }
  };

  const columns = [
    {
      title: "คำถาม",
      dataIndex: "questionText",
      key: "questionText",
      sorter: true,
      sortOrder:
        filters.sortBy === "questionText"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (questionText, record) => (
        <Space direction="vertical" size={4} style={{ maxWidth: "400px" }}>
          <Space>
            <QuestionCircleOutlined style={{ color: "#1890ff" }} />
            {record.questionImage && (
              <PictureOutlined style={{ color: "#52c41a" }} />
            )}
          </Space>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: "อ่านเพิ่มเติม" }}
            style={{ margin: 0 }}
          >
            {questionText}
          </Paragraph>
          {record.questionImage && (
            <Image
              src={record.questionImage}
              alt="Question"
              width={80}
              height={60}
              style={{ objectFit: "cover", borderRadius: "4px" }}
            />
          )}
        </Space>
      ),
      width: 400,
    },
    {
      title: "ประเภทคำถาม",
      dataIndex: "questionType",
      key: "questionType",
      sorter: true,
      sortOrder:
        filters.sortBy === "questionType"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (questionType) => (
        <Tag color={getQuestionTypeColor(questionType)}>
          {getQuestionTypeText(questionType)}
        </Tag>
      ),
      width: 130,
    },
    {
      title: "ตัวเลือก/คำตอบที่ถูก",
      key: "options",
      render: (_, record) => {
        if (record.questionType === "SHORT_ANSWER") {
          return (
            <Space direction="vertical" size={2}>
              <Tag color="orange" icon={<FileTextOutlined />}>
                คำตอบแบบข้อความ
              </Tag>
              {record.explanation && (
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  มีเฉลย
                </Text>
              )}
            </Space>
          );
        }

        const correctOptions = record.options?.filter(opt => opt.isCorrect) || [];
        const totalOptions = record.options?.length || 0;

        return (
          <Space direction="vertical" size={4}>
            <Space>
              <Text strong style={{ color: "#52c41a" }}>
                {correctOptions.length}
              </Text>
              <Text type="secondary">
                / {totalOptions} ตัวเลือก
              </Text>
            </Space>
            {correctOptions.slice(0, 2).map((option, index) => (
              <Space key={option.id} size={4}>
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "12px" }} />
                <Text style={{ fontSize: "12px" }} ellipsis>
                  {option.optionText}
                </Text>
              </Space>
            ))}
            {correctOptions.length > 2 && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                และอีก {correctOptions.length - 2} ตัวเลือก
              </Text>
            )}
          </Space>
        );
      },
      width: 200,
    },
    {
      title: "คะแนน",
      dataIndex: "marks",
      key: "marks",
      sorter: true,
      sortOrder:
        filters.sortBy === "marks"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (marks) => (
        <Text strong style={{ color: "#fa8c16" }}>
          {marks} คะแนน
        </Text>
      ),
      width: 100,
    },
    {
      title: "เฉลย",
      dataIndex: "explanation",
      key: "explanation",
      render: (explanation) => (
        <Space>
          {explanation ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              มีเฉลย
            </Tag>
          ) : (
            <Tag color="default" icon={<CloseCircleOutlined />}>
              ไม่มีเฉลย
            </Tag>
          )}
        </Space>
      ),
      width: 100,
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
      width: 150,
      fixed: "right",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={questions}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
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
