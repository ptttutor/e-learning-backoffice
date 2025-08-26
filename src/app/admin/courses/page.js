"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Spin } from "antd";

const { Option } = Select;

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
      setInstructors((data.data || []).filter(u => u.role === 'INSTRUCTOR'));
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
          <Button type="link" onClick={() => window.location.href = `/admin/courses/chapter/${record.id}`}>จัดการ Chapter</Button>
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
      {modalOpen && (
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
            <Form.Item name="instructorId" label="ผู้สอน" rules={[{ required: true, message: "กรุณาเลือกผู้สอน" }]}>
              <Select
                loading={instLoading}
                placeholder="เลือกผู้สอน"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {instructors.map((instructor) => (
                  <Option key={instructor.id} value={instructor.id}>
                    {instructor.name} ({instructor.email})
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
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}