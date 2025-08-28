"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message, Card, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function AdminExamCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/exam-categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingCategory 
        ? `/api/admin/exam-categories/${editingCategory.id}`
        : '/api/admin/exam-categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        setModalVisible(false);
        fetchCategories();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admin/exam-categories/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        fetchCategories();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const columns = [
    {
      title: 'ชื่อหมวดหมู่',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </div>
      )
    },
    {
      title: 'คำอธิบาย',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-'
    },
    {
      title: 'จำนวนข้อสอบ',
      dataIndex: '_count',
      key: 'examCount',
      render: (count) => (
        <Tag color="blue">{count.exams} ข้อสอบ</Tag>
      )
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </Tag>
      )
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('th-TH')
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okType="danger"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record._count.exams > 0}
            >
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>📁 จัดการหมวดหมู่ข้อสอบ</h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              จัดการหมวดหมู่สำหรับจัดเก็บข้อสอบ
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
          >
            เพิ่มหมวดหมู่ใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? "แก้ไขหมวดหมู่ข้อสอบ" : "เพิ่มหมวดหมู่ข้อสอบใหม่"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            name="name"
            label="ชื่อหมวดหมู่"
            rules={[
              { required: true, message: 'กรุณาระบุชื่อหมวดหมู่' },
              { max: 255, message: 'ชื่อหมวดหมู่ต้องไม่เกิน 255 ตัวอักษร' }
            ]}
          >
            <Input placeholder="เช่น คณิตศาสตร์, ฟิสิกส์, เคมี" />
          </Form.Item>

          <Form.Item
            name="description"
            label="คำอธิบาย (ไม่บังคับ)"
          >
            <TextArea 
              rows={4} 
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหมวดหมู่นี้"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'อัพเดท' : 'สร้าง'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}