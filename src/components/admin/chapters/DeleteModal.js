"use client";
import React from "react";
import { Modal, Typography, Space, Button } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function DeleteModal({
  open,
  chapter,
  loading,
  onConfirm,
  onCancel,
}) {
  if (!chapter) return null;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          <Text strong>ยืนยันการลบ Chapter</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          ยกเลิก
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={loading}
          onClick={onConfirm}
          icon={<DeleteOutlined />}
        >
          ลบ Chapter
        </Button>,
      ]}
      width={500}
    >
      <div style={{ padding: "16px 0" }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fff7e6",
              border: "1px solid #ffd591",
              borderRadius: "6px",
            }}
          >
            <Space>
              <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
              <Text strong style={{ color: "#d46b08" }}>
                คำเตือน: การดำเนินการนี้ไม่สามารถยกเลิกได้
              </Text>
            </Space>
          </div>

          <div>
            <Text>คุณต้องการลบ Chapter ต่อไปนี้:</Text>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
            }}
          >
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <div>
                <Text type="secondary">ชื่อ Chapter:</Text>
                <br />
                <Space>
                  <BookOutlined style={{ color: "#1890ff" }} />
                  <Text strong>{chapter.title}</Text>
                </Space>
              </div>
              
              <div>
                <Text type="secondary">ลำดับ:</Text>
                <br />
                <Text>Chapter {chapter.order}</Text>
              </div>
            </Space>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: "6px",
            }}
          >
            <Text type="danger" strong>
              <ExclamationCircleOutlined /> การลบ Chapter จะลบเนื้อหาทั้งหมดใน Chapter นี้ด้วย
            </Text>
          </div>

          <div>
            <Text type="secondary">
              Chapter นี้จะถูกลบอย่างถาวร และไม่สามารถกู้คืนได้
            </Text>
          </div>
        </Space>
      </div>
    </Modal>
  );
}
