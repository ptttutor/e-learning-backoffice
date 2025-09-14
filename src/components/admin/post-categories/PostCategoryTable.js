"use client";
import React from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Avatar,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function PostCategoryTable({
  postCategories,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onTableChange,
  deletingId,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
  };

  const getStatusText = (isActive) => {
    return isActive ? "ใช้งาน" : "ไม่ใช้งาน";
  };

  const columns = [
    {
      title: "หมวดหมู่",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        filters.sortBy === "name"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (name, record) => (
        <Space size={12}>
          <Avatar 
            icon={<TagOutlined />} 
            style={{ backgroundColor: "#1890ff" }}
            size="default"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {name}
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
          icon={isActive ? <TagOutlined /> : <DeleteOutlined />}
        >
          {getStatusText(isActive)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "จำนวนโพสต์",
      dataIndex: "posts",
      key: "postsCount",
      render: (posts) => (
        <Space>
          <FileTextOutlined style={{ color: "#8c8c8c" }} />
          <Text>{posts?.length || 0} โพสต์</Text>
        </Space>
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
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 180,
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
          >
            แก้ไข
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record)}
            style={{ borderRadius: "6px" }}
            loading={deletingId === record.id}
          >
            ลบ
          </Button>
        </Space>
      ),
      width: 160,
      fixed: "right",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={postCategories || []}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination?.page || 1,
        pageSize: pagination?.pageSize || 10,
        total: pagination?.totalCount || 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} จาก ${total} รายการ`,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
      onChange={onTableChange}
      scroll={{ x: 1000 }}
      size="middle"
    />
  );
}
