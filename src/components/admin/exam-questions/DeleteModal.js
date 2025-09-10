"use client";
import { Modal, Button, Space, Typography } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

export default function DeleteModal({
  open,
  question,
  loading,
  onConfirm,
  onCancel,
}) {
  const getQuestionTypeText = (type) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "เลือกตอบ";
      case "TRUE_FALSE":
        return "จริง/เท็จ";
      case "SHORT_ANSWER":
        return "ตอบสั้น";
      default:
        return type;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>ยืนยันการลบคำถาม</Text>
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
          ลบคำถาม
        </Button>,
      ]}
      width={500}
    >
      {question && (
        <div>
          <Space align="start" style={{ marginBottom: "16px" }}>
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: "16px", marginTop: "2px" }} />
            <div>
              <Text>คุณแน่ใจหรือไม่ที่จะลบคำถามนี้?</Text>
            </div>
          </Space>
          
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Paragraph
                ellipsis={{ rows: 3 }}
                strong
                style={{ margin: 0 }}
              >
                {question.questionText}
              </Paragraph>
              <Space>
                <Text type="secondary">
                  ประเภท: {getQuestionTypeText(question.questionType)}
                </Text>
                <Text type="secondary">
                  • คะแนน: {question.marks}
                </Text>
                {question.options && (
                  <Text type="secondary">
                    • ตัวเลือก: {question.options.length}
                  </Text>
                )}
              </Space>
            </Space>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff2f0",
              borderRadius: "6px",
              border: "1px solid #ffccc7",
            }}
          >
            <Space align="start">
              <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: "16px", marginTop: "2px" }} />
              <div>
                <Text strong style={{ color: "#ff4d4f" }}>
                  การกระทำนี้ไม่สามารถย้อนกลับได้
                </Text>
                <br />
                <Text style={{ color: "#ff4d4f" }}>
                  คำถามและตัวเลือกทั้งหมดจะถูกลบอย่างถาวร
                </Text>
              </div>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
}
