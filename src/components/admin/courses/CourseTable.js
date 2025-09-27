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
  FileTextOutlined,
  StarFilled,
} from "@ant-design/icons";
import { getSubjectLabel } from "@/lib/constants";

const { Text } = Typography;

export default function CourseTable({
  courses,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onManageExams,
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
      title: "แนะนำ",
      dataIndex: "isRecommended",
      key: "isRecommended",
      align: "center",
      render: (isRecommended) =>
        isRecommended ? (
          <Tag color="gold" style={{ fontWeight: "bold" }}>
            <StarFilled /> แนะนำ
          </Tag>
        ) : null,
      width: 90,
    },
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
      render: (price, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <DollarOutlined style={{ color: "#52c41a" }} />
            <Text strong style={{ color: "#52c41a" }}>
              {new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
              }).format(price || 0)}
            </Text>
          </Space>
          {record.discountPrice && (
            <Text type="secondary" delete style={{ fontSize: "12px" }}>
              {new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
              }).format(record.discountPrice)}
            </Text>
          )}
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
      title: "จำนวนวัน",
      dataIndex: "accessDuration",
      key: "accessDuration",
      align: "center",
      render: (val) => (val ? `${val} วัน` : "-"),
      width: 90,
    },
    {
      title: "จำนวนชั่วโมง",
      dataIndex: "accessHours",
      key: "accessHours",
      align: "center",
      render: (val) => (val ? `${val} ชม.` : "-"),
      width: 90,
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
      title: "วิชา",
      dataIndex: "subject",
      key: "subject",
      sorter: true,
      sortOrder:
        filters.sortBy === "subject"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (subject) => (
        <Space>
          <BookOutlined style={{ color: "#8c8c8c" }} />
          <Text>{subject ? getSubjectLabel(subject) : "-"}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Button
            shape="circle"
            icon={<EditOutlined />}
            size="middle"
            type="primary"
            style={{ borderRadius: "50%" }}
            onClick={() => onEdit(record)}
            title="แก้ไข"
          />
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            size="middle"
            danger
            style={{ borderRadius: "50%" }}
            onClick={() => onDelete(record)}
            title="ลบ"
          />
          <Button
            shape="circle"
            icon={<FileTextOutlined />}
            size="middle"
            style={{ borderRadius: "50%" }}
            onClick={() => onManageExams(record)}
            title="จัดการข้อสอบ"
          />
          <Button
            shape="circle"
            icon={<SettingOutlined />}
            size="middle"
            type="default"
            style={{ borderRadius: "50%" }}
            onClick={() =>
              (window.location.href = `/admin/courses/chapter/${record.id}`)
            }
            title="จัดการ Chapter"
          />
        </Space>
      ),
      width: 180,
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
