"use client";
import {
  Modal,
  Typography,
  Space,
  Button,
  Avatar,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  FolderOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

export default function DeleteModal({
  open,
  exam,
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
          <Text strong style={{ color: "#ff4d4f" }}>
            ยืนยันการลบข้อสอบ
          </Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
    >
      {exam && (
        <div>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Avatar
              size={64}
              icon={<FileOutlined />}
              style={{ backgroundColor: "#ff4d4f", marginBottom: "16px" }}
            />
            <Title level={5} style={{ margin: "0 0 8px 0" }}>
              คุณต้องการลบข้อสอบนี้ใช่หรือไม่?
            </Title>
            <Text type="secondary">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ และไฟล์ทั้งหมดจะถูกลบด้วย
            </Text>
          </div>

          <Divider />

          <div style={{ marginBottom: "24px" }}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileOutlined style={{ color: "#8c8c8c", fontSize: "16px" }} />
                <Text strong>ชื่อข้อสอบ:</Text>
                <Text>{exam.title}</Text>
              </div>

              {exam.category && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FolderOutlined style={{ color: "#8c8c8c", fontSize: "16px" }} />
                  <Text strong>หมวดหมู่:</Text>
                  <Text>{exam.category.name}</Text>
                </div>
              )}

              {exam.description && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <FileTextOutlined style={{ color: "#8c8c8c", fontSize: "16px", marginTop: "2px" }} />
                  <Text strong>คำอธิบาย:</Text>
                  <Text>{exam.description}</Text>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarOutlined style={{ color: "#8c8c8c", fontSize: "16px" }} />
                <Text strong>วันที่สร้าง:</Text>
                <Text>{formatDate(exam.createdAt)}</Text>
              </div>

              {exam._count?.files > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileOutlined style={{ color: "#ff4d4f", fontSize: "16px" }} />
                  <Text strong style={{ color: "#ff4d4f" }}>จำนวนไฟล์ที่จะถูกลบ:</Text>
                  <Text style={{ color: "#ff4d4f" }}>{exam._count.files} ไฟล์</Text>
                </div>
              )}
            </Space>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              onClick={onCancel}
              style={{ borderRadius: "6px" }}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              danger
              loading={loading}
              onClick={onConfirm}
              icon={<DeleteOutlined />}
              style={{ borderRadius: "6px" }}
              disabled={loading}
            >
              ลบข้อสอบ
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
