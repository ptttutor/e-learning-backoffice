"use client";
import React from "react";
import {
  Modal,
  Card,
  Space,
  Typography,
  Descriptions,
  Tag,
  Upload,
  Button,
  Avatar,
  Badge,
  Divider,
} from "antd";
import {
  CloudUploadOutlined,
  FileOutlined,
  FolderOutlined,
  UploadOutlined,
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function FileManagementModal({
  open,
  exam,
  examFiles,
  onCancel,
  onFileUpload,
  onDeleteFile,
}) {
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

  return (
    <Modal
      title={
        <Space>
          <CloudUploadOutlined />
          <Text strong>จัดการไฟล์: {exam?.title}</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={
        <Button
          onClick={onCancel}
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
        {exam && (
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
                <Text strong>{exam.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={4}>
                    <FolderOutlined style={{ color: "#8c8c8c" }} />
                    <Text>หมวดหมู่</Text>
                  </Space>
                }
              >
                {exam.category ? (
                  <Tag color="blue">{exam.category.name}</Tag>
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
            customRequest={onFileUpload}
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
                        onClick={() => onDeleteFile(file.id, file.fileName)}
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
  );
}
