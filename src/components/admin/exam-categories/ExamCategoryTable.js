"use client";
import { Table, Button, Space, Tag, Typography, Switch, Popconfirm, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

const { Text } = Typography;

export default function ExamCategoryTable({
  examCategories,
  loading,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onTableChange,
  deletingId,
  toggling,
}) {
  const columns = [
    {
      title: "ชื่อหมวดหมู่",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (name, record) => (
        <div>
          <Text strong style={{ fontSize: 16 }}>
            {name}
          </Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "จำนวนข้อสอบ",
      dataIndex: "_count",
      key: "examCount",
      align: "center",
      width: 120,
      render: (count) => (
        <Space>
          <BookOutlined />
          <Text strong>{count?.exams || 0}</Text>
        </Space>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 120,
      render: (isActive, record) => (
        <Popconfirm
          title={`${isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}หมวดหมู่นี้?`}
          description={
            isActive
              ? "หมวดหมู่ที่ปิดใช้งานจะไม่สามารถสร้างข้อสอบใหม่ได้"
              : "หมวดหมู่ที่เปิดใช้งานจะสามารถสร้างข้อสอบใหม่ได้"
          }
          icon={<ExclamationCircleOutlined style={{ color: "orange" }} />}
          onConfirm={() => onToggleStatus(record.id, !isActive)}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <Switch
            checked={isActive}
            checkedChildren="เปิด"
            unCheckedChildren="ปิด"
            size="small"
            loading={toggling === record.id}
          />
        </Popconfirm>
      ),
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      width: 150,
      render: (createdAt) => (
        <div>
          <Text style={{ fontSize: 12 }}>
            {new Date(createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
                locale: th,
              })}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "วันที่แก้ไข",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      width: 150,
      render: (updatedAt) => (
        <div>
          <Text style={{ fontSize: 12 }}>
            {new Date(updatedAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatDistanceToNow(new Date(updatedAt), {
                addSuffix: true,
                locale: th,
              })}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="ลบหมวดหมู่ข้อสอบ?"
            description={
              record._count?.exams > 0
                ? "ไม่สามารถลบหมวดหมู่ที่มีข้อสอบอยู่ได้"
                : "คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?"
            }
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => onDelete(record.id)}
            okText="ยืนยัน"
            cancelText="ยกเลิก"
            disabled={record._count?.exams > 0}
          >
            <Tooltip 
              title={
                record._count?.exams > 0 
                  ? "ไม่สามารถลบหมวดหมู่ที่มีข้อสอบอยู่ได้"
                  : "ลบ"
              }
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={record._count?.exams > 0}
                loading={deletingId === record.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={examCategories}
      loading={loading}
      rowKey="id"
      pagination={{
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.totalCount,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} จาก ${total} รายการ`,
        pageSizeOptions: ["5", "10", "20", "50"],
        onChange: (page, pageSize) => onTableChange(page, pageSize),
        onShowSizeChange: (current, size) => onTableChange(current, size),
      }}
      onChange={(pagination, filters, sorter) => {
        if (sorter && sorter.field) {
          onTableChange(
            pagination.current,
            pagination.pageSize,
            sorter.field,
            sorter.order === "ascend" ? "asc" : "desc"
          );
        }
      }}
      scroll={{ x: 800 }}
      size="middle"
    />
  );
}