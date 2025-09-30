"use client";
import React from "react";
import { Modal, Form, Input, Select, Button, Typography, Space } from "antd";
import { EditOutlined, TruckOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

export default function ShippingModal({
  open,
  onClose,
  onSubmit,
  loading,
  shipment,
}) {
  const [form] = Form.useForm();

  // Set form values when shipment changes
  React.useEffect(() => {
    if (shipment && open) {
      form.setFieldsValue({
        shippingMethod: shipment.shippingMethod || "PENDING",
        status: shipment.status,
        trackingNumber: shipment.trackingNumber || "",
        notes: shipment.notes || "",
      });
    }
  }, [shipment, open, form]);

  const handleSubmit = async (values) => {
    const success = await onSubmit(values);
    if (success) {
      form.resetFields();
      onClose();
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <Text strong>
            อัพเดทการจัดส่ง #{shipment?.orderId?.slice(-8) || "..."}
          </Text>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: "20px" }}
      >
        {/* Shipping Company */}
        <Form.Item
          label={
            <Space>
              <TruckOutlined />
              <Text strong>บริษัทขนส่ง</Text>
            </Space>
          }
          name="shippingMethod"
          rules={[
            {
              required: true,
              message: "กรุณาเลือกบริษัทขนส่ง",
            },
          ]}
        >
          <Select
            placeholder="เลือกบริษัทขนส่ง"
            size="large"
            disabled={loading}
          >
            <Option value="PENDING">รอเลือก</Option>
            <Option value="KERRY">Kerry Express</Option>
            <Option value="THAILAND_POST">ไปรษณีย์ไทย</Option>
            <Option value="JT_EXPRESS">J&T Express</Option>
            <Option value="FLASH_EXPRESS">Flash Express</Option>
            <Option value="NINJA_VAN">Ninja Van</Option>
          </Select>
        </Form.Item>

        {/* Status */}
        <Form.Item
          label={<Text strong>สถานะการจัดส่ง</Text>}
          name="status"
          rules={[
            {
              required: true,
              message: "กรุณาเลือกสถานะ",
            },
          ]}
        >
          <Select placeholder="เลือกสถานะ" size="large" disabled={loading}>
            <Option value="PENDING">รอดำเนินการ</Option>
            <Option value="PROCESSING">กำลังเตรียม</Option>
            <Option value="SHIPPED">จัดส่งแล้ว</Option>
            <Option value="DELIVERED">ส่งถึงแล้ว</Option>
            <Option value="CANCELLED">ยกเลิก</Option>
          </Select>
        </Form.Item>

        {/* Tracking Number */}
        <Form.Item
          label={<Text strong>เลขติดตาม</Text>}
          name="trackingNumber"
          rules={[
            {
              pattern: /^[A-Za-z0-9-_]*$/,
              message: "เลขติดตามต้องเป็นตัวอักษร ตัวเลข หรือ - _ เท่านั้น",
            },
          ]}
        >
          <Input
            placeholder="กรอกเลขติดตาม (หากมี)"
            size="large"
            maxLength={50}
            disabled={loading}
          />
        </Form.Item>

        {/* Notes */}
        <Form.Item label={<Text strong>หมายเหตุ</Text>} name="notes">
          <TextArea
            placeholder="หมายเหตุเพิ่มเติม (หากมี)"
            rows={4}
            maxLength={500}
            showCount
            disabled={loading}
          />
        </Form.Item>

        {/* Submit Buttons */}
        <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel} size="large" disabled={loading}>
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              อัพเดท
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
