"use client";
import { Modal, Button, Typography, Space } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function DeleteModal({
  open,
  course,
  loading,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>ยืนยันการลบคอร์ส</Text>
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
          ลบคอร์ส
        </Button>,
      ]}
      width={500}
    >
      {course && (
        <div>
          <p>คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้?</p>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              marginTop: "12px",
            }}
          >
            <Text strong>ชื่อคอร์ส: </Text>
            <Text>{course.title}</Text>
            <br />
            <Text strong>ราคา: </Text>
            <Text>
              {new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
              }).format(course.price || 0)}
            </Text>
          </div>
          <p style={{ color: "#ff4d4f", marginTop: "12px", marginBottom: 0 }}>
            <ExclamationCircleOutlined /> การดำเนินการนี้ไม่สามารถยกเลิกได้
          </p>
        </div>
      )}
    </Modal>
  );
}