"use client";
import { useEffect, useState } from "react";
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
  Tag,
  Upload,
  Typography,
  Avatar,
  Badge,
  Descriptions,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  UploadOutlined,
  EyeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  FolderOutlined,
  InboxOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

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
      const response = await fetch("/api/admin/exam-bank");
      const result = await response.json();

      if (result.success) {
        setExams(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/exam-categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data.filter((cat) => cat.isActive));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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
      categoryId: exam.categoryId,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingExam
        ? `/api/admin/exam-bank/${editingExam.id}`
        : "/api/admin/exam-bank";

      const method = editingExam ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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
      console.error("Error saving exam:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id, title) => {
    Modal.confirm({
      title: "ยืนยันการลบข้อสอบ?",
      content: `คุณต้องการลบข้อสอบ "${title}" ใช่หรือไม่? ไฟล์ทั้งหมดจะถูกลบด้วย`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/exam-bank/${id}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (result.success) {
            message.success(result.message || "ลบข้อสอบสำเร็จ");
            fetchExams();
          } else {
            message.error(result.error);
          }
        } catch (error) {
          console.error("Error deleting exam:", error);
          message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      },
    });
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      console.error("Error fetching exam files:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดไฟล์");
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    Modal.confirm({
      title: "ยืนยันการลบไฟล์?",
      content: `คุณต้องการลบไฟล์ "${fileName}" ใช่หรือไม่?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/exam-files/${fileId}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (result.success) {
            message.success(result.message || "ลบไฟล์สำเร็จ");
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
          console.error("Error deleting file:", error);
          message.error("เกิดข้อผิดพลาดในการลบไฟล์");
        }
      },
    });
  };

  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    if (!selectedExam) {
      onError("ไม่พบข้อมูลข้อสอบ");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", selectedExam.id);

    try {
      const response = await fetch("/api/admin/exam-files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        message.success("อัพโหลดไฟล์สำเร็จ");
        onSuccess();
        // Refresh files list and exam data
        await fetchExamFiles(selectedExam.id);
        fetchExams();
      } else {
        message.error(result.error);
        onError(result.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
      onError(error);
    }
  };

  const columns = [
    {
      title: "ข้อสอบ",
      key: "exam",
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            icon={<FileOutlined />}
            style={{ backgroundColor: "#1890ff" }}
            size="default"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {record.title}
              </Text>
            </div>
            {record.description && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.description.length > 50
                    ? `${record.description.substring(0, 50)}...`
                    : record.description}
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
      key: "category",
      render: (_, record) => (
        <Space size={8}>
          <FolderOutlined style={{ color: "#8c8c8c" }} />
          {record.category ? (
            <Tag color="blue">{record.category.name}</Tag>
          ) : (
            <Tag color="default">ไม่ระบุ</Tag>
          )}
        </Space>
      ),
      width: 150,
    },
    {
      title: "จำนวนไฟล์",
      key: "fileCount",
      render: (_, record) => (
        <Badge
          count={record._count?.files || 0}
          style={{ backgroundColor: "#52c41a" }}
          showZero
        />
      ),
      width: 120,
      align: "center",
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
            icon={<CloudUploadOutlined />}
            size="small"
            onClick={() => handleManageFiles(record)}
            style={{ borderRadius: "6px" }}
          >
            จัดการไฟล์
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
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
      width: 200,
      fixed: "right",
    },
  ];

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
            จัดการคลังข้อสอบ
          </Title>
          <Text type="secondary">จัดการข้อสอบและไฟล์ที่เกี่ยวข้อง</Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ borderRadius: "6px" }}
            size="middle"
          >
            เพิ่มข้อสอบใหม่
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={exams}
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
            {editingExam ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>
              {editingExam ? "แก้ไขข้อสอบ" : "เพิ่มข้อสอบใหม่"}
            </Text>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingExam(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        style={{ top: 20 }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label={
              <Space size={6}>
                <FileOutlined style={{ color: "#8c8c8c" }} />
                <Text>ชื่อข้อสอบ</Text>
              </Space>
            }
            rules={[
              { required: true, message: "กรุณาระบุชื่อข้อสอบ" },
              { min: 2, message: "ชื่อข้อสอบต้องมีอย่างน้อย 2 ตัวอักษร" },
              { max: 255, message: "ชื่อข้อสอบต้องไม่เกิน 255 ตัวอักษร" },
            ]}
          >
            <Input
              placeholder="เช่น ข้อสอบฟิสิกส์ ม.6 เทอม 1"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label={
              <Space size={6}>
                <FolderOutlined style={{ color: "#8c8c8c" }} />
                <Text>หมวดหมู่</Text>
              </Space>
            }
          >
            <Select
              placeholder="เลือกหมวดหมู่"
              allowClear
              style={{ borderRadius: "6px" }}
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <Space size={6}>
                <FileTextOutlined style={{ color: "#8c8c8c" }} />
                <Text>คำอธิบาย (ไม่บังคับ)</Text>
              </Space>
            }
            rules={[{ max: 500, message: "คำอธิบายต้องไม่เกิน 500 ตัวอักษร" }]}
          >
            <TextArea
              rows={4}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับข้อสอบนี้"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={editingExam ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editingExam ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingExam(null);
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

      {/* File Management Modal */}
      <Modal
        title={
          <Space>
            <CloudUploadOutlined />
            <Text strong>จัดการไฟล์: {selectedExam?.title}</Text>
          </Space>
        }
        open={fileModalVisible}
        onCancel={() => {
          setFileModalVisible(false);
          setSelectedExam(null);
          setExamFiles([]);
        }}
        footer={
          <Button
            onClick={() => {
              setFileModalVisible(false);
              setSelectedExam(null);
              setExamFiles([]);
            }}
            style={{ borderRadius: "6px" }}
          >
            ปิด
          </Button>
        }
        width={900}
        style={{ top: 20 }}
      >
        <div>
          {/* Exam Info */}
          {selectedExam && (
            <Card
              size="small"
              style={{ marginBottom: "24px", backgroundColor: "#f8f9fa" }}
            >
              <Descriptions size="small" column={2}>
                <Descriptions.Item
                  label={
                    <Space size={4}>
                      <FileOutlined style={{ color: "#8c8c8c" }} />
                      <Text>ชื่อข้อสอบ</Text>
                    </Space>
                  }
                >
                  <Text strong>{selectedExam.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space size={4}>
                      <FolderOutlined style={{ color: "#8c8c8c" }} />
                      <Text>หมวดหมู่</Text>
                    </Space>
                  }
                >
                  {selectedExam.category ? (
                    <Tag color="blue">{selectedExam.category.name}</Tag>
                  ) : (
                    <Text type="secondary">ไม่ระบุ</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Upload Section */}
          <Card
            title={
              <Space>
                <UploadOutlined style={{ color: "#1890ff" }} />
                <Text strong>อัพโหลดไฟล์ใหม่</Text>
              </Space>
            }
            size="small"
            style={{ marginBottom: "24px" }}
          >
            <Upload.Dragger
              name="file"
              multiple={true}
              customRequest={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              showUploadList={true}
              style={{ borderRadius: "6px" }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
              </p>
              <p className="ant-upload-text">
                <Text strong>คลิกหรือลากไฟล์มาที่นี่เพื่ออัพโหลด</Text>
              </p>
              <p className="ant-upload-hint">
                <Text type="secondary">
                  รองรับไฟล์ PDF, Word, รูปภาพ (ขนาดไม่เกิน 10MB)
                </Text>
              </p>
            </Upload.Dragger>
          </Card>

          {/* Existing Files Section */}
          <Card
            title={
              <Space>
                <FileOutlined style={{ color: "#1890ff" }} />
                <Text strong>ไฟล์ที่มีอยู่</Text>
                <Badge
                  count={examFiles.length}
                  style={{ backgroundColor: "#52c41a" }}
                />
              </Space>
            }
            size="small"
          >
            {examFiles.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  backgroundColor: "#fafafa",
                  borderRadius: "8px",
                  border: "1px dashed #d9d9d9",
                }}
              >
                <FileOutlined
                  style={{
                    fontSize: "48px",
                    color: "#bfbfbf",
                    marginBottom: "16px",
                  }}
                />
                <div>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    ยังไม่มีไฟล์ในข้อสอบนี้
                  </Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    อัพโหลดไฟล์ข้างต้นเพื่อเริ่มต้น
                  </Text>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {examFiles.map((file) => (
                  <Card
                    key={file.id}
                    size="small"
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flex: 1,
                        }}
                      >
                        <Avatar
                          icon={<FileOutlined />}
                          style={{ backgroundColor: "#1890ff" }}
                          size="small"
                        />
                        <div style={{ flex: 1 }}>
                          <div>
                            <Text strong style={{ fontSize: "14px" }}>
                              {file.fileName}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              <Space size={16}>
                                <span>{formatFileSize(file.fileSize)}</span>
                                <span>
                                  <CalendarOutlined
                                    style={{ marginRight: "4px" }}
                                  />
                                  {formatDate(file.uploadedAt)}
                                </span>
                              </Space>
                            </Text>
                          </div>
                        </div>
                      </div>
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => window.open(file.filePath, "_blank")}
                          style={{ borderRadius: "6px" }}
                        >
                          ดู
                        </Button>
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            handleDeleteFile(file.id, file.fileName)
                          }
                          style={{ borderRadius: "6px" }}
                        >
                          ลบ
                        </Button>
                      </Space>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Modal>
    </div>
  );
}
