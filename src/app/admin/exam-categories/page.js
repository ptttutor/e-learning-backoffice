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
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function AdminExamCategoriesPage() {
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
      const response = await fetch("/api/admin/exam-categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingCategory
        ? `/api/admin/exam-categories/${editingCategory.id}`
        : "/api/admin/exam-categories";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        setModalVisible(false);
        fetchCategories();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
          const response = await fetch(`/api/admin/exam-categories/${id}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (result.success) {
            message.success(result.message || "ลบหมวดหมู่สำเร็จ");
            fetchCategories();
          } else {
            message.error(result.error);
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      },
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
            icon={<FolderOutlined />}
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
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <Space size={8}>
          <FileTextOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>
            {description || <Text type="secondary">ไม่มีคำอธิบาย</Text>}
          </Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "จำนวนข้อสอบ",
      key: "examCount",
      render: (_, record) => (
        <Badge
          count={record._count?.exams || 0}
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
            onClick={() => handleEdit(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id, record.name)}
            disabled={record._count?.exams > 0}
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
            <BookOutlined style={{ marginRight: "8px" }} />
            จัดการหมวดหมู่ข้อสอบ
          </Title>
          <Text type="secondary">
            จัดการหมวดหมู่สำหรับจัดเก็บและจัดระเบียบข้อสอบ
          </Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
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
                ? "แก้ไขหมวดหมู่ข้อสอบ"
                : "เพิ่มหมวดหมู่ข้อสอบใหม่"}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={
              <Space size={6}>
                <FolderOutlined style={{ color: "#8c8c8c" }} />
                <Text>ชื่อหมวดหมู่</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณาระบุชื่อหมวดหมู่" },
              { min: 2, message: "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร" },
              { max: 255, message: "ชื่อหมวดหมู่ต้องไม่เกิน 255 ตัวอักษร" },
            ]}
          >
            <Input
              placeholder="เช่น คณิตศาสตร์, ฟิสิกส์, เคมี"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <Space size={6}>
                <FileTextOutlined style={{ color: "#8c8c8c" }} />
                <Text>คำอธิบาย (ไม่บังคับ)</Text>
              </Space>
            }
            rules={[{ max: 500, message: "คำอธิบายต้องไม่เกิน 500 ตัวอักษร" }]}
          >
            <TextArea
              rows={4}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหมวดหมู่นี้"
              style={{ borderRadius: "6px" }}
            />
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
