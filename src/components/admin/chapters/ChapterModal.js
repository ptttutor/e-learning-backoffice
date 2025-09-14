"use client";
import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function ChapterModal({
  open,
  editing,
  form,
  onCancel,
  onSubmit,
  submitting = false,
}) {
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (e) {
      // validation error
    }
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>
            {editing ? "แก้ไข Chapter" : "สร้าง Chapter ใหม่"}
          </Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
      style={{ top: 20 }}
      
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
          <Input 
            placeholder="ใส่ชื่อ Chapter" 
            prefix={<BookOutlined style={{ color: "#1890ff" }} />}
          />
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
