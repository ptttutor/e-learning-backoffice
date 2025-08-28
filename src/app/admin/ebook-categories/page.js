"use client";
import { useState, useEffect } from "react";
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
  Checkbox,
  Badge,
} from "antd";
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TagOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EbookCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/ebook-categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingCategory
        ? `/api/admin/ebook-categories/${editingCategory.id}`
        : "/api/admin/ebook-categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(
          editingCategory ? "อัพเดทหมวดหมู่สำเร็จ" : "สร้างหมวดหมู่สำเร็จ"
        );
        fetchCategories();
        setModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
      } else {
        message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    setModalVisible(true);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
  };

  const handleDelete = async (id, name) => {
    Modal.confirm({
      title: "ยืนยันการลบหมวดหมู่?",
      content: `คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/ebook-categories/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            message.success("ลบหมวดหมู่สำเร็จ");
            fetchCategories();
          } else {
            message.error("เกิดข้อผิดพลาดในการลบ");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      },
    });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({
      name,
      slug: generateSlug(name),
    });
  };

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
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => (
        <Space size={8}>
          <LinkOutlined style={{ color: "#8c8c8c" }} />
          <Text code style={{ fontSize: "12px" }}>
            {slug}
          </Text>
        </Space>
      ),
      width: 200,
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

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>กำลังโหลด...</div>
      </div>
    );
  }

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
            <BookOutlined style={{ marginRight: "8px" }} />
            จัดการหมวดหมู่ eBook
          </Title>
          <Text type="secondary">
            จัดการหมวดหมู่สำหรับหนังสืออิเล็กทรอนิกส์
          </Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ borderRadius: "6px" }}
            size="middle"
          >
            เพิ่มหมวดหมู่ใหม่
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
            {editingCategory ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>
              {editingCategory
                ? "แก้ไขหมวดหมู่ eBook"
                : "เพิ่มหมวดหมู่ eBook ใหม่"}
            </Text>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
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
          initialValues={{
            isActive: true,
          }}
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
              onChange={handleNameChange}
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label={
              <Space size={6}>
                <LinkOutlined style={{ color: "#8c8c8c" }} />
                <Text>Slug</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณากรอก Slug" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Slug ต้องเป็นตัวอักษรเล็ก ตัวเลข และ - เท่านั้น",
              },
            ]}
          >
            <Input placeholder="slug-name" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <Space size={6}>
                <FileTextOutlined style={{ color: "#8c8c8c" }} />
                <Text>คำอธิบาย</Text>
              </Space>
            }
            rules={[{ max: 500, message: "คำอธิบายต้องไม่เกิน 500 ตัวอักษร" }]}
          >
            <TextArea
              rows={4}
              placeholder="ใส่คำอธิบายหมวดหมู่ (ถ้ามี)"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>เปิดใช้งาน</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={editingCategory ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editingCategory ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
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
