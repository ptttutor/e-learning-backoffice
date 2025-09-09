"use client";
import { Modal, Button, Typography, Space, Tag, Avatar } from "antd";
import { DeleteOutlined, FileTextOutlined, StarOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function DeleteModal({
  open,
  post,
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
          <DeleteOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>ยืนยันการลบโพสต์</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          ยกเลิก
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={loading}
          onClick={onConfirm}
        >
          ลบโพสต์
        </Button>,
      ]}
      width={600}
    >
      {post && (
        <div>
          <p>คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?</p>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              marginTop: "12px",
            }}
          >
            <Space size={12} style={{ marginBottom: "12px" }}>
              <Avatar 
                src={post.imageUrl && post.imageUrl.trim() ? post.imageUrl : null}
                icon={<FileTextOutlined />} 
                size={50}
                shape="square"
              />
              <div>
                <div>
                  <Text strong style={{ fontSize: "16px" }}>{post.title}</Text>
                  {post.isFeatured && (
                    <Tag color="gold" style={{ marginLeft: "8px" }}>
                      <StarOutlined /> แนะนำ
                    </Tag>
                  )}
                </div>
                {post.excerpt && (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      {post.excerpt.length > 100 
                        ? `${post.excerpt.substring(0, 100)}...` 
                        : post.excerpt}
                    </Text>
                  </div>
                )}
              </div>
            </Space>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <Text strong>ประเภท: </Text>
                <Text>{post.postType?.name || 'ไม่ระบุ'}</Text>
              </div>
              <div>
                <Text strong>ผู้เขียน: </Text>
                <Text>{post.author?.name || 'ไม่ระบุ'}</Text>
              </div>
              <div>
                <Text strong>สถานะ: </Text>
                <Tag color={post.isActive ? "success" : "error"}>
                  {post.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </Tag>
              </div>
              <div>
                <Text strong>วันที่สร้าง: </Text>
                <Text>{formatDate(post.createdAt)}</Text>
              </div>
            </div>
          </div>
          <p style={{ color: "#ff4d4f", marginTop: "12px", marginBottom: 0 }}>
            <ExclamationCircleOutlined /> การดำเนินการนี้ไม่สามารถยกเลิกได้
          </p>
        </div>
      )}
    </Modal>
  );
}
