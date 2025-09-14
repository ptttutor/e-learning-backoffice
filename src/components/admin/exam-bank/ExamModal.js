"use client";
import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  FileOutlined,
  FolderOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export default function ExamModal({
  open,
  editing,
  categories,
  onCancel,
  onSubmit,
  submitting = false,
}) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          title: editing.title,
          description: editing.description,
          categoryId: editing.categoryId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>
            {editing ? "แก้ไขข้อสอบ" : "เพิ่มข้อสอบใหม่"}
          </Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
      
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label={
            <Space size={6}>
              <FileOutlined style={{ color: "#8c8c8c" }} />
              <Text>ชื่อข้อสอบ</Text>
            </Space>
          }
          rules={[
            { required: true, message: "กรุณาระบุชื่อข้อสอบ" },
            { min: 2, message: "ชื่อข้อสอบต้องมีอย่างน้อย 2 ตัวอักษร" },
            { max: 255, message: "ชื่อข้อสอบต้องไม่เกิน 255 ตัวอักษร" },
          ]}
        >
          <Input
            placeholder="เช่น ข้อสอบฟิสิกส์ ม.6 เทอม 1"
            style={{ borderRadius: "6px" }}
            disabled={submitting}
          />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label={
            <Space size={6}>
              <FolderOutlined style={{ color: "#8c8c8c" }} />
              <Text>หมวดหมู่</Text>
            </Space>
          }
        >
          <Select
            placeholder="เลือกหมวดหมู่"
            allowClear
            style={{ borderRadius: "6px" }}
            disabled={submitting}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
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
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับข้อสอบนี้"
            style={{ borderRadius: "6px" }}
            disabled={submitting}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={editing ? <EditOutlined /> : <PlusOutlined />}
              style={{ borderRadius: "6px" }}
              loading={submitting}
              disabled={submitting}
            >
              {editing ? "อัพเดท" : "สร้าง"}
            </Button>
            <Button
              onClick={onCancel}
              style={{ borderRadius: "6px" }}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
