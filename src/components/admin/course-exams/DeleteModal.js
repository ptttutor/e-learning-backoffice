"use client";
import { Modal, Button, Space, Typography } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function DeleteModal({
  open,
  exam,
  loading,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>ยืนยันการลบข้อสอบ</Text>
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
          ลบข้อสอบ
        </Button>,
      ]}
      width={500}
    >
      {exam && (
        <div>
          <Space align="start" style={{ marginBottom: "16px" }}>
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: "16px", marginTop: "2px" }} />
            <div>
              <Text>คุณแน่ใจหรือไม่ที่จะลบข้อสอบนี้?</Text>
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
              <Text strong>{exam.title}</Text>
              <Text type="secondary">
                ประเภท: {
                  exam.examType === "PRETEST" ? "ทดสอบก่อนเรียน" :
                  exam.examType === "POSTTEST" ? "ทดสอบหลังเรียน" :
                  exam.examType === "QUIZ" ? "แบบทดสอบ" :
                  exam.examType === "MIDTERM" ? "สอบกลางภาค" :
                  exam.examType === "FINAL" ? "สอบปลายภาค" :
                  exam.examType === "PRACTICE" ? "ฝึกทำ" : exam.examType
                }
              </Text>
              <Text type="secondary">
                คะแนนรวม: {exam.totalMarks} คะแนน
              </Text>
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
                  ข้อสอบและคำถามทั้งหมดจะถูกลบอย่างถาวร
                </Text>
              </div>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
}
