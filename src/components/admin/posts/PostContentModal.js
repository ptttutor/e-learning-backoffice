"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  message,
  Progress,
  Image,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
  FileImageOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostContentModal({
  visible,
  onCancel,
  onSubmit,
  postId,
  post, // เพิ่ม post object
  loading = false,
}) {
  const [contentItems, setContentItems] = useState([
    { id: Date.now(), urlImg: "", name: "", description: "", uploading: false },
  ]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [existingContents, setExistingContents] = useState([]);
  const [fetchingContents, setFetchingContents] = useState(false);

  // Fetch existing content when modal opens
  const fetchExistingContents = useCallback(async () => {
    if (!postId) return;
    
    try {
      setFetchingContents(true);
      const response = await fetch(`/api/admin/posts/${postId}/content`);
      const result = await response.json();
      
      if (result.success) {
        setExistingContents(result.data || []);
      } else {
        console.error('Error fetching existing contents:', result.error);
      }
    } catch (error) {
      console.error('Error fetching existing contents:', error);
    } finally {
      setFetchingContents(false);
    }
  }, [postId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setContentItems([
        {
          id: Date.now(),
          urlImg: "",
          name: "",
          description: "",
          uploading: false,
        },
      ]);
      setUploadProgress({});
      setExistingContents([]);
      
      // Fetch existing contents
      if (postId) {
        fetchExistingContents();
      }
    }
  }, [visible, postId, fetchExistingContents]);

  // Handle image upload
  const handleImageUpload = async (file, itemId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "post-content");

    try {
      setContentItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, uploading: true } : item
        )
      );

      setUploadProgress((prev) => ({ ...prev, [itemId]: 0 }));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setContentItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, urlImg: result.url, uploading: false }
              : item
          )
        );
        setUploadProgress((prev) => ({ ...prev, [itemId]: 100 }));
        message.success("อัปโหลดรูปภาพสำเร็จ");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error(`เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}`);
      setContentItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, uploading: false } : item
        )
      );
    }

    return false; // Prevent default upload behavior
  };

  // Add new content item
  const addContentItem = () => {
    const newItem = {
      id: Date.now(),
      urlImg: "",
      name: "",
      description: "",
      uploading: false,
    };
    setContentItems((prev) => [...prev, newItem]);
  };

  // Remove content item
  const removeContentItem = (itemId) => {
    if (contentItems.length > 1) {
      setContentItems((prev) => prev.filter((item) => item.id !== itemId));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[itemId];
        return newProgress;
      });
    }
  };

  // Update content item field
  const updateContentItem = (itemId, field, value) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate that at least one item has content
      const validItems = contentItems.filter(
        (item) => item.urlImg || item.name || item.description
      );

      if (validItems.length === 0) {
        message.error("กรุณาเพิ่มเนื้อหาอย่างน้อย 1 รายการ");
        return;
      }

      // Check for any uploading items
      const uploadingItems = contentItems.filter((item) => item.uploading);
      if (uploadingItems.length > 0) {
        message.error("กรุณารอให้การอัปโหลดเสร็จสิ้น");
        return;
      }

      // Prepare data for submission
      const submitData = validItems.map((item) => ({
        urlImg: item.urlImg || null,
        name: item.name || null,
        description: item.description || null,
      }));

      await onSubmit(submitData);
      
      // Refresh existing contents after successful submission
      if (postId) {
        fetchExistingContents();
      }
    } catch (error) {
      console.error("Submit error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  // Delete existing content
  const deleteExistingContent = async (contentId) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/content?contentId=${contentId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        message.success('ลบเนื้อหาสำเร็จ');
        fetchExistingContents(); // Refresh the list
      } else {
        message.error(result.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <PictureOutlined style={{ color: "#1890ff" }} />
          <div>
            <Text strong>จัดการเนื้อหารูปภาพ</Text>
            {post?.title && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  โพสต์: {post.title}
                </Text>
              </div>
            )}
          </div>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          ยกเลิก
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          icon={<PlusOutlined />}
        >
          บันทึกทั้งหมด
        </Button>,
      ]}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <Text type="secondary">
          เพิ่มรูปภาพและข้อมูลสำหรับโพสต์ สามารถเพิ่มได้หลายรายการ
        </Text>
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Existing Contents Section */}
        {existingContents.length > 0 && (
          <div>
            <Divider orientation="left">
              <Space>
                <FileImageOutlined style={{ color: "#52c41a" }} />
                <Text strong style={{ color: "#52c41a" }}>
                  เนื้อหาที่มีอยู่ ({existingContents.length} รายการ)
                </Text>
              </Space>
            </Divider>
            
            {existingContents.map((content, index) => (
              <Card
                key={content.id}
                size="small"
                title={
                  <Space>
                    <FileImageOutlined style={{ color: "#52c41a" }} />
                    <Text strong>เนื้อหาที่ {index + 1}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      (สร้างเมื่อ: {new Date(content.createdAt).toLocaleString('th-TH')})
                    </Text>
                    <Popconfirm
                      title="ต้องการลบเนื้อหานี้?"
                      onConfirm={() => deleteExistingContent(content.id)}
                      okText="ลบ"
                      cancelText="ยกเลิก"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{ marginLeft: "auto" }}
                      >
                        ลบ
                      </Button>
                    </Popconfirm>
                  </Space>
                }
                style={{
                  border: "2px solid #52c41a",
                  marginBottom: "12px",
                }}
              >
                <Row gutter={16}>
                  {/* Image Section */}
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <Text strong style={{ display: "block", marginBottom: "8px" }}>
                        รูปภาพ
                      </Text>
                      {content.urlImg ? (
                        <Image
                          src={content.urlImg}
                          alt={content.name || "รูปภาพ"}
                          style={{
                            width: "100%",
                            maxHeight: "120px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "120px",
                            border: "1px dashed #d9d9d9",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <Text type="secondary">ไม่มีรูปภาพ</Text>
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Content Information Section */}
                  <Col span={16}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div>
                        <Text strong style={{ display: "block", marginBottom: "4px" }}>
                          ชื่อ / Caption
                        </Text>
                        <Text>{content.name || "ไม่ระบุ"}</Text>
                      </div>

                      <div>
                        <Text strong style={{ display: "block", marginBottom: "4px" }}>
                          คำอธิบาย
                        </Text>
                        <Text>{content.description || "ไม่ระบุ"}</Text>
                      </div>

                      <div>
                        <Text strong style={{ display: "block", marginBottom: "4px" }}>
                          ผู้สร้าง
                        </Text>
                        <Text type="secondary">
                          {content.author?.name || content.author?.email || "ไม่ระบุ"}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        )}

        {/* Loading State for Existing Contents */}
        {fetchingContents && (
          <Card style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">กำลังโหลดเนื้อหาที่มีอยู่...</Text>
          </Card>
        )}

        {/* New Content Section */}
        <Divider orientation="left">
          <Space>
            <PlusOutlined style={{ color: "#1890ff" }} />
            <Text strong style={{ color: "#1890ff" }}>
              เพิ่มเนื้อหาใหม่
            </Text>
          </Space>
        </Divider>
        {contentItems.map((item, index) => (
          <Card
            key={item.id}
            size="small"
            title={
              <Space>
                <FileImageOutlined style={{ color: "#52c41a" }} />
                <Text strong>รายการที่ {index + 1}</Text>
                {contentItems.length > 1 && (
                  <Popconfirm
                    title="ต้องการลบรายการนี้?"
                    onConfirm={() => removeContentItem(item.id)}
                    okText="ลบ"
                    cancelText="ยกเลิก"
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{ marginLeft: "auto" }}
                    >
                      ลบ
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            }
            style={{
              border: item.urlImg ? "2px solid #52c41a" : "1px solid #d9d9d9",
            }}
          >
            <Row gutter={16}>
              {/* Image Upload Section */}
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text
                    strong
                    style={{ display: "block", marginBottom: "8px" }}
                  >
                    รูปภาพ
                  </Text>

                  {item.urlImg ? (
                    <div>
                      <Image
                        src={item.urlImg}
                        alt="รูปภาพ"
                        style={{
                          width: "100%",
                          maxHeight: "120px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          marginBottom: "8px",
                        }}
                      />
                      <div>
                        <Upload
                          accept="image/*"
                          showUploadList={false}
                          beforeUpload={(file) =>
                            handleImageUpload(file, item.id)
                          }
                          disabled={item.uploading}
                        >
                          <Button
                            size="small"
                            icon={<UploadOutlined />}
                            loading={item.uploading}
                          >
                            เปลี่ยนรูป
                          </Button>
                        </Upload>
                      </div>
                    </div>
                  ) : (
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => handleImageUpload(file, item.id)}
                      disabled={item.uploading}
                    >
                      <div
                        style={{
                          border: "2px dashed #d9d9d9",
                          borderRadius: "6px",
                          padding: "20px",
                          textAlign: "center",
                          cursor: "pointer",
                          backgroundColor: item.uploading
                            ? "#f5f5f5"
                            : "#fafafa",
                        }}
                      >
                        {item.uploading ? (
                          <div>
                            <Progress
                              percent={uploadProgress[item.id] || 0}
                              size="small"
                              style={{ marginBottom: "8px" }}
                            />
                            <Text type="secondary">กำลังอัปโหลด...</Text>
                          </div>
                        ) : (
                          <div>
                            <PlusOutlined
                              style={{ fontSize: "24px", color: "#bfbfbf" }}
                            />
                            <div style={{ marginTop: "8px" }}>
                              <Text type="secondary">คลิกเพื่ือเลือกรูป</Text>
                            </div>
                          </div>
                        )}
                      </div>
                    </Upload>
                  )}
                </div>
              </Col>

              {/* Content Information Section */}
              <Col span={16}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "4px" }}
                    >
                      ชื่อ / Caption
                    </Text>
                    <Input
                      placeholder="ชื่อรูปหรือ caption (ไม่บังคับ)"
                      value={item.name}
                      onChange={(e) =>
                        updateContentItem(item.id, "name", e.target.value)
                      }
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "4px" }}
                    >
                      คำอธิบาย
                    </Text>
                    <TextArea
                      placeholder="คำอธิบายรูปภาพ (ไม่บังคับ)"
                      value={item.description}
                      onChange={(e) =>
                        updateContentItem(
                          item.id,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      maxLength={500}
                    />
                  </div>

                  {/* Status indicators */}
                  <div style={{ marginTop: "8px" }}>
                    <Space>
                      {item.urlImg && (
                        <Text type="success" style={{ fontSize: "12px" }}>
                          ✓ มีรูปภาพ
                        </Text>
                      )}
                      {item.name && (
                        <Text type="success" style={{ fontSize: "12px" }}>
                          ✓ มีชื่อ
                        </Text>
                      )}
                      {item.description && (
                        <Text type="success" style={{ fontSize: "12px" }}>
                          ✓ มีคำอธิบาย
                        </Text>
                      )}
                    </Space>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        ))}

        {/* Add New Item Button */}
        <Card
          style={{
            border: "2px dashed #1890ff",
            textAlign: "center",
            cursor: "pointer",
            padding: "20px",
          }}
          onClick={addContentItem}
        >
          <Space direction="vertical">
            <PlusOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <Text style={{ color: "#1890ff", fontWeight: "500" }}>
              เพิ่มรายการใหม่
            </Text>
          </Space>
        </Card>

        {/* Summary */}
        <Divider />
        <div
          style={{
            textAlign: "center",
            padding: "16px",
            backgroundColor: "#f6ffed",
            borderRadius: "6px",
          }}
        >
          <Space direction="vertical" size="small">
            <Text strong style={{ color: "#52c41a" }}>
              <FileImageOutlined /> สรุปเนื้อหา
            </Text>
            <div>
              <Text style={{ fontSize: "14px" }}>
                เนื้อหาที่มีอยู่: <Text strong>{existingContents.length}</Text> รายการ
              </Text>
              <br />
              <Text style={{ fontSize: "14px" }}>
                เนื้อหาใหม่ที่จะเพิ่ม: <Text strong>
                {
                  contentItems.filter(
                    (item) => item.urlImg || item.name || item.description
                  ).length
                }
                </Text> รายการ
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              รวมทั้งหมด: {existingContents.length + contentItems.filter(
                (item) => item.urlImg || item.name || item.description
              ).length} รายการ
            </Text>
          </Space>
        </div>
      </Space>
    </Modal>
  );
}
