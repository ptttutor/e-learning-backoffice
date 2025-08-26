"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message } from "antd";

const { Option } = Select;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

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

  useEffect(() => {
    fetchCourses();
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
        const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
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

  const columns = [
    { title: "ชื่อคอร์ส", dataIndex: "title" },
    { title: "ราคา", dataIndex: "price", render: (v) => v || 0 },
    { title: "สถานะ", dataIndex: "status" },
    { title: "ผู้สอน", dataIndex: ["instructor", "name"] },
    { title: "หมวดหมู่", dataIndex: ["category", "name"] },
    {
      title: "การจัดการ",
      render: (_, record) => (
        <Space>
          <Button onClick={() => openModal(record)}>แก้ไข</Button>
          <Button danger onClick={() => handleDelete(record.id)}>ลบ</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>จัดการคอร์สเรียน</h1>
      <Button type="primary" onClick={() => openModal(null)} style={{ marginBottom: 16 }}>
        สร้างคอร์สใหม่
      </Button>
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        bordered
      />
      <Modal
        open={modalOpen}
        title={editing ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        onOk={handleOk}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="ชื่อคอร์ส" rules={[{ required: true, message: "กรุณากรอกชื่อคอร์ส" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="รายละเอียด">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="ราคา">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="สถานะ" rules={[{ required: true }]}> 
            <Select>
              <Option value="DRAFT">ฉบับร่าง</Option>
              <Option value="PUBLISHED">เผยแพร่</Option>
              <Option value="CLOSED">ปิด</Option>
            </Select>
          </Form.Item>
          <Form.Item name="instructorId" label="รหัสผู้สอน" rules={[{ required: true, message: "กรุณากรอกรหัสผู้สอน" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="รหัสหมวดหมู่">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
