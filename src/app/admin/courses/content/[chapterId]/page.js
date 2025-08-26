"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message } from "antd";
import { useParams } from "next/navigation";

const { Option } = Select;

export default function AdminContentPage() {
  const { chapterId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Fetch contents
  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contents?chapterId=${chapterId}`);
      const data = await res.json();
      setContents(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลเนื้อหาไม่สำเร็จ");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (chapterId) fetchContents();
  }, [chapterId]);

  // Create or update content
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editing) {
        res = await fetch(`/api/admin/contents/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch(`/api/admin/contents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, chapterId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(editing ? "แก้ไขเนื้อหาสำเร็จ" : "สร้างเนื้อหาสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchContents();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      // validation error
    }
  };

  // Delete content
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "ยืนยันการลบเนื้อหา?",
      onOk: async () => {
        const res = await fetch(`/api/admin/contents/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          message.success("ลบเนื้อหาสำเร็จ");
          fetchContents();
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
    { title: "ชื่อเนื้อหา", dataIndex: "title" },
    { title: "ประเภท", dataIndex: "contentType" },
    { title: "URL/ไฟล์", dataIndex: "contentUrl" },
    { title: "ลำดับ", dataIndex: "order" },
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
      <h1>เนื้อหาใน Chapter</h1>
      <Button type="primary" onClick={() => openModal(null)} style={{ marginBottom: 16 }}>
        สร้างเนื้อหาใหม่
      </Button>
      <Table
        columns={columns}
        dataSource={contents}
        rowKey="id"
        loading={loading}
        bordered
      />
      <Modal
        open={modalOpen}
        title={editing ? "แก้ไขเนื้อหา" : "สร้างเนื้อหาใหม่"}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        onOk={handleOk}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="ชื่อเนื้อหา" rules={[{ required: true, message: "กรุณากรอกชื่อเนื้อหา" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contentType" label="ประเภท" rules={[{ required: true }]}> 
            <Select>
              <Option value="VIDEO">วิดีโอ</Option>
              <Option value="PDF">PDF</Option>
              <Option value="LINK">ลิงก์</Option>
              <Option value="QUIZ">Quiz</Option>
              <Option value="ASSIGNMENT">Assignment</Option>
            </Select>
          </Form.Item>
          <Form.Item name="contentUrl" label="URL/ไฟล์" rules={[{ required: true, message: "กรุณากรอก URL หรือไฟล์" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="order" label="ลำดับ" rules={[{ required: true, type: 'number', message: "กรุณากรอกลำดับ" }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
