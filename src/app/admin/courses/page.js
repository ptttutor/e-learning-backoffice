"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Spin,
  Card,
  Typography,
  Tag,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
  TagOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instLoading, setInstLoading] = useState(false);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      setCourses(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลคอร์สไม่สำเร็จ");
    }
    setLoading(false);
  };

  // Fetch categories
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setCatLoading(false);
  };

  // Fetch instructors
  const fetchInstructors = async () => {
    setInstLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=INSTRUCTOR");
      const data = await res.json();
      setInstructors((data.data || []).filter((u) => u.role === "INSTRUCTOR"));
    } catch (e) {
      message.error("โหลดข้อมูลผู้สอนไม่สำเร็จ");
    }
    setInstLoading(false);
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
    fetchInstructors();
  }, []);

  // Create or update course
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editing) {
        res = await fetch(`/api/admin/courses/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(editing ? "แก้ไขคอร์สสำเร็จ" : "สร้างคอร์สสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchCourses();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      // validation error
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "ยืนยันการลบคอร์ส?",
      onOk: async () => {
        const res = await fetch(`/api/admin/courses/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          message.success("ลบคอร์สสำเร็จ");
          fetchCourses();
        } else {
          message.error(data.error || "เกิดข้อผิดพลาด");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PUBLISHED":
        return "success";
      case "CLOSED":
        return "error";
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
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "ชื่อคอร์ส",
      dataIndex: "title",
      key: "title",
      render: (title) => (
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <Text strong>{title}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
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
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 120,
    },
    {
      title: "ผู้สอน",
      dataIndex: ["instructor", "name"],
      key: "instructor",
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
            onClick={() => openModal(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
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
            จัดการคอร์สเรียน
          </Title>
          <Text type="secondary">สร้างและจัดการคอร์สเรียนออนไลน์</Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(null)}
            style={{ borderRadius: "6px" }}
          >
            สร้างคอร์สใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={courses}
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
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editing ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>{editing ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}</Text>
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
          onFinish={handleOk}
          preserve={false}
        >
          <Form.Item
            name="title"
            label="ชื่อคอร์ส"
            rules={[{ required: true, message: "กรุณากรอกชื่อคอร์ส" }]}
          >
            <Input placeholder="ใส่ชื่อคอร์ส" />
          </Form.Item>

          <Form.Item name="description" label="รายละเอียด">
            <Input.TextArea rows={3} placeholder="รายละเอียดคอร์ส" />
          </Form.Item>

          <Form.Item name="price" label="ราคา">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="0"
              formatter={(value) =>
                `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Option value="DRAFT">
                <Space>
                  <Tag color="default">ฉบับร่าง</Tag>
                </Space>
              </Option>
              <Option value="PUBLISHED">
                <Space>
                  <Tag color="success">เผยแพร่</Tag>
                </Space>
              </Option>
              <Option value="CLOSED">
                <Space>
                  <Tag color="error">ปิด</Tag>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="instructorId"
            label="ผู้สอน"
            rules={[{ required: true, message: "กรุณาเลือกผู้สอน" }]}
          >
            <Select
              loading={instLoading}
              placeholder="เลือกผู้สอน"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {instructors.map((instructor) => (
                <Option key={instructor.id} value={instructor.id}>
                  <Space>
                    <UserOutlined style={{ color: "#8c8c8c" }} />
                    {instructor.name} ({instructor.email})
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="categoryId" label="หมวดหมู่">
            <Select
              loading={catLoading}
              placeholder="เลือกหมวดหมู่"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  <Space>
                    <TagOutlined style={{ color: "#8c8c8c" }} />
                    {cat.name}
                  </Space>
                </Option>
              ))}
            </Select>
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
