"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Upload,
  Image,
  Typography,
  InputNumber,
  Checkbox,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function EbookModal({
  open,
  editing,
  onCancel,
  onSubmit,
  categories,
}) {
  const [form] = Form.useForm();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Handle file upload
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('type', type);

    try {
      if (type === 'ebook') {
        setUploadingFile(true);
      } else if (type === 'cover') {
        setUploadingCover(true);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const result = await response.json();
      
      if (result.success) {
        if (type === 'ebook') {
          form.setFieldsValue({
            fileUrl: result.url,
            fileSize: file.size
          });
          message.success('อัปโหลดไฟล์ eBook สำเร็จ');
        } else if (type === 'cover') {
          form.setFieldsValue({
            coverImageUrl: result.url
          });
          message.success('อัปโหลดรูปปกสำเร็จ');
        }
      } else {
        message.error('การอัปโหลดไฟล์ล้มเหลว: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      if (type === 'ebook') {
        setUploadingFile(false);
      } else if (type === 'cover') {
        setUploadingCover(false);
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    const submitData = {
      ...values,
      publishedAt: values.publishedAt ? new Date(values.publishedAt) : null
    };
    await onSubmit(submitData);
  };

  // Handle modal close
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Set form data when editing
  useEffect(() => {
    if (open && editing) {
      form.setFieldsValue({
        ...editing,
        publishedAt: editing.publishedAt ? new Date(editing.publishedAt).toISOString().slice(0, 16) : null
      });
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
            {editing ? "แก้ไข eBook" : "เพิ่ม eBook ใหม่"}
          </Text>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={900}
      style={{ top: 20 }}
      destroyOnClose
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        initialValues={{
          language: 'th',
          format: 'PDF',
          isActive: true,
          isPhysical: false,
          isFeatured: false,
          price: 0,
          discountPrice: 0,
          pageCount: 0,
          weight: 0
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="title"
            label={
              <Space size={6}>
                <BookOutlined style={{ color: "#8c8c8c" }} />
                <Text>ชื่อหนังสือ</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณากรอกชื่อหนังสือ" },
              { min: 2, message: "ชื่อหนังสือต้องมีอย่างน้อย 2 ตัวอักษร" }
            ]}
          >
            <Input placeholder="ใส่ชื่อหนังสือ" />
          </Form.Item>

          <Form.Item
            name="author"
            label={
              <Space size={6}>
                <UserOutlined style={{ color: "#8c8c8c" }} />
                <Text>ผู้เขียน</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณากรอกชื่อผู้เขียน" }
            ]}
          >
            <Input placeholder="ใส่ชื่อผู้เขียน" />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label={
            <Space size={6}>
              <FileTextOutlined style={{ color: "#8c8c8c" }} />
              <Text>คำอธิบาย</Text>
            </Space>
          }
        >
          <TextArea rows={4} placeholder="ใส่คำอธิบายหนังสือ" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="isbn"
            label="ISBN"
          >
            <Input placeholder="978-0123456789" />
          </Form.Item>

          <Form.Item
            name="pageCount"
            label="จำนวนหน้า"
          >
            <InputNumber 
              placeholder="250" 
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label={
              <Space size={6}>
                <DollarOutlined style={{ color: "#8c8c8c" }} />
                <Text>ราคา</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณากรอกราคา" }
            ]}
          >
            <InputNumber 
              placeholder="0.00" 
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              formatter={value => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/฿\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="discountPrice"
            label="ราคาลด"
          >
            <InputNumber 
              placeholder="0.00" 
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              formatter={value => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/฿\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="categoryId"
            label={
              <Space size={6}>
                <TagOutlined style={{ color: "#8c8c8c" }} />
                <Text>หมวดหมู่</Text>
              </Space>
            }
          >
            <Select placeholder="เลือกหมวดหมู่">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="format"
            label="รูปแบบ"
          >
            <Select>
              <Option value="PDF">PDF</Option>
              <Option value="EPUB">EPUB</Option>
              <Option value="MOBI">MOBI</Option>
            </Select>
          </Form.Item>
        </div>

        {/* File Upload Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="fileUrl"
            label="ไฟล์ eBook"
          >
            <div>
              <Upload
                accept=".pdf,.epub,.mobi"
                beforeUpload={(file) => {
                  handleFileUpload(file, 'ebook');
                  return false;
                }}
                showUploadList={false}
                disabled={uploadingFile}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploadingFile}
                  style={{ width: '100%' }}
                >
                  {uploadingFile ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์ eBook'}
                </Button>
              </Upload>
              <Form.Item name="fileSize" hidden>
                <Input />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="coverImageUrl"
            label="รูปปก"
          >
            <div>
              <Upload
                accept="image/*"
                beforeUpload={(file) => {
                  handleFileUpload(file, 'cover');
                  return false;
                }}
                showUploadList={false}
                disabled={uploadingCover}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploadingCover}
                  style={{ width: '100%' }}
                >
                  {uploadingCover ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปปก'}
                </Button>
              </Upload>
              {form.getFieldValue('coverImageUrl') && (
                <div style={{ marginTop: '8px' }}>
                  <Image 
                    src={form.getFieldValue('coverImageUrl')} 
                    alt="Cover preview"
                    width={60}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
          <Form.Item name="isPhysical" valuePropName="checked">
            <Checkbox>หนังสือกายภาพ</Checkbox>
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>เปิดใช้งาน</Checkbox>
          </Form.Item>
          <Form.Item name="isFeatured" valuePropName="checked">
            <Checkbox>แนะนำ</Checkbox>
          </Form.Item>
        </div>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isPhysical !== currentValues.isPhysical}>
          {({ getFieldValue }) =>
            getFieldValue('isPhysical') ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name="weight"
                  label="น้ำหนัก (kg)"
                >
                  <InputNumber 
                    placeholder="0.5" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>

                <Form.Item
                  name="dimensions"
                  label="ขนาด"
                >
                  <Input placeholder="21x29.7x2 cm" />
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
            <Button
              onClick={handleCancel}
              style={{ borderRadius: "6px" }}
            >
              ยกเลิก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}