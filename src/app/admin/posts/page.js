"use client";
import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Typography,
  Tag,
  Avatar,
  Checkbox,
  DatePicker,
  Image,
  Descriptions,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TagOutlined,
  LinkOutlined,
  PictureOutlined,
  MobileOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [postTypes, setPostTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPosts();
    fetchPostTypes();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostTypes = async () => {
    try {
      const response = await fetch('/api/admin/post-types');
      const data = await response.json();
      setPostTypes(data);
    } catch (error) {
      console.error('Error fetching post types:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดประเภทโพสต์');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingPost ? `/api/admin/posts/${editingPost.id}` : '/api/admin/posts';
      const method = editingPost ? 'PUT' : 'POST';
      
      // Convert publishedAt to proper format if provided
      const submitData = {
        ...values,
        publishedAt: values.publishedAt ? dayjs(values.publishedAt).toISOString() : null
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        message.success(editingPost ? 'อัพเดทโพสต์สำเร็จ' : 'สร้างโพสต์สำเร็จ');
        fetchPosts();
        setModalVisible(false);
        setEditingPost(null);
        form.resetFields();
      } else {
        message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const openModal = (post = null) => {
    setEditingPost(post);
    setModalVisible(true);
    if (post) {
      form.setFieldsValue({
        ...post,
        publishedAt: post.publishedAt ? dayjs(post.publishedAt) : null
      });
    } else {
      form.resetFields();
    }
  };

  const handleDelete = async (id, title) => {
    Modal.confirm({
      title: 'ยืนยันการลบโพสต์?',
      content: `คุณต้องการลบโพสต์ "${title}" ใช่หรือไม่?`,
      okText: 'ลบ',
      cancelText: 'ยกเลิก',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/posts/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            message.success('ลบโพสต์สำเร็จ');
            fetchPosts();
          } else {
            message.error('เกิดข้อผิดพลาดในการลบ');
          }
        } catch (error) {
          console.error('Error deleting post:', error);
          message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      },
    });
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

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

  const columns = [
    {
      title: "โพสต์",
      key: "post",
      render: (_, record) => (
        <Space size={12}>
          <Avatar 
            src={record.imageUrl}
            icon={<FileTextOutlined />} 
            size={50}
            shape="square"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>{record.title}</Text>
              {record.isFeatured && (
                <Tag color="gold" style={{ marginLeft: "8px" }}>
                  <StarOutlined /> แนะนำ
                </Tag>
              )}
            </div>
            {record.excerpt && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.excerpt.length > 80 
                    ? `${record.excerpt.substring(0, 80)}...` 
                    : record.excerpt}
                </Text>
              </div>
            )}
            {record.slug && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  <LinkOutlined style={{ marginRight: "4px" }} />
                  {record.slug}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      width: 350,
    },
    {
      title: "ประเภท",
      key: "postType",
      render: (_, record) => (
        <Space size={8}>
          <TagOutlined style={{ color: "#8c8c8c" }} />
          {record.postType ? (
            <Tag color="blue">{record.postType.name}</Tag>
          ) : (
            <Tag color="default">ไม่ระบุ</Tag>
          )}
        </Space>
      ),
      width: 120,
    },
    {
      title: "ผู้เขียน",
      key: "author",
      render: (_, record) => (
        <Space size={8}>
          <UserOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>
            {record.author?.name || 'ไม่ระบุ'}
          </Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Tag 
          color={isActive ? "success" : "error"}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่เผยแพร่",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id, record.title)}
            style={{ borderRadius: "6px" }}
          >
            ลบ
          </Button>
        </Space>
      ),
      width: 150,
      fixed: "right",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <FileTextOutlined style={{ marginRight: "8px" }} />
            จัดการโพสต์
          </Title>
          <Text type="secondary">จัดการบทความและเนื้อหาต่างๆ</Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ borderRadius: "6px" }}
            size="middle"
          >
            เพิ่มโพสต์ใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          size="middle"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingPost ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>
              {editingPost ? "แก้ไขโพสต์" : "เพิ่มโพสต์ใหม่"}
            </Text>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPost(null);
          form.resetFields();
        }}
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
                icon={editingPost ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editingPost ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingPost(null);
                  form.resetFields();
                }}
                style={{ borderRadius: "6px" }}
              >
                ยกเลิก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}