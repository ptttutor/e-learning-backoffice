"use client";
import { Table, Space, Button, Tag, Badge, Avatar, Typography } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  FileOutlined,
  FolderOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function ExamTable({
  exams,
  loading,
  onEdit,
  onDelete,
  onManageFiles,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const columns = [
    {
      title: "ข้อสอบ",
      key: "exam",
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            icon={<FileOutlined />}
            style={{ backgroundColor: "#1890ff" }}
            size="default"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {record.title}
              </Text>
            </div>
            {record.description && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.description.length > 50
                    ? `${record.description.substring(0, 50)}...`
                    : record.description}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      width: 300,
    },
    {
      title: "หมวดหมู่",
      key: "category",
      render: (_, record) => (
        <Space size={8}>
          <FolderOutlined style={{ color: "#8c8c8c" }} />
          {record.category ? (
            <Tag color="blue">{record.category.name}</Tag>
          ) : (
            <Tag color="default">ไม่ระบุ</Tag>
          )}
        </Space>
      ),
      width: 150,
    },
    {
      title: "จำนวนไฟล์",
      key: "fileCount",
      render: (_, record) => (
        <Badge
          count={record._count?.files || 0}
          style={{ backgroundColor: "#52c41a" }}
          showZero
        />
      ),
      width: 120,
      align: "center",
    },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Tag
          color={isActive ? "success" : "error"}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Button
            icon={<CloudUploadOutlined />}
            size="small"
            onClick={() => onManageFiles(record)}
            style={{ borderRadius: "6px" }}
          >
            จัดการไฟล์
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record.id, record.title)}
            style={{ borderRadius: "6px" }}
          >
            ลบ
          </Button>
        </Space>
      ),
      width: 200,
      fixed: "right",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={exams}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} จาก ${total} รายการ`,
      }}
      size="middle"
    />
  );
}
