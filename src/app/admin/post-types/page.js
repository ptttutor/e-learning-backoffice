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
  TagOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostTypesPage() {
  const [postTypes, setPostTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPostType, setEditingPostType] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPostTypes();
  }, []);

  const fetchPostTypes = async () => {
    try {
      const response = await fetch("/api/admin/post-types");
      const data = await response.json();
      setPostTypes(data);
    } catch (error) {
      console.error("Error fetching post types:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingPostType
        ? `/api/admin/post-types/${editingPostType.id}`
        : "/api/admin/post-types";
      const method = editingPostType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(
          editingPostType ? "อัพเดทประเภทโพสต์สำเร็จ" : "สร้างประเภทโพสต์สำเร็จ"
        );
        fetchPostTypes();
        setModalVisible(false);
        setEditingPostType(null);
        form.resetFields();
      } else {
        message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error saving post type:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const openModal = (postType = null) => {
    setEditingPostType(postType);
    setModalVisible(true);
    if (postType) {
      form.setFieldsValue(postType);
    } else {
      form.resetFields();
    }
  };

  const handleDelete = async (id, name) => {
    Modal.confirm({
      title: "ยืนยันการลบประเภทโพสต์?",
      content: `คุณต้องการลบประเภทโพสต์ "${name}" ใช่หรือไม่?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/post-types/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            message.success("ลบประเภทโพสต์สำเร็จ");
            fetchPostTypes();
          } else {
            message.error("เกิดข้อผิดพลาดในการลบ");
          }
        } catch (error) {
          console.error("Error deleting post type:", error);
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
      title: "ประเภทโพสต์",
      key: "postType",
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            icon={<TagOutlined />}
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
      title: "จำนวนโพสต์",
      key: "postCount",
      render: (_, record) => (
        <Badge
          count={record._count?.posts || 0}
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
            <FileOutlined style={{ marginRight: "8px" }} />
            จัดการประเภทโพสต์
          </Title>
          <Text type="secondary">จัดการประเภทและหมวดหมู่ของโพสต์</Text>
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
            เพิ่มประเภทใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={postTypes}
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
            {editingPostType ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>
              {editingPostType ? "แก้ไขประเภทโพสต์" : "เพิ่มประเภทโพสต์ใหม่"}
            </Text>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPostType(null);
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
                <TagOutlined style={{ color: "#8c8c8c" }} />
                <Text>ชื่อประเภท</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณากรอกชื่อประเภท" },
              { min: 2, message: "ชื่อประเภทต้องมีอย่างน้อย 2 ตัวอักษร" },
              { max: 100, message: "ชื่อประเภทต้องไม่เกิน 100 ตัวอักษร" },
            ]}
          >
            <Input
              placeholder="ใส่ชื่อประเภทโพสต์"
              style={{ borderRadius: "6px" }}
            />
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
              placeholder="ใส่คำอธิบายประเภทโพสต์ (ถ้ามี)"
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
                icon={editingPostType ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editingPostType ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingPostType(null);
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
