"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, Select, message, Card, Popconfirm, Tag, Upload } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, UploadOutlined, EyeOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

export default function AdminExamBankPage() {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examFiles, setExamFiles] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchExams();
    fetchCategories();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exam-bank');
      const result = await response.json();
      
      if (result.success) {
        setExams(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/exam-categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data.filter(cat => cat.isActive));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingExam(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    form.setFieldsValue({
      title: exam.title,
      description: exam.description,
      categoryId: exam.categoryId
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingExam 
        ? `/api/admin/exam-bank/${editingExam.id}`
        : '/api/admin/exam-bank';
      
      const method = editingExam ? 'PUT' : 'POST';
      
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
        fetchExams();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admin/exam-bank/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        fetchExams();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleManageFiles = async (exam) => {
    setSelectedExam(exam);
    setFileModalVisible(true);
    // Fetch existing files for this exam
    await fetchExamFiles(exam.id);
  };

  const fetchExamFiles = async (examId) => {
    try {
      const response = await fetch(`/api/admin/exam-files?examId=${examId}`);
      const result = await response.json();
      
      if (result.success) {
        setExamFiles(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching exam files:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดไฟล์');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`/api/admin/exam-files/${fileId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        // Refresh files list
        if (selectedExam) {
          await fetchExamFiles(selectedExam.id);
          // Refresh exam data to show updated file count
          fetchExams();
        }
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  };

  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    if (!selectedExam) {
      onError('ไม่พบข้อมูลข้อสอบ');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', selectedExam.id);

    try {
      const response = await fetch('/api/admin/exam-files', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        message.success('อัพโหลดไฟล์สำเร็จ');
        onSuccess();
        // Refresh files list and exam data
        await fetchExamFiles(selectedExam.id);
        fetchExams();
      } else {
        message.error(result.error);
        onError(result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
      onError(error);
    }
  };

  const columns = [
    {
      title: 'ชื่อข้อสอบ',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </div>
      )
    },
    {
      title: 'หมวดหมู่',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category ? (
        <Tag color="blue">{category.name}</Tag>
      ) : (
        <Tag color="gray">ไม่ระบุ</Tag>
      )
    },
    {
      title: 'จำนวนไฟล์',
      dataIndex: '_count',
      key: 'fileCount',
      render: (count) => (
        <Tag color="green">{count.files} ไฟล์</Tag>
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
            type="default"
            size="small"
            icon={<UploadOutlined />}
            onClick={() => handleManageFiles(record)}
          >
            จัดการไฟล์
          </Button>
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
            description="คุณแน่ใจหรือไม่ที่จะลบข้อสอบนี้? ไฟล์ทั้งหมดจะถูกลบด้วย"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okType="danger"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
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
            <h1 style={{ margin: 0, fontSize: '24px' }}>📝 จัดการคลังข้อสอบ</h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              จัดการข้อสอบและไฟล์ที่เกี่ยวข้อง
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
          >
            เพิ่มข้อสอบใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={exams}
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

      {/* Modal สำหรับเพิ่ม/แก้ไขข้อสอบ */}
      <Modal
        title={editingExam ? "แก้ไขข้อสอบ" : "เพิ่มข้อสอบใหม่"}
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
            name="title"
            label="ชื่อข้อสอบ"
            rules={[
              { required: true, message: 'กรุณาระบุชื่อข้อสอบ' },
              { max: 255, message: 'ชื่อข้อสอบต้องไม่เกิน 255 ตัวอักษร' }
            ]}
          >
            <Input placeholder="เช่น ข้อสอบฟิสิกส์ ม.6 เทอม 1" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="หมวดหมู่"
          >
            <Select placeholder="เลือกหมวดหมู่" allowClear>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="คำอธิบาย (ไม่บังคับ)"
          >
            <TextArea 
              rows={4} 
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับข้อสอบนี้"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                {editingExam ? 'อัพเดท' : 'สร้าง'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal สำหรับจัดการไฟล์ */}
      <Modal
        title={`จัดการไฟล์: ${selectedExam?.title}`}
        open={fileModalVisible}
        onCancel={() => setFileModalVisible(false)}
        footer={
          <Button onClick={() => setFileModalVisible(false)}>
            ปิด
          </Button>
        }
        width={900}
      >
        <div style={{ marginTop: '24px' }}>
          {/* Upload Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>📤 อัพโหลดไฟล์ใหม่</h3>
            <Upload.Dragger
              name="file"
              multiple={true}
              customRequest={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              showUploadList={true}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาที่นี่เพื่ออัพโหลด</p>
              <p className="ant-upload-hint">
                รองรับไฟล์ PDF, Word, รูปภาพ (ขนาดไม่เกิน 10MB)
              </p>
            </Upload.Dragger>
          </div>

          {/* Existing Files Section */}
          <div>
            <h3 style={{ marginBottom: '16px' }}>📁 ไฟล์ที่มีอยู่ ({examFiles.length})</h3>
            {examFiles.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                color: '#666'
              }}>
                <FileOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                <div>ยังไม่มีไฟล์ในข้อสอบนี้</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {examFiles.map((file) => (
                  <div key={file.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <FileOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                          {file.fileName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => window.open(file.filePath, '_blank')}
                      >
                        ดู
                      </Button>
                      <Popconfirm
                        title="ยืนยันการลบไฟล์"
                        description="คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้?"
                        onConfirm={() => handleDeleteFile(file.id)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okType="danger"
                      >
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          ลบ
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}