"use client";
import React, { useState } from "react";
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
  Switch,
  Progress,
  App, // เพิ่ม App component
} from "antd";
import {
  CloudUploadOutlined,
  FileOutlined,
  FolderOutlined,
  UploadOutlined,
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function FileManagementModal({
  open,
  exam,
  examFiles = [],
  onCancel,
  onDeleteFile,
  onToggleDownload,
  deletingFileId = null,
  onRefresh,
}) {
  const { message } = App.useApp(); // ใช้ useApp แทน static message
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // ฟังก์ชันอัพโหลดแบบใหม่ (Direct Upload)
  const handleDirectUpload = async ({ file, onSuccess, onError, onProgress }) => {
    if (!exam?.id) {
      message.error("ไม่พบข้อมูลข้อสอบ");
      onError(new Error("No exam ID"));
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2 GB)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2 GB
      if (file.size > maxSize) {
        throw new Error("ขนาดไฟล์ใหญ่เกิน 2 GB");
      }

      // 1. ขอ presigned URL
      onProgress({ percent: 10 });
      setUploadProgress(10);

      console.log("Requesting presigned URL for:", file.name);

      const presignedResponse = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          examId: exam.id,
        }),
      });

      // ตรวจสอบว่าได้ JSON กลับมาหรือไม่
      const contentType = presignedResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await presignedResponse.text();
        console.error("Received non-JSON response:", text.substring(0, 200));
        throw new Error("API ตอบกลับไม่ถูกต้อง (ไม่ใช่ JSON)");
      }

      const presignedData = await presignedResponse.json();
      console.log("Presigned response:", presignedData);

      if (!presignedResponse.ok) {
        throw new Error(presignedData.error || "ไม่สามารถสร้าง URL สำหรับอัพโหลด");
      }
      
      if (!presignedData.success) {
        throw new Error(presignedData.error || "ไม่สามารถสร้าง URL สำหรับอัพโหลด");
      }

      const { uploadUrl, publicUrl } = presignedData;
      
      if (!uploadUrl || !publicUrl) {
        throw new Error("ไม่ได้รับ URL สำหรับอัพโหลด");
      }

      // 2. อัพโหลดไฟล์โดยตรงไปยัง R2 พร้อม progress
      onProgress({ percent: 20 });
      setUploadProgress(20);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 70) + 20; // 20-90%
          onProgress({ percent });
          setUploadProgress(percent);
        }
      });

      // Upload promise
      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. บันทึกข้อมูลลง database
      onProgress({ percent: 95 });
      setUploadProgress(95);

      console.log("Saving file info to database...");

      const saveResponse = await fetch("/api/exam-files/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          fileName: file.name,
          filePath: publicUrl,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
        }),
      });

      // ตรวจสอบว่าได้ JSON กลับมาหรือไม่
      const saveContentType = saveResponse.headers.get("content-type");
      if (!saveContentType || !saveContentType.includes("application/json")) {
        const text = await saveResponse.text();
        console.error("Save response non-JSON:", text.substring(0, 200));
        throw new Error("API ตอบกลับไม่ถูกต้อง (ไม่ใช่ JSON)");
      }

      const saveData = await saveResponse.json();
      console.log("Save response:", saveData);
      
      if (!saveResponse.ok || !saveData.success) {
        throw new Error(saveData.error || "ไม่สามารถบันทึกข้อมูลไฟล์");
      }

      onProgress({ percent: 100 });
      setUploadProgress(100);
      
      message.success(`อัพโหลด "${file.name}" สำเร็จ!`);
      onSuccess(null, file);

      // Refresh รายการไฟล์
      console.log("Refreshing file list...");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error(error.message || "อัพโหลดไม่สำเร็จ");
      onError(error);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
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
        <Button onClick={onCancel} style={{ borderRadius: "6px" }}>
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
          {uploading && uploadProgress > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={uploadProgress} status="active" />
              <Text type="secondary" style={{ fontSize: 12 }}>
                กำลังอัพโหลด... {uploadProgress}%
              </Text>
            </div>
          )}
          
          <Upload.Dragger
            name="file"
            multiple={true}
            customRequest={handleDirectUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            showUploadList={true}
            disabled={uploading}
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
                รองรับไฟล์ PDF, Word, รูปภาพ (ขนาดไม่เกิน 2GB)
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
                        <div>
                          <Space>
                            <Switch
                              checked={file.isDownload}
                              checkedChildren="ดาวน์โหลดได้"
                              unCheckedChildren="ห้ามดาวน์โหลด"
                              onChange={(checked) =>
                                onToggleDownload(file.id, checked)
                              }
                              style={{ marginRight: 8 }}
                            />
                          </Space>
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          const fileType =
                            file.fileType ||
                            file.fileName.split(".").pop().toLowerCase();
                          let viewUrl = file.filePath;

                          if (
                            fileType.includes("pdf") ||
                            file.fileName.toLowerCase().endsWith(".pdf")
                          ) {
                            viewUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
                              file.filePath
                            )}`;
                          } else if (
                            fileType.includes("word") ||
                            fileType.includes("document") ||
                            file.fileName.toLowerCase().endsWith(".doc") ||
                            file.fileName.toLowerCase().endsWith(".docx")
                          ) {
                            viewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                              file.filePath
                            )}`;
                          } else if (
                            fileType.includes("image") ||
                            ["jpg", "jpeg", "png", "gif", "webp"].includes(
                              file.fileName.split(".").pop().toLowerCase()
                            )
                          ) {
                            viewUrl = file.filePath;
                          } else {
                            viewUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
                              file.filePath
                            )}`;
                          }

                          window.open(viewUrl, "_blank");
                        }}
                        style={{ borderRadius: "6px" }}
                      >
                        ดู
                      </Button>
                      <Button
                        type="default"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={async () => {
                          try {
                            const fileType = file.fileType || "";
                            let downloadFileName = file.fileName;

                            let extension = "";
                            if (fileType.includes("pdf")) {
                              extension = ".pdf";
                            } else if (
                              fileType.includes("word") ||
                              fileType.includes("document")
                            ) {
                              extension = ".docx";
                            } else if (fileType.includes("image")) {
                              if (
                                fileType.includes("jpeg") ||
                                fileType.includes("jpg")
                              ) {
                                extension = ".jpg";
                              } else if (fileType.includes("png")) {
                                extension = ".png";
                              } else if (fileType.includes("gif")) {
                                extension = ".gif";
                              }
                            }

                            if (
                              !downloadFileName.includes(".") &&
                              extension
                            ) {
                              downloadFileName += extension;
                            }

                            const response = await fetch(file.filePath, {
                              mode: "cors",
                              headers: {
                                Accept: "*/*",
                              },
                            });

                            if (!response.ok) {
                              throw new Error("Failed to download file");
                            }

                            const blob = await response.blob();

                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = downloadFileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error("Download error:", error);
                            const link = document.createElement("a");
                            link.href = file.filePath;
                            link.download = file.fileName;
                            link.target = "_blank";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        style={{ borderRadius: "6px" }}
                      >
                        ดาวน์โหลด
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteFile(file)}
                        style={{ borderRadius: "6px" }}
                        loading={deletingFileId === file.id}
                        disabled={deletingFileId !== null}
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