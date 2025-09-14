"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

export default function PostCategoryModal({
  open,
  editing,
  onCancel,
  onSubmit,
  loading,
}) {
  const [form] = Form.useForm();

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (e) {
      console.error("Form validation error:", e);
    }
  };

  // Handle modal close
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Set form data when editing
  useEffect(() => {
    if (open && editing) {
      const formData = {
        name: editing.name,
        description: editing.description,
        isActive: editing.isActive,
      };

      setTimeout(() => {
        form.setFieldsValue(formData);
      }, 100);
    } else if (open && !editing) {
      form.resetFields();
    }
  }, [open, editing, form]);

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>
            {editing ? "แก้ไขหมวดหมู่โพสต์" : "สร้างหมวดหมู่โพสต์ใหม่"}
          </Text>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
      
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="ชื่อหมวดหมู่"
          rules={[
            { required: true, message: "กรุณากรอกชื่อหมวดหมู่" },
            { min: 2, message: "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร" },
            { max: 100, message: "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร" },
          ]}
        >
          <Input 
            placeholder="ใส่ชื่อหมวดหมู่" 
            prefix={<TagOutlined style={{ color: "#8c8c8c" }} />}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="รายละเอียด"
          rules={[
            { max: 500, message: "รายละเอียดต้องไม่เกิน 500 ตัวอักษร" },
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="รายละเอียดหมวดหมู่โพสต์ (ไม่บังคับ)"
            showCount
            maxLength={500}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
          <Checkbox disabled={loading}>เปิดใช้งาน</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={editing ? <EditOutlined /> : <PlusOutlined />}
              style={{ borderRadius: "6px" }}
              loading={loading}
            >
              {editing ? "อัพเดท" : "สร้าง"}
            </Button>
            <Button 
              onClick={handleCancel} 
              style={{ borderRadius: "6px" }}
              disabled={loading}
            >
              ยกเลิก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
