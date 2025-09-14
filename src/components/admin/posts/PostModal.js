"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Checkbox,
  DatePicker,
  Image,
  Card,
  Upload,
  Row,
  Col,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  PlusOutlined,
  TagOutlined,
  LinkOutlined,
  CalendarOutlined,
  DesktopOutlined,
  MobileOutlined,
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { uploadDiagnostics } from "@/lib/upload-diagnostics";
import { useMessage } from "@/hooks/useAntdApp";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function PostModal({
  open,
  editing,
  postTypes,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const message = useMessage();
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  React.useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          ...editing,
          publishedAt: editing.publishedAt ? dayjs(editing.publishedAt) : null
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    form.setFieldsValue({
      title,
      slug: generateSlug(title)
    });
  };

  // Upload image to Vercel Blob
  const uploadImage = async (file, isMobile = false) => {
    const monitor = uploadDiagnostics.createPerformanceMonitor();
    const errorHandler = uploadDiagnostics.createErrorHandler('PostModal', {
      component: 'PostModal',
      field: isMobile ? 'imageUrlMobileMode' : 'imageUrl',
      isMobile
    });

    try {
      // Check file compatibility first
      const compatibilityCheck = uploadDiagnostics.checkFileCompatibility(file);
      if (!compatibilityCheck.compatible) {
        throw new Error(compatibilityCheck.issues.join(', '));
      }

      if (isMobile) setUploadingMobile(true);
      else setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'post-image');

      console.log('PostModal Upload starting:', {
        fileName: file.name,
        fileSize: file.size,
        isMobile,
        component: 'PostModal'
      });

      const response = await fetch('/api/upload-blob', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const fieldName = isMobile ? 'imageUrlMobileMode' : 'imageUrl';
        form.setFieldsValue({
          [fieldName]: data.data.url
        });
        
        monitor.end();
        console.log('PostModal Upload success:', {
          url: data.data.url,
          compressionInfo: data.data.compressionInfo,
          performance: monitor.getMetrics(),
          isMobile
        });
        
        message.success(`อัพโหลดรูปภาพ${isMobile ? 'มือถือ' : 'เดสก์ท็อป'}สำเร็จ${data.data.compressionInfo?.wasCompressed ? ' (ถูกบีบอัดเพื่อคุณภาพที่เหมาะสม)' : ''}`);
        return data.data.url;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('PostModal Upload error:', error);
      const handledError = errorHandler(error);
      message.error(`เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ: ${handledError.userMessage}`);
      throw error;
    } finally {
      if (isMobile) setUploadingMobile(false);
      else setUploading(false);
    }
  };

  // Handle file upload
  const handleUpload = (info, isMobile = false) => {
    const { file } = info;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)');
      return false;
    }

    uploadImage(file, isMobile);
    return false; // Prevent default upload
  };

  // Delete image from Cloudinary
  const deleteImage = async (imageUrl, isMobile = false) => {
    try {
      const fieldName = isMobile ? 'imageUrlMobileMode' : 'imageUrl';
      
      // Delete from Vercel Blob
      const response = await fetch(`/api/upload-blob/delete?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        form.setFieldsValue({
          [fieldName]: ''
        });
        message.success(`ลบรูปภาพ${isMobile ? 'มือถือ' : 'เดสก์ท็อป'}สำเร็จ`);
      } else {
        // If can't extract public_id, just clear the field
        form.setFieldsValue({
          [fieldName]: ''
        });
        message.success('ลบรูปภาพสำเร็จ');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('เกิดข้อผิดพลาดในการลบรูปภาพ');
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Convert publishedAt to proper format if provided
      const submitData = {
        ...values,
        publishedAt: values.publishedAt ? dayjs(values.publishedAt).toISOString() : null
      };
      
      await onSubmit(submitData);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>
            {editing ? "แก้ไขโพสต์" : "เพิ่มโพสต์ใหม่"}
          </Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      style={{ top: 20 }}
      
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
          isFeatured: false
        }}
      >
        <Form.Item
          name="title"
          label={
            <Space size={6}>
              <FileTextOutlined style={{ color: "#8c8c8c" }} />
              <Text>หัวข้อ</Text>
            </Space>
          }
          rules={[
            { required: true, message: "กรุณากรอกหัวข้อ" },
            { min: 2, message: "หัวข้อต้องมีอย่างน้อย 2 ตัวอักษร" },
            { max: 255, message: "หัวข้อต้องไม่เกิน 255 ตัวอักษร" }
          ]}
        >
          <Input 
            placeholder="ใส่หัวข้อโพสต์"
            onChange={handleTitleChange}
            style={{ borderRadius: "6px" }}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="postTypeId"
            label={
              <Space size={6}>
                <TagOutlined style={{ color: "#8c8c8c" }} />
                <Text>ประเภทโพสต์</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณาเลือกประเภทโพสต์" }
            ]}
          >
            <Select placeholder="เลือกประเภท">
              {postTypes.map(type => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="slug"
            label={
              <Space size={6}>
                <LinkOutlined style={{ color: "#8c8c8c" }} />
                <Text>URL Slug</Text>
              </Space>
            }
            rules={[
              { pattern: /^[a-z0-9-]+$/, message: "Slug ต้องเป็นตัวอักษรเล็ก ตัวเลข และ - เท่านั้น" }
            ]}
          >
            <Input 
              placeholder="url-slug"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="excerpt"
          label={
            <Space size={6}>
              <FileTextOutlined style={{ color: "#8c8c8c" }} />
              <Text>สรุป</Text>
            </Space>
          }
          rules={[
            { max: 500, message: "สรุปต้องไม่เกิน 500 ตัวอักษร" }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="ใส่สรุปโพสต์"
            style={{ borderRadius: "6px" }}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label={
            <Space size={6}>
              <FileTextOutlined style={{ color: "#8c8c8c" }} />
              <Text>เนื้อหา</Text>
            </Space>
          }
        >
          <TextArea
            rows={8}
            placeholder="ใส่เนื้อหาโพสต์"
            style={{ borderRadius: "6px" }}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="imageUrl"
            label={
              <Space size={6}>
                <DesktopOutlined style={{ color: "#8c8c8c" }} />
                <Text>รูปภาพเดสก์ท็อป</Text>
              </Space>
            }
          >
            <Input 
              placeholder="https://example.com/image.jpg"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="imageUrlMobileMode"
            label={
              <Space size={6}>
                <MobileOutlined style={{ color: "#8c8c8c" }} />
                <Text>รูปภาพมือถือ</Text>
              </Space>
            }
          >
            <Input 
              placeholder="https://example.com/mobile-image.jpg"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>
        </div>

        {/* Image Upload Section */}
        <Card 
          title={
            <Space>
              <PictureOutlined style={{ color: "#1890ff" }} />
              <Text strong>อัพโหลดรูปภาพ</Text>
            </Space>
          }
          size="small" 
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  <DesktopOutlined /> รูปภาพเดสก์ท็อป
                </Text>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.imageUrl !== curr.imageUrl}>
                  {({ getFieldValue }) => {
                    const imageUrl = getFieldValue('imageUrl');
                    return imageUrl ? (
                      <div style={{ marginBottom: '12px' }}>
                        <Image 
                          src={imageUrl} 
                          alt="Desktop preview"
                          width={200}
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: '6px' }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                        <div style={{ marginTop: '8px' }}>
                          <Button 
                            size="small" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => deleteImage(imageUrl, false)}
                          >
                            ลบรูป
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  }}
                </Form.Item>
                <Upload
                  beforeUpload={(file) => handleUpload({ file }, false)}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button 
                    icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                    loading={uploading}
                    style={{ borderRadius: "6px" }}
                  >
                    {uploading ? 'กำลังอัพโหลด...' : 'เลือกรูปภาพ'}
                  </Button>
                </Upload>
              </div>
            </Col>
            
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  <MobileOutlined /> รูปภาพมือถือ
                </Text>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.imageUrlMobileMode !== curr.imageUrlMobileMode}>
                  {({ getFieldValue }) => {
                    const mobileImageUrl = getFieldValue('imageUrlMobileMode');
                    return mobileImageUrl ? (
                      <div style={{ marginBottom: '12px' }}>
                        <Image 
                          src={mobileImageUrl} 
                          alt="Mobile preview"
                          width={120}
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: '6px' }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                        <div style={{ marginTop: '8px' }}>
                          <Button 
                            size="small" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => deleteImage(mobileImageUrl, true)}
                          >
                            ลบรูป
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  }}
                </Form.Item>
                <Upload
                  beforeUpload={(file) => handleUpload({ file }, true)}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button 
                    icon={uploadingMobile ? <LoadingOutlined /> : <UploadOutlined />}
                    loading={uploadingMobile}
                    style={{ borderRadius: "6px" }}
                  >
                    {uploadingMobile ? 'กำลังอัพโหลด...' : 'เลือกรูปภาพ'}
                  </Button>
                </Upload>
              </div>
            </Col>
          </Row>
          
          <Divider style={{ margin: '12px 0' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <PictureOutlined /> รองรับไฟล์: JPG, PNG, WebP (รูปภาพขนาดใหญ่จะถูกบีบอัดอัตโนมัติ)
          </Text>
        </Card>

        <Form.Item
          name="publishedAt"
          label={
            <Space size={6}>
              <CalendarOutlined style={{ color: "#8c8c8c" }} />
              <Text>วันที่เผยแพร่</Text>
            </Space>
          }
        >
          <DatePicker 
            showTime
            placeholder="เลือกวันที่และเวลา"
            style={{ width: '100%', borderRadius: "6px" }}
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>เปิดใช้งาน</Checkbox>
          </Form.Item>
          <Form.Item name="isFeatured" valuePropName="checked">
            <Checkbox>โพสต์แนะนำ</Checkbox>
          </Form.Item>
        </div>

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
              onClick={onCancel}
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
