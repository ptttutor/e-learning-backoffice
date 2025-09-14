"use client";
import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

export default function ContentModal({
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
          <Text strong>{editing ? "แก้ไขเนื้อหา" : "สร้างเนื้อหาใหม่"}</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
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
          label="ชื่อเนื้อหา"
          rules={[{ required: true, message: "กรุณากรอกชื่อเนื้อหา" }]}
        >
          <Input placeholder="ใส่ชื่อเนื้อหา" />
        </Form.Item>

        <Form.Item
          name="contentType"
          label="ประเภท"
          rules={[{ required: true, message: "กรุณาเลือกประเภทเนื้อหา" }]}
        >
          <Select placeholder="เลือกประเภทเนื้อหา">
            <Option value="VIDEO">
              <Space>
                <PlayCircleOutlined style={{ color: "#ff4d4f" }} />
                วิดีโอ
              </Space>
            </Option>
            <Option value="PDF">
              <Space>
                <FilePdfOutlined style={{ color: "#fa541c" }} />
                PDF
              </Space>
            </Option>
            <Option value="LINK">
              <Space>
                <LinkOutlined style={{ color: "#1890ff" }} />
                ลิงก์
              </Space>
            </Option>
            <Option value="QUIZ">
              <Space>
                <QuestionCircleOutlined style={{ color: "#52c41a" }} />
                Quiz
              </Space>
            </Option>
            <Option value="ASSIGNMENT">
              <Space>
                <FileOutlined style={{ color: "#722ed1" }} />
                Assignment
              </Space>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="contentUrl"
          label="URL/ไฟล์"
          rules={[{ required: true, message: "กรุณากรอก URL หรือไฟล์" }]}
        >
          <Input placeholder="ใส่ URL หรือ path ของไฟล์" />
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
            placeholder="ลำดับของเนื้อหา"
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
