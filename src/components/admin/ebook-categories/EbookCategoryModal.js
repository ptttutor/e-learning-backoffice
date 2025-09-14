"use client";
import React from "react";
import {
  Modal,
  Form,
  Input,
  Space,
  Button,
  Typography,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

export default function EbookCategoryModal({
  open,
  editing,
  form,
  submitting,
  onSubmit,
  onCancel,
}) {
  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({ name });
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>
            {editing
              ? "แก้ไขหมวดหมู่ eBook"
              : "เพิ่มหมวดหมู่ eBook ใหม่"}
          </Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          isActive: true,
        }}
        preserve={false}
      >
        <Form.Item
          name="name"
          label={
            <Space size={6}>
              <AppstoreOutlined style={{ color: "#8c8c8c" }} />
              <Text>ชื่อหมวดหมู่</Text>
            </Space>
          }
          rules={[
            { required: true, message: "กรุณากรอกชื่อหมวดหมู่" },
            { min: 2, message: "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร" },
            { max: 100, message: "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร" },
          ]}
        >
          <Input
            placeholder="ใส่ชื่อหมวดหมู่"
            onChange={handleNameChange}
            style={{ borderRadius: "6px" }}
            disabled={submitting}
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
            placeholder="ใส่คำอธิบายหมวดหมู่ (ถ้ามี)"
            style={{ borderRadius: "6px" }}
            disabled={submitting}
          />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked">
          <Checkbox disabled={submitting}>เปิดใช้งาน</Checkbox>
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
              {submitting 
                ? (editing ? "กำลังอัพเดท..." : "กำลังสร้าง...") 
                : (editing ? "อัพเดท" : "สร้าง")
              }
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