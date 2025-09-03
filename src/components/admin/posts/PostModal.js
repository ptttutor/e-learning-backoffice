"use client";
import React from "react";
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
} from "@ant-design/icons";
import dayjs from 'dayjs';

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
      destroyOnClose
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
                <Text>URL รูปภาพ (Desktop)</Text>
              </Space>
            }
            rules={[
              { type: 'url', message: "กรุณาใส่ URL ที่ถูกต้อง" }
            ]}
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
                <Text>URL รูปภาพ (Mobile)</Text>
              </Space>
            }
            rules={[
              { type: 'url', message: "กรุณาใส่ URL ที่ถูกต้อง" }
            ]}
          >
            <Input 
              placeholder="https://example.com/mobile-image.jpg"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>
        </div>

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

        {/* Image Preview */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
          prevValues.imageUrl !== currentValues.imageUrl || 
          prevValues.imageUrlMobileMode !== currentValues.imageUrlMobileMode
        }>
          {({ getFieldValue }) => {
            const imageUrl = getFieldValue('imageUrl');
            const mobileImageUrl = getFieldValue('imageUrlMobileMode');
            
            return (imageUrl || mobileImageUrl) ? (
              <Card 
                title={
                  <Space>
                    <PictureOutlined style={{ color: "#1890ff" }} />
                    <Text strong>ตัวอย่างรูปภาพ</Text>
                  </Space>
                }
                size="small" 
                style={{ marginBottom: "16px" }}
              >
                <Space size={16}>
                  {imageUrl && (
                    <div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Desktop</Text>
                      <div>
                        <Image 
                          src={imageUrl} 
                          alt="Desktop preview"
                          width={120}
                          height={80}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      </div>
                    </div>
                  )}
                  {mobileImageUrl && (
                    <div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Mobile</Text>
                      <div>
                        <Image 
                          src={mobileImageUrl} 
                          alt="Mobile preview"
                          width={80}
                          height={80}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            ) : null;
          }}
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
