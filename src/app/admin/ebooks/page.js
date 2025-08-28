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
  Upload,
  Checkbox,
  InputNumber,
  Image,
  Descriptions,
  Spin,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
  StarOutlined,
  UploadOutlined,
  EyeOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEbooks();
    fetchCategories();
  }, []);

  const fetchEbooks = async () => {
    try {
      const response = await fetch('/api/admin/ebooks');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        message.error(`Failed to fetch ebooks: ${errorData.error}`);
        return;
      }
      const data = await response.json();
      setEbooks(data);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/ebook-categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingEbook ? `/api/admin/ebooks/${editingEbook.id}` : '/api/admin/ebooks';
      const method = editingEbook ? 'PUT' : 'POST';
      
      const submitData = {
        ...values,
        publishedAt: values.publishedAt ? new Date(values.publishedAt) : null
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        message.success(editingEbook ? 'อัพเดท eBook สำเร็จ' : 'สร้าง eBook สำเร็จ');
        fetchEbooks();
        setModalVisible(false);
        setEditingEbook(null);
        form.resetFields();
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        message.error(`Failed to save ebook: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving ebook:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const openModal = (ebook = null) => {
    setEditingEbook(ebook);
    setModalVisible(true);
    if (ebook) {
      form.setFieldsValue({
        ...ebook,
        publishedAt: ebook.publishedAt ? new Date(ebook.publishedAt).toISOString().slice(0, 16) : null
      });
    } else {
      form.resetFields();
    }
  };

  const handleDelete = async (id, title) => {
    Modal.confirm({
      title: 'ยืนยันการลบ eBook?',
      content: `คุณต้องการลบ "${title}" ใช่หรือไม่?`,
      okText: 'ลบ',
      cancelText: 'ยกเลิก',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/ebooks/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            message.success('ลบ eBook สำเร็จ');
            fetchEbooks();
          } else {
            message.error('เกิดข้อผิดพลาดในการลบ');
          }
        } catch (error) {
          console.error('Error deleting ebook:', error);
          message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      },
    });
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

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

  const columns = [
    {
      title: "eBook",
      key: "ebook",
      render: (_, record) => (
        <Space size={12}>
          <Avatar 
            src={record.coverImageUrl}
            icon={<BookOutlined />} 
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
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <UserOutlined style={{ marginRight: "4px" }} />
                {record.author}
              </Text>
            </div>
            {record.isbn && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  ISBN: {record.isbn}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      width: 300,
    },
    {
      title: "หมวดหมู่",
      dataIndex: "categoryId",
      key: "category",
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? (
          <Tag color="blue">
            <TagOutlined style={{ marginRight: "4px" }} />
            {category.name}
          </Tag>
        ) : (
          <Text type="secondary">ไม่ระบุ</Text>
        );
      },
      width: 120,
    },
    {
      title: "ราคา",
      key: "price",
      render: (_, record) => (
        <div>
          {record.discountPrice ? (
            <>
              <Text delete type="secondary" style={{ fontSize: "12px" }}>
                {formatPrice(record.price)}
              </Text>
              <br />
              <Text strong style={{ color: "#52c41a" }}>
                {formatPrice(record.discountPrice)}
              </Text>
            </>
          ) : (
            <Text strong>{formatPrice(record.price)}</Text>
          )}
        </div>
      ),
      width: 100,
    },
    {
      title: "รูปแบบ",
      key: "format",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Tag color="processing">{record.format}</Tag>
          {record.isPhysical && (
            <Tag color="orange" style={{ fontSize: "10px" }}>
              📦 กายภาพ
            </Tag>
          )}
          {record.pageCount && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {record.pageCount} หน้า
            </Text>
          )}
        </Space>
      ),
      width: 100,
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
        <Spin size="large" />
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
            <BookOutlined style={{ marginRight: "8px" }} />
            จัดการ eBooks
          </Title>
          <Text type="secondary">จัดการหนังสืออิเล็กทรอนิกส์และเนื้อหา</Text>
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
            เพิ่ม eBook ใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={ebooks}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
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
            {editingEbook ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>
              {editingEbook ? "แก้ไข eBook" : "เพิ่ม eBook ใหม่"}
            </Text>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingEbook(null);
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
                icon={editingEbook ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editingEbook ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingEbook(null);
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