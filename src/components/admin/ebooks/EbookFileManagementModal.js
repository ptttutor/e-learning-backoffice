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
  Divider,
  Empty,
  message,
  Progress,
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
  BookOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Dragger } = Upload;

export default function EbookFileManagementModal({
  open,
  ebook,
  ebookFile,
  onCancel,
  onFileUpload,
  onDeleteFile,
  loadingFiles = false,
  uploadingFile = false,
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  console.log('EbookFileManagementModal rendered with:', { 
    open, 
    ebook: ebook?.title, 
    ebookFileCount: ebookFile?.length,
    ebookFiles: ebookFile
  });
  console.log('EbookFileManagementModal props:', { ebook, ebookFile, open });
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeFromFormat = (format) => {
    const formatMap = {
      'PDF': 'application/pdf',
      'EPUB': 'application/epub+zip',
      'MOBI': 'application/x-mobipocket-ebook',
      'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'DOC': 'application/msword',
    };
    return formatMap[format] || 'application/pdf';
  };

  // Handle file upload with progress
  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
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
      
      // Call the actual upload handler
      await onFileUpload({
        file,
        onSuccess: () => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            onSuccess();
          }, 500);
        },
        onError: (error) => {
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadProgress(0);
          onError(error);
        }
      });
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      onError(error);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    customRequest: handleFileUpload,
    accept: '.pdf,.epub,.mobi,.doc,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'application/epub+zip' ||
                         file.type === 'application/x-mobipocket-ebook' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                         file.type === 'application/msword' ||
                         file.name.toLowerCase().endsWith('.pdf') ||
                         file.name.toLowerCase().endsWith('.epub') ||
                         file.name.toLowerCase().endsWith('.mobi') ||
                         file.name.toLowerCase().endsWith('.doc') ||
                         file.name.toLowerCase().endsWith('.docx');
      
      if (!isValidType) {
        message.error('กรุณาเลือกไฟล์ที่รองรับ (PDF, EPUB, MOBI, DOC, DOCX)');
        return false;
      }
      
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('ไฟล์ต้องมีขนาดไม่เกิน 50MB');
        return false;
      }
      
      return true;
    },
  };

  return (
    <Modal
      title={
        <Space>
          <CloudUploadOutlined />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>จัดการไฟล์เนื้อหา: {ebook?.title}</Text>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'normal' }}>
              ไฟล์สำหรับลูกค้าดาวน์โหลดหลังจากซื้อ
            </Text>
          </div>
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
        {/* Ebook Info */}
        {ebook && (
          <Card
            size="small"
            style={{ marginBottom: "24px", backgroundColor: "#f8f9fa" }}
          >
            <Descriptions size="small" column={2}>
              <Descriptions.Item
                label={
                  <Space size={4}>
                    <BookOutlined style={{ color: "#8c8c8c" }} />
                    <Text>ชื่อ eBook</Text>
                  </Space>
                }
              >
                <Text strong>{ebook.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={4}>
                    <FolderOutlined style={{ color: "#8c8c8c" }} />
                    <Text>หมวดหมู่</Text>
                  </Space>
                }
              >
                {ebook.category ? (
                  <Tag color="blue">{ebook.category.name}</Tag>
                ) : (
                  <Text type="secondary">ไม่ระบุ</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={4}>
                    <FileOutlined style={{ color: "#8c8c8c" }} />
                    <Text>ผู้เขียน</Text>
                  </Space>
                }
              >
                <Text>{ebook.author}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={4}>
                    <FileOutlined style={{ color: "#8c8c8c" }} />
                    <Text>รูปแบบ</Text>
                  </Space>
                }
              >
                <Tag color="green">{ebook.format}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Upload Section */}
        <Card
          title={
            <Space>
              <UploadOutlined />
              <Text strong>อัปโหลดไฟล์เนื้อหา eBook</Text>
            </Space>
          }
          style={{ marginBottom: "24px" }}
          extra={
            <Text type="secondary" style={{ fontSize: '12px' }}>
              สำหรับไฟล์เนื้อหาที่ลูกค้าจะดาวน์โหลด
            </Text>
          }
        >
          <div style={{ 
            backgroundColor: '#fff7e6', 
            border: '1px solid #ffd591', 
            borderRadius: '6px', 
            padding: '12px',
            marginBottom: '16px'
          }}>
            <Text style={{ color: '#fa8c16', fontSize: '14px' }}>
              <ExclamationCircleOutlined /> <strong>ข้อควรระวัง:</strong> ไฟล์ที่อัปโหลดที่นี่จะเป็นไฟล์สำหรับลูกค้าดาวน์โหลด กรุณาตรวจสอบคุณภาพและความถูกต้อง
            </Text>
          </div>
          
          <Dragger {...uploadProps} disabled={isUploading || uploadingFile || loadingFiles}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {isUploading ? "กำลังอัปโหลด..." : uploadingFile ? "กำลังอัปโหลด..." : "คลิกหรือลากไฟล์เนื้อหา eBook มาที่นี่เพื่ออัปโหลด"}
            </p>
            <p className="ant-upload-hint">
              รองรับไฟล์ PDF, EPUB, MOBI, DOC, DOCX (ไม่เกิน 50MB)
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ไฟล์นี้จะถูกใช้สำหรับให้ลูกค้าดาวน์โหลดหลังจากซื้อ
              </Text>
            </p>
            {isUploading && (
              <div style={{ marginTop: 16, padding: '0 24px' }}>
                <Progress 
                  percent={Math.round(uploadProgress)} 
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  format={(percent) => `${percent}%`}
                />
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center', marginTop: 8 }}>
                  กำลังอัปโหลดไฟล์... กรุณารอสักครู่
                </Text>
              </div>
            )}
          </Dragger>
        </Card>

        {/* Files List */}
        <Card
          title={
            <Space>
              <FileOutlined />
              <Text strong>ไฟล์เนื้อหาสำหรับลูกค้า</Text>
              {ebookFile && ebookFile.length > 0 && (
                <Badge count={ebookFile.length} style={{ backgroundColor: "#52c41a" }} />
              )}
            </Space>
          }
          extra={
            ebookFile && ebookFile.length > 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ลูกค้าสามารถดาวน์โหลดไฟล์เหล่านี้ได้
              </Text>
            )
          }
        >
          {loadingFiles ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#8c8c8c' 
            }}>
              <Text>กำลังโหลดไฟล์...</Text>
            </div>
          ) : (!ebookFile || ebookFile.length === 0 ? (
            <Empty
              description={
                <div>
                  <Text>ยังไม่มีไฟล์เนื้อหาสำหรับลูกค้า</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    อัปโหลดไฟล์เนื้อหาเพื่อให้ลูกค้าสามารถดาวน์โหลดได้
                  </Text>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ebookFile.map((file, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                  }}
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
                        onClick={() => {
                          const fileType = file.fileType || file.fileName.split('.').pop().toLowerCase();
                          let viewUrl = file.filePath;
                          
                          // เช็คประเภทไฟล์เพื่อเลือกวิธีการแสดงผล
                          if (fileType.includes('pdf') || file.fileName.toLowerCase().endsWith('.pdf')) {
                            // สำหรับ PDF ใช้ Google Drive Viewer
                            viewUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(file.filePath)}`;
                          } else if (fileType.includes('word') || fileType.includes('document') || 
                                   file.fileName.toLowerCase().endsWith('.doc') || 
                                   file.fileName.toLowerCase().endsWith('.docx')) {
                            // สำหรับ Word Document ใช้ Office Online Viewer
                            viewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.filePath)}`;
                          } else if (fileType.includes('epub') || file.fileName.toLowerCase().endsWith('.epub')) {
                            // สำหรับ EPUB ใช้ Google Drive Viewer
                            viewUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(file.filePath)}`;
                          } else if (fileType.includes('mobi') || file.fileName.toLowerCase().endsWith('.mobi')) {
                            // สำหรับ MOBI ใช้ Google Drive Viewer
                            viewUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(file.filePath)}`;
                          } else if (fileType.includes('image') || 
                                   ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.fileName.split('.').pop().toLowerCase())) {
                            // สำหรับรูปภาพแสดงโดยตรง
                            viewUrl = file.filePath;
                          } else {
                            // สำหรับไฟล์อื่นๆ ใช้ Google Drive Viewer
                            viewUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(file.filePath)}`;
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
                            // ตรวจสอบประเภทไฟล์
                            const fileType = file.fileType || '';
                            let downloadFileName = file.fileName;
                            
                            // กำหนดนามสกุลไฟล์
                            let extension = '';
                            if (fileType.includes('pdf')) {
                              extension = '.pdf';
                            } else if (fileType.includes('epub')) {
                              extension = '.epub';
                            } else if (fileType.includes('mobi')) {
                              extension = '.mobi';
                            } else if (fileType.includes('word') || fileType.includes('document')) {
                              extension = '.docx';
                            } else if (fileType.includes('image')) {
                              if (fileType.includes('jpeg') || fileType.includes('jpg')) {
                                extension = '.jpg';
                              } else if (fileType.includes('png')) {
                                extension = '.png';
                              } else if (fileType.includes('gif')) {
                                extension = '.gif';
                              }
                            }
                            
                            // ตรวจสอบว่าชื่อไฟล์มีนามสกุลหรือไม่
                            if (!downloadFileName.includes('.') && extension) {
                              downloadFileName += extension;
                            }
                            
                            // ดาวน์โหลดไฟล์ผ่าน fetch
                            const response = await fetch(file.filePath, {
                              mode: 'cors',
                              headers: {
                                'Accept': '*/*',
                              }
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to download file');
                            }
                            
                            const blob = await response.blob();
                            
                            // สร้าง URL object และดาวน์โหลด
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = downloadFileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            // ทำความสะอาด URL object
                            window.URL.revokeObjectURL(url);
                            
                          } catch (error) {
                            console.error('Download error:', error);
                            // Fallback ไปใช้วิธีเดิม
                            const link = document.createElement('a');
                            link.href = file.filePath;
                            link.download = file.fileName;
                            link.target = '_blank';
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
                        onClick={() => onDeleteFile(ebook.id, file.fileName)}
                        style={{ borderRadius: "6px" }}
                      >
                        ลบ
                      </Button>
                    </Space>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </Modal>
  );
}
