"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Card,
  Typography,
  Tag,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function AdminChaptersPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chapters?courseId=${courseId}`);
      const data = await res.json();
      setChapters(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูล chapter ไม่สำเร็จ");
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchChapters();
  }, [courseId, fetchChapters]);

  // Create or update chapter
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editing) {
        res = await fetch(`/api/admin/chapters/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch(`/api/admin/chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, courseId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(
          editing ? "แก้ไข chapter สำเร็จ" : "สร้าง chapter สำเร็จ"
        );
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchChapters();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      // validation error
    }
  };

  // Delete chapter
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "ยืนยันการลบ chapter?",
      onOk: async () => {
        const res = await fetch(`/api/admin/chapters/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          message.success("ลบ chapter สำเร็จ");
          fetchChapters();
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

  const columns = [
    {
      title: "ชื่อ Chapter",
      dataIndex: "title",
      key: "title",
      render: (title) => (
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <Text strong>{title}</Text>
        </Space>
      ),
      width: 300,
    },
    {
      title: "ลำดับ",
      dataIndex: "order",
      key: "order",
      render: (order) => (
        <Space>
          <OrderedListOutlined style={{ color: "#8c8c8c" }} />
          <Tag color="blue">{order}</Tag>
        </Space>
      ),
      width: 120,
      sorter: (a, b) => a.order - b.order,
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
            icon={<FileTextOutlined />}
            size="small"
            type="link"
            onClick={() =>
              (window.location.href = `/admin/courses/content/${record.id}`)
            }
            style={{ borderRadius: "6px" }}
          >
            จัดการเนื้อหา
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
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{ borderRadius: "6px" }}
            >
              กลับ
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <BookOutlined style={{ marginRight: "8px" }} />
              จัดการ Chapter
            </Title>
          </Space>
          <Text type="secondary">สร้างและจัดการ Chapter ของคอร์สเรียน</Text>
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
            สร้าง Chapter ใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={chapters}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
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
              {editing ? "แก้ไข Chapter" : "สร้าง Chapter ใหม่"}
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
        width={500}
        style={{ top: 20 }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOk}
          preserve={false}
        >
          <Form.Item
            name="title"
            label="ชื่อ Chapter"
            rules={[{ required: true, message: "กรุณากรอกชื่อ Chapter" }]}
          >
            <Input placeholder="ใส่ชื่อ Chapter" />
          </Form.Item>

          <Form.Item
            name="order"
            label="ลำดับ"
            rules={[
              { required: true, message: "กรุณากรอกลำดับ" },
              { type: "number", min: 1, message: "ลำดับต้องมากกว่า 0" },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="ลำดับของ Chapter"
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
