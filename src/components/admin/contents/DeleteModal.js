"use client";
import React from "react";
import { Modal, Typography, Space, Button } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

export default function DeleteModal({
  open,
  content,
  loading,
  onConfirm,
  onCancel,
}) {
  if (!content) return null;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          <Text strong>ยืนยันการลบเนื้อหา</Text>
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
          ลบเนื้อหา
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
            <Text>คุณต้องการลบเนื้อหาต่อไปนี้:</Text>
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
                <Text type="secondary">ชื่อเนื้อหา:</Text>
                <br />
                <Space>
                  <FileTextOutlined style={{ color: "#1890ff" }} />
                  <Text strong>{content.title}</Text>
                </Space>
              </div>
              
              <div>
                <Text type="secondary">ประเภท:</Text>
                <br />
                <Text>{content.contentType}</Text>
              </div>

              <div>
                <Text type="secondary">URL/ไฟล์:</Text>
                <br />
                <Text 
                  style={{
                    wordBreak: "break-all",
                    fontSize: "12px"
                  }}
                >
                  {content.contentUrl}
                </Text>
              </div>
            </Space>
          </div>

          <div>
            <Text type="secondary">
              เนื้อหานี้จะถูกลบอย่างถาวร และไม่สามารถกู้คืนได้
            </Text>
          </div>
        </Space>
      </div>
    </Modal>
  );
}
