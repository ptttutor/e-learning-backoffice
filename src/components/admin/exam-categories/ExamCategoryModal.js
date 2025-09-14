"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

export default function ExamCategoryModal({
  open,
  editing,
  initialData,
  onCancel,
  onSubmit,
  loading,
}) {
  const [form] = Form.useForm();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (editing && initialData) {
        // Edit mode - populate form with existing data
        form.setFieldsValue({
          name: initialData.name,
          description: initialData.description || "",
          isActive: initialData.isActive ?? true,
        });
      } else {
        // Create mode - reset form with default values
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
        });
      }
    } else {
      // Modal closed - reset form
      form.resetFields();
    }
  }, [open, editing, initialData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          {editing ? "แก้ไขหมวดหมู่ข้อสอบ" : "เพิ่มหมวดหมู่ข้อสอบใหม่"}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          ยกเลิก
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          {editing ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          name="name"
          label="ชื่อหมวดหมู่"
          rules={[
            {
              required: true,
              message: "กรุณาระบุชื่อหมวดหมู่",
            },
            {
              min: 2,
              message: "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร",
            },
            {
              max: 100,
              message: "ชื่อหมวดหมู่ต้องมีไม่เกิน 100 ตัวอักษร",
            },
          ]}
        >
          <Input
            placeholder="เช่น วิทยาศาสตร์, คณิตศาสตร์, ภาษาอังกฤษ"
            maxLength={100}
            showCount
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="คำอธิบาย"
          rules={[
            {
              max: 500,
              message: "คำอธิบายต้องมีไม่เกิน 500 ตัวอักษร",
            },
          ]}
        >
          <TextArea
            placeholder="คำอธิบายเกี่ยวกับหมวดหมู่ข้อสอบนี้"
            rows={4}
            maxLength={500}
            showCount
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="สถานะ"
          valuePropName="checked"
          extra="เปิดใช้งานหมวดหมู่นี้เพื่อให้สามารถสร้างข้อสอบได้"
        >
          <Switch
            checkedChildren="เปิดใช้งาน"
            unCheckedChildren="ปิดใช้งาน"
            disabled={loading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}