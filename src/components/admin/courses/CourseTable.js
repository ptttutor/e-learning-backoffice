"use client";
import { Table, Button, Space, Tag, Image, Typography } from "antd";
import {
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
  TagOutlined,
  DollarOutlined,
  PictureOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function CourseTable({
  courses,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onTableChange,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PUBLISHED":
        return "success";
      case "CLOSED":
        return "error";
      case "DELETED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DRAFT":
        return "ฉบับร่าง";
      case "PUBLISHED":
        return "เผยแพร่";
      case "CLOSED":
        return "ปิด";
      case "DELETED":
        return "ถูกลบ";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "รูปปก",
      dataIndex: "coverImageUrl",
      key: "coverImageUrl",
      render: (coverImageUrl) => (
        <div
          style={{ width: 60, height: 40, overflow: "hidden", borderRadius: 4 }}
        >
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt="Course Cover"
              width={60}
              height={40}
              style={{ objectFit: "cover" }}
              fallback="/placeholder-course.svg"
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 40,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
              }}
            >
              <PictureOutlined style={{ color: "#d9d9d9" }} />
            </div>
          )}
        </div>
      ),
      width: 80,
    },
    {
      title: "ชื่อคอร์ส",
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
          <BookOutlined style={{ color: "#1890ff" }} />
          <Text strong>{title}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "รูปแบบ",
      key: "format",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          {record.isFree ? (
            <Tag color="green" icon={<DollarOutlined />}>
              ฟรี
            </Tag>
          ) : (
            <Tag color="blue" icon={<DollarOutlined />}>
              เสียค่าใช้จ่าย
            </Tag>
          )}
          {record.isPhysical && (
            <Tag color="orange" icon={<TagOutlined />}>
              ส่งของ
            </Tag>
          )}
        </Space>
      ),
      width: 120,
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      sorter: true,
      sortOrder:
        filters.sortBy === "price"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (price) => (
        <Space>
          <DollarOutlined style={{ color: "#52c41a" }} />
          <Text strong style={{ color: "#52c41a" }}>
            {new Intl.NumberFormat("th-TH", {
              style: "currency",
              currency: "THB",
            }).format(price || 0)}
          </Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortOrder:
        filters.sortBy === "status"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 120,
    },
    {
      title: "ผู้สอน",
      dataIndex: ["instructor", "name"],
      key: "instructor",
      sorter: true,
      sortOrder:
        filters.sortBy === "instructor"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (name) => (
        <Space>
          <UserOutlined style={{ color: "#8c8c8c" }} />
          <Text>{name || "-"}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "หมวดหมู่",
      dataIndex: ["category", "name"],
      key: "category",
      sorter: true,
      sortOrder:
        filters.sortBy === "category"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (name) => (
        <Space>
          <TagOutlined style={{ color: "#8c8c8c" }} />
          <Text>{name || "-"}</Text>
        </Space>
      ),
      width: 150,
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
          <Button
            icon={<SettingOutlined />}
            size="small"
            type="link"
            onClick={() =>
              (window.location.href = `/admin/courses/chapter/${record.id}`)
            }
            style={{ borderRadius: "6px" }}
          >
            จัดการ Chapter
          </Button>
        </Space>
      ),
      width: 280,
      fixed: "right",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={courses}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      rowClassName={(record) =>
        record.status === "DELETED" ? "deleted-row" : ""
      }
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