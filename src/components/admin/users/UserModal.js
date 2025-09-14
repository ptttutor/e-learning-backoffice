import { Modal, Form, Input, Select, Upload, Avatar, Row, Col, Space, message } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Option } = Select;

export default function UserModal({ open, editing, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          name: editing.name || "",
          email: editing.email || "",
          role: editing.role || "STUDENT",
          lineId: editing.lineId || "",
        });
        setImageUrl(editing.image || "");
      } else {
        form.resetFields();
        setImageUrl("");
      }
    }
  }, [open, editing, form]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const userData = {
        ...values,
        image: imageUrl,
      };

      await onSubmit(userData);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      // Handle successful upload
      const imageUrl = info.file.response?.data?.url || info.file.response?.url;
      if (imageUrl) {
        setImageUrl(imageUrl);
      }
    }
  };

  // Custom upload function for Vercel Blob
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'general'); // User profile images

      const response = await fetch('/api/upload-blob', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result, file);
      } else {
        onError(new Error(result.error || 'Upload failed'));
      }
    } catch (error) {
      onError(error);
    }
  };

  // Upload props for image
  const uploadProps = {
    name: 'file',
    customRequest: customUpload,
    showUploadList: false,
    onChange: handleImageUpload,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('ขนาดไฟล์ต้องไม่เกิน 5MB!');
        return false;
      }
      return true;
    },
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText={editing ? "บันทึกการแก้ไข" : "สร้างผู้ใช้"}
      cancelText="ยกเลิก"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: "24px" }}
      >
        {/* Profile Image */}
        <Form.Item label="รูปโปรไฟล์">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar
              size={64}
              src={imageUrl && imageUrl.trim() ? imageUrl : null}
              icon={<UserOutlined />}
              style={{
                backgroundColor: imageUrl && imageUrl.trim() ? "transparent" : "#1890ff",
              }}
            />
            <Upload {...uploadProps}>
              <div style={{ cursor: "pointer", color: "#1890ff" }}>
                เปลี่ยนรูปภาพ
              </div>
            </Upload>
          </div>
        </Form.Item>

        <Row gutter={16}>
          {/* Name */}
          <Col span={12}>
            <Form.Item
              name="name"
              label="ชื่อผู้ใช้"
              rules={[
                { required: true, message: "กรุณากรอกชื่อผู้ใช้" },
                { min: 2, message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร" },
              ]}
            >
              <Input placeholder="กรอกชื่อผู้ใช้" />
            </Form.Item>
          </Col>

          {/* Role */}
          <Col span={12}>
            <Form.Item
              name="role"
              label="บทบาท"
              rules={[{ required: true, message: "กรุณาเลือกบทบาท" }]}
            >
              <Select placeholder="เลือกบทบาท">
                <Option value="STUDENT">นักเรียน</Option>
                <Option value="INSTRUCTOR">ผู้สอน</Option>
                <Option value="ADMIN">ผู้ดูแลระบบ</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Email */}
        <Form.Item
          name="email"
          label="อีเมล"
          rules={[
            { required: true, message: "กรุณากรอกอีเมล" },
            { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
          ]}
        >
          <Input placeholder="กรอกที่อยู่อีเมล" />
        </Form.Item>

        <Row gutter={16}>
          {/* LINE User ID */}
          <Col span={24}>
            <Form.Item
              name="lineId"
              label="LINE User ID"
            >
              <Input placeholder="U1234567890abcdef..." />
            </Form.Item>
          </Col>
        </Row>

        {/* Password (only for new users) */}
        {!editing && (
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่าน" },
              { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
            ]}
          >
            <Input.Password placeholder="กรอกรหัสผ่าน" />
          </Form.Item>
        )}
      </Form>

      {editing && (
        <div style={{ 
          marginTop: "16px", 
          padding: "12px", 
          background: "#fff7e6", 
          borderRadius: "6px",
          border: "1px solid #ffd591"
        }}>
          <div style={{ fontSize: "12px", color: "#d48806" }}>
            <strong>หมายเหตุ:</strong> การแก้ไขข้อมูลผู้ใช้จะมีผลทันที
          </div>
        </div>
      )}
    </Modal>
  );
}
