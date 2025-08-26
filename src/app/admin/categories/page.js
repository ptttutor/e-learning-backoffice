"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message } from "antd";

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
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
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
        message.success(editing ? "แก้ไขหมวดหมู่สำเร็จ" : "สร้างหมวดหมู่สำเร็จ");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchCategories();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      // validation error
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "ยืนยันการลบหมวดหมู่?",
      onOk: async () => {
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          message.success("ลบหมวดหมู่สำเร็จ");
          fetchCategories();
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
    { title: "ชื่อหมวดหมู่", dataIndex: "name" },
    { title: "รายละเอียด", dataIndex: "description" },
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
      <h1>จัดการหมวดหมู่</h1>
      <Button type="primary" onClick={() => openModal(null)} style={{ marginBottom: 16 }}>
        สร้างหมวดหมู่ใหม่
      </Button>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        bordered
      />
      <Modal
        open={modalOpen}
        title={editing ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่ใหม่"}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        onOk={handleOk}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="ชื่อหมวดหมู่" rules={[{ required: true, message: "กรุณากรอกชื่อหมวดหมู่" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="รายละเอียด">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
