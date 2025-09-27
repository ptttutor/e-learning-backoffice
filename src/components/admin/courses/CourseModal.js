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
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  UserOutlined,
  TagOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { getSubjectOptions } from "@/lib/constants";
import { uploadDiagnostics } from "@/lib/upload-diagnostics";
import { useMessage } from "@/hooks/useAntdApp";

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
  submitting = false,
}) {
  const [form] = Form.useForm();
  const message = useMessage();
  const [uploading, setUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  // Handle cover image upload
  const handleCoverUpload = async (file) => {
    const monitor = uploadDiagnostics.createPerformanceMonitor();
    const errorHandler = uploadDiagnostics.createErrorHandler('CourseModal', {
      component: 'CourseModal',
      field: 'coverImageUrl',
      fileType: 'cover'
    });

    try {
      // Check file compatibility first
      const compatibilityCheck = uploadDiagnostics.checkFileCompatibility(file);
      if (!compatibilityCheck.compatible) {
        throw new Error(compatibilityCheck.issues.join(', '));
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover");

      console.log('CourseModal Upload starting:', {
        fileName: file.name,
        fileSize: file.size,
        component: 'CourseModal'
      });

      const response = await fetch("/api/upload-blob", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        monitor.end();
        console.log('CourseModal Upload success:', {
          url: result.data.url,
          compressionInfo: result.data.compressionInfo,
          performance: monitor.getMetrics()
        });

        setCoverImageUrl(result.data.url);
        form.setFieldsValue({
          coverImageUrl: result.data.url,
          coverPublicId: result.data.pathname,
        });
        message.success(`อัพโหลดรูปปกสำเร็จ${result.data.compressionInfo?.wasCompressed ? ' (ถูกบีบอัดเพื่อคุณภาพที่เหมาะสม)' : ''}`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('CourseModal Upload error:', error);
      const handledError = errorHandler(error);
      message.error(`เกิดข้อผิดพลาดในการอัพโหลด: ${handledError.userMessage}`);
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
        discountPrice: values.discountPrice ? parseFloat(values.discountPrice) : null,
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
        discountPrice: editing.discountPrice,
        sampleVideo: editing.sampleVideo,
        status: editing.status,
        instructorId: editing.instructorId,
        categoryId: editing.categoryId,
        subject: editing.subject,
        coverImageUrl: editing.coverImageUrl,
        coverPublicId: editing.coverPublicId,
        isPhysical: editing.isPhysical,
        weight: editing.weight,
        dimensions: editing.dimensions,
        isRecommended: editing.isRecommended ?? false,
        accessDuration: editing.accessDuration,
        accessHours: editing.accessHours,
      };
        {/* Access Duration */}
        <Form.Item name="accessDuration" label="จำนวนวันที่เรียนได้ (accessDuration)">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="60" />
        </Form.Item>

        {/* Access Hours */}
        <Form.Item name="accessHours" label="จำนวนชั่วโมงที่เรียนได้ (accessHours)">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="120" />
        </Form.Item>

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
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Access Duration */}
        <Form.Item name="accessDuration" label="จำนวนวันที่เรียนได้ (accessDuration)">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="60" />
        </Form.Item>

        {/* Access Hours */}
        <Form.Item name="accessHours" label="จำนวนชั่วโมงที่เรียนได้ (accessHours)">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="120" />
        </Form.Item>
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

        <Form.Item name="discountPrice" label="ราคาหลังส่วนลด">
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

        <Form.Item name="sampleVideo" label="วิดีโอตัวอย่าง">
          <Input placeholder="URL ของวิดีโอตัวอย่าง (เช่น YouTube, Vimeo)" />
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

        <Form.Item name="subject" label="วิชา">
          <Select
            placeholder="เลือกวิชา"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {getSubjectOptions().map((subject) => (
              <Option key={subject.value} value={subject.value}>
                <Space>
                  <BookOutlined style={{ color: "#8c8c8c" }} />
                  {subject.label}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Recommended Course Section */}
        <Form.Item name="isRecommended" valuePropName="checked">
          <Checkbox>คอร์สแนะนำ (Recommended)</Checkbox>
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
              loading={submitting}
              disabled={submitting || uploading}
            >
              {submitting 
                ? (editing ? "กำลังอัพเดท..." : "กำลังสร้าง...") 
                : (editing ? "อัพเดท" : "สร้าง")
              }
            </Button>
            <Button 
              onClick={handleCancel} 
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