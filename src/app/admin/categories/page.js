"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Card,
  Typography,
  Tag,
  Avatar,
} from "antd";
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create or update category
  const handleSubmit = async (values) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(
          editing ? "แก้ไขหมวดหมู่สำเร็จ" : "สร้างหมวดหมู่สำเร็จ"
        );
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchCategories();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // Delete category
  const handleDelete = async (id, name) => {
    Modal.confirm({
      title: "ยืนยันการลบหมวดหมู่?",
      content: `คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/categories/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            message.success("ลบหมวดหมู่สำเร็จ");
            fetchCategories();
          } else {
            message.error(data.error || "เกิดข้อผิดพลาด");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      },
    });
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const columns = [
    {
      title: "หมวดหมู่",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space size={12}>
          <Avatar
            icon={<AppstoreOutlined />}
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
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <Space size={8}>
          <FileTextOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>
            {description || <Text type="secondary">ไม่มีรายละเอียด</Text>}
          </Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "สถานะ",
      key: "status",
      render: () => (
        <Tag color="success" style={{ borderRadius: "4px" }}>
          <TagOutlined style={{ marginRight: "4px" }} />
          ใช้งาน
        </Tag>
      ),
      width: 100,
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
            onClick={() => openModal(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id, record.name)}
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
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <AppstoreOutlined style={{ marginRight: "8px" }} />
            จัดการหมวดหมู่
          </Title>
          <Text type="secondary">จัดการหมวดหมู่สินค้าและเนื้อหา</Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(null)}
            style={{ borderRadius: "6px" }}
            size="middle"
          >
            สร้างหมวดหมู่ใหม่
          </Button>
        </div>

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
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editing ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>
              {editing ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่ใหม่"}
            </Text>
          </Space>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        style={{ top: 20 }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            name="name"
            label={
              <Space size={6}>
                <AppstoreOutlined style={{ color: "#8c8c8c" }} />
                <Text>ชื่อหมวดหมู่</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณากรอกชื่อหมวดหมู่" },
              { min: 2, message: "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร" },
              { max: 100, message: "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร" },
            ]}
          >
            <Input
              placeholder="ใส่ชื่อหมวดหมู่"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <Space size={6}>
                <FileTextOutlined style={{ color: "#8c8c8c" }} />
                <Text>รายละเอียด</Text>
              </Space>
            }
            rules={[
              { max: 500, message: "รายละเอียดต้องไม่เกิน 500 ตัวอักษร" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="ใส่รายละเอียดหมวดหมู่ (ถ้ามี)"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={editing ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editing ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                  form.resetFields();
                }}
                style={{ borderRadius: "6px" }}
              >
                ยกเลิก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
