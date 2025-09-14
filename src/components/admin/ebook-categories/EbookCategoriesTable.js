"use client";
import React from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Badge,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function EbookCategoriesTable({
  categories,
  loading,
  submitting,
  deleting,
  onEdit,
  onDelete,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const columns = [
    {
      title: "หมวดหมู่",
      key: "category",
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            icon={<AppstoreOutlined />}
            style={{ backgroundColor: "#1890ff" }}
            size="default"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {record.name}
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
      title: "จำนวน eBook",
      key: "ebookCount",
      render: (_, record) => (
        <Badge
          count={record._count?.ebooks || 0}
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
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
            style={{ borderRadius: "6px" }}
            disabled={submitting || deleting}
          >
            แก้ไข
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record.id, record.name)}
            style={{ borderRadius: "6px" }}
            loading={deleting === record.id}
            disabled={submitting || (deleting && deleting !== record.id)}
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
      dataSource={categories}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1000 }}
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