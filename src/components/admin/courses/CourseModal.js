"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Upload,
  Image,
  Typography,
  Tag,
  message,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  UserOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

export default function CourseModal({
  open,
  editing,
  onCancel,
  onSubmit,
  instructors,
  categories,
  instLoading,
  catLoading,
}) {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  // Handle cover image upload
  const handleCoverUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setCoverImageUrl(result.url);
        form.setFieldsValue({
          coverImageUrl: result.url,
          coverPublicId: result.public_id,
        });
        message.success("อัพโหลดรูปปกสำเร็จ");
      } else {
        message.error(result.error || "อัพโหลดรูปปกไม่สำเร็จ");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการอัพโหลด");
    }
    setUploading(false);
    return false;
  };

  // Handle cover image removal
  const handleRemoveCover = () => {
    setCoverImageUrl("");
    form.setFieldsValue({
      coverImageUrl: "",
      coverPublicId: "",
    });
    message.success("ลบรูปปกสำเร็จ");
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const courseData = {
        ...values,
        coverImageUrl: coverImageUrl || values.coverImageUrl,
        price: parseFloat(values.price) || 0,
      };
      await onSubmit(courseData);
    } catch (e) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  // Handle modal close
  const handleCancel = () => {
    form.resetFields();
    setCoverImageUrl("");
    onCancel();
  };

  // Set form data when editing
  useEffect(() => {
    if (open && editing) {
      const formData = {
        title: editing.title,
        description: editing.description,
        price: editing.price,
        status: editing.status,
        instructorId: editing.instructorId,
        categoryId: editing.categoryId,
        coverImageUrl: editing.coverImageUrl,
        coverPublicId: editing.coverPublicId,
        isPhysical: editing.isPhysical,
        weight: editing.weight,
        dimensions: editing.dimensions,
      };

      setTimeout(() => {
        form.setFieldsValue(formData);
        setCoverImageUrl(editing.coverImageUrl || "");
      }, 100);
    } else if (open && !editing) {
      form.resetFields();
      setCoverImageUrl("");
    }
  }, [open, editing, form]);

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>{editing ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}</Text>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="ชื่อคอร์ส"
          rules={[{ required: true, message: "กรุณากรอกชื่อคอร์ส" }]}
        >
          <Input placeholder="ใส่ชื่อคอร์ส" />
        </Form.Item>

        <Form.Item name="description" label="รายละเอียด">
          <Input.TextArea rows={3} placeholder="รายละเอียดคอร์ส" />
        </Form.Item>

        <Form.Item name="coverImageUrl" label="รูปปกคอร์ส">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Upload
              beforeUpload={handleCoverUpload}
              showUploadList={false}
              accept="image/*"
              disabled={uploading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
                style={{ borderRadius: "6px" }}
              >
                {uploading ? "กำลังอัพโหลด..." : "อัพโหลดรูปปก"}
              </Button>
            </Upload>
            {coverImageUrl && (
              <div style={{ marginTop: 8 }}>
                <Image
                  src={coverImageUrl}
                  alt="Course Cover Preview"
                  width={200}
                  height={120}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #d9d9d9",
                  }}
                />
                <div style={{ marginTop: 4 }}>
                  <Button
                    size="small"
                    danger
                    type="link"
                    onClick={handleRemoveCover}
                  >
                    ลบรูปปก
                  </Button>
                </div>
              </div>
            )}
          </Space>
        </Form.Item>

        <Form.Item name="price" label="ราคา">
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="0"
            formatter={(value) =>
              `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="สถานะ"
          rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
        >
          <Select placeholder="เลือกสถานะ">
            <Option value="DRAFT">
              <Space>
                <Tag color="default">ฉบับร่าง</Tag>
              </Space>
            </Option>
            <Option value="PUBLISHED">
              <Space>
                <Tag color="success">เผยแพร่</Tag>
              </Space>
            </Option>
            <Option value="CLOSED">
              <Space>
                <Tag color="error">ปิด</Tag>
              </Space>
            </Option>
            <Option value="DELETED">
              <Space>
                <Tag color="red">ถูกลบ</Tag>
              </Space>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="instructorId"
          label="ผู้สอน"
          rules={[{ required: true, message: "กรุณาเลือกผู้สอน" }]}
        >
          <Select
            loading={instLoading}
            placeholder="เลือกผู้สอน"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {instructors.map((instructor) => (
              <Option key={instructor.id} value={instructor.id}>
                <Space>
                  <UserOutlined style={{ color: "#8c8c8c" }} />
                  {instructor.name} ({instructor.email})
                </Space>
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
              <Option key={cat.id} value={cat.id}>
                <Space>
                  <TagOutlined style={{ color: "#8c8c8c" }} />
                  {cat.name}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Physical Product Section */}
        <Form.Item name="isPhysical" valuePropName="checked">
          <Checkbox>สินค้าที่ต้องจัดส่ง (เช่น หนังสือประกอบ, CD, DVD)</Checkbox>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isPhysical !== currentValues.isPhysical}>
          {({ getFieldValue }) =>
            getFieldValue('isPhysical') ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <Form.Item
                  name="weight"
                  label="น้ำหนัก (กรัม)"
                  rules={[{ required: getFieldValue('isPhysical'), message: 'กรุณากรอกน้ำหนัก' }]}
                >
                  <InputNumber 
                    placeholder="500" 
                    style={{ width: '100%' }}
                    min={0}
                    step={1}
                    suffix="กรัม"
                  />
                </Form.Item>

                <Form.Item
                  name="dimensions"
                  label="ขนาด (กว้าง x ยาว x สูง)"
                  rules={[{ required: getFieldValue('isPhysical'), message: 'กรุณากรอกขนาด' }]}
                >
                  <Input 
                    placeholder="เช่น 15 x 21 x 2 (ซม.)" 
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
            ) : null
          }
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={editing ? <EditOutlined /> : <PlusOutlined />}
              style={{ borderRadius: "6px" }}
            >
              {editing ? "อัพเดท" : "สร้าง"}
            </Button>
            <Button onClick={handleCancel} style={{ borderRadius: "6px" }}>
              ยกเลิก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}