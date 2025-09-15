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
  Popconfirm,
  Progress,
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
  DeleteOutlined,
  CheckCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useMessage } from "@/hooks/useAntdApp";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function EbookModal({
  open,
  editing,
  onCancel,
  onSubmit,
  categories,
  submitting = false,
}) {
  const [form] = Form.useForm();
  const message = useMessage();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  // Handle cover image upload (simplified like CourseModal)
  const handleCoverUpload = async (file) => {
    console.log('🎯 Starting cover upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      setUploadingCover(true);
      setUploadProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover");

      console.log('📤 Sending upload request...');

      const response = await fetch("/api/upload-blob", {
        method: "POST",
        body: formData,
      });

      console.log('📥 Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload request failed:', errorText);
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upload result:', result);
      
      if (result.success) {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setCoverImageUrl(result.data.url);
          form.setFieldsValue({
            coverImageUrl: result.data.url,
          });
          message.success(`อัพโหลดรูปปกสำเร็จ`);
          console.log('✅ Form field updated with URL:', result.data.url);
          setUploadProgress(0);
        }, 500);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      message.error(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setUploadingCover(false);
    }
    
    return false; // Prevent default upload behavior
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

  // Handle file removal
  const handleFileRemoval = (type) => {
    if (type === 'cover') {
      setCoverImageUrl(null);
      form.setFieldsValue({ coverImageUrl: null });
    }
    // Add more file types if needed
  };

  // Set form data when editing
  useEffect(() => {
    if (open && editing) {
      form.setFieldsValue({
        ...editing,
        publishedAt: editing.publishedAt ? new Date(editing.publishedAt).toISOString().slice(0, 16) : null
      });
      setCoverImageUrl(editing.coverImageUrl || "");
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
          publishedYear: new Date().getFullYear(),
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
            name="publishedYear"
            label="ปีที่ตีพิมพ์"
          >
            <InputNumber 
              placeholder="2025" 
              style={{ width: '100%' }}
              min={1900}
              max={new Date().getFullYear() + 10}
            />
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

        {/* Cover Image Upload Section */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.coverImageUrl !== currentValues.coverImageUrl}>
          {({ getFieldValue }) => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <Form.Item
                name="coverImageUrl"
                label="รูปปก"
              >
                <div>
                  {/* Current file status */}
                  {getFieldValue('coverImageUrl') ? (
                    <div style={{
                      backgroundColor: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <div>
                          <Text strong style={{ fontSize: '14px' }}>มีรูปปกแล้ว</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {getFieldValue('coverImageUrl').split('/').pop()}
                          </Text>
                        </div>
                      </div>
                      <Button 
                        type="text" 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleFileRemoval('cover')}
                        style={{ borderRadius: '4px' }}
                      >
                        ลบ
                      </Button>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#fafafa',
                      border: '1px dashed #d9d9d9',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        ยังไม่มีรูปปก
                      </Text>
                    </div>
                  )}

                  {/* Upload button */}
                  <Upload
                    accept="image/*"
                    beforeUpload={handleCoverUpload}
                    showUploadList={false}
                    disabled={uploadingCover}
                  >
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={uploadingCover}
                      style={{ width: '100%' }}
                      type={coverImageUrl || getFieldValue('coverImageUrl') ? 'default' : 'dashed'}
                    >
                      {uploadingCover ? 'กำลังอัปโหลด...' : 
                       (coverImageUrl || getFieldValue('coverImageUrl')) ? 'เปลี่ยนรูปปก' : 'อัปโหลดรูปปก'}
                    </Button>
                  </Upload>

                  {/* Upload Progress */}
                  {uploadingCover && uploadProgress > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <Progress 
                        percent={Math.round(uploadProgress)} 
                        status="active"
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        format={(percent) => `${percent}%`}
                        size="small"
                      />
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center', marginTop: 4 }}>
                        กำลังอัปโหลดรูปปก... กรุณารอสักครู่
                      </Text>
                    </div>
                  )}
                  
                  {/* Image preview */}
                  {(coverImageUrl || getFieldValue('coverImageUrl')) && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <Text style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
                        ตัวอย่างรูปปก
                      </Text>
                      <Image 
                        src={coverImageUrl || getFieldValue('coverImageUrl')} 
                        alt="Cover preview"
                        width={80}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '6px', border: '1px solid #d9d9d9' }}
                      />
                    </div>
                  )}
                </div>
              </Form.Item>
            </div>
          )}
        </Form.Item>

        {/* File Upload Note */}
        <div style={{ 
          backgroundColor: '#f6f8fa', 
          border: '1px solid #e1e4e8', 
          borderRadius: '8px', 
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            <BulbOutlined /> <strong>หมายเหตุ:</strong> หลังจากสร้าง eBook แล้ว สามารถอัปโหลดไฟล์เนื้อหาได้ที่ปุ่ม &quot;จัดการไฟล์&quot; ในตาราง
          </Text>
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
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 
                (editing ? "กำลังอัพเดท..." : "กำลังสร้าง...") : 
                (editing ? "อัพเดท" : "สร้าง")
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