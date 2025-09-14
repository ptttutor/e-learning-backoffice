"use client";
import { Modal, Button, Typography, Space, Tag, Avatar } from "antd";
import { 
  DeleteOutlined, 
  TagOutlined, 
  ExclamationCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

export default function DeleteModal({
  open,
  postCategory,
  loading,
  onConfirm,
  onCancel,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>ยืนยันการลบหมวดหมู่โพสต์</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ borderRadius: "6px" }} disabled={loading}>
          ยกเลิก
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          loading={loading}
          onClick={onConfirm}
          icon={<DeleteOutlined />}
          style={{ borderRadius: "6px" }}
        >
          ลบหมวดหมู่
        </Button>,
      ]}
      width={500}
      style={{ top: 100 }}
    >
      {postCategory && (
        <div style={{ padding: "16px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Avatar
              size={64}
              icon={<TagOutlined />}
              style={{ backgroundColor: "#ff4d4f", marginBottom: "16px" }}
            />
            <Title level={4} style={{ marginBottom: "8px", color: "#ff4d4f" }}>
              คุณแน่ใจหรือไม่?
            </Title>
            <Text type="secondary">
              การลบหมวดหมู่นี้จะไม่สามารถกู้คืนได้
            </Text>
          </div>

          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space size={12}>
                <TagOutlined style={{ color: "#1890ff" }} />
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    {postCategory.name}
                  </Text>
                  {postCategory.description && (
                    <div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {postCategory.description}
                      </Text>
                    </div>
                  )}
                </div>
              </Space>

              <Space size={16} wrap>
                <Space size={4}>
                  <FileTextOutlined style={{ color: "#8c8c8c" }} />
                  <Text type="secondary">
                    {postCategory.posts?.length || 0} โพสต์
                  </Text>
                </Space>
                
                <Space size={4}>
                  <CalendarOutlined style={{ color: "#8c8c8c" }} />
                  <Text type="secondary">
                    {formatDate(postCategory.createdAt)}
                  </Text>
                </Space>

                <Tag color={postCategory.isActive ? "success" : "error"}>
                  {postCategory.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Tag>
              </Space>
            </Space>
          </div>

          {postCategory.posts && postCategory.posts.length > 0 && (
            <div
              style={{
                backgroundColor: "#fff2e8",
                border: "1px solid #ffcb9a",
                padding: "12px",
                borderRadius: "6px",
              }}
            >
              <Space>
                <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                <Text style={{ color: "#fa8c16" }}>
                  <strong>คำเตือน:</strong> หมวดหมู่นี้มี {postCategory.posts.length} โพสต์
                  การลบจะส่งผลต่อโพสต์เหล่านั้น
                </Text>
              </Space>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
