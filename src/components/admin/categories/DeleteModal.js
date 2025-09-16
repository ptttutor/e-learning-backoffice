"use client";
import React from "react";
import { Modal, Typography, Space, Button } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function DeleteModal({
  open,
  category,
  loading,
  onConfirm,
  onCancel,
}) {
  if (!category) return null;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          <Text strong>ยืนยันการลบหมวดหมู่</Text>
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
          ลบหมวดหมู่
        </Button>,
      ]}
      width={500}
    >
      <div style={{ padding: "16px 0" }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              backgroundColor: "#fff2e8",
              border: "1px solid #ffbb96",
              borderRadius: "6px",
            }}
          >
            <Space size={12}>
              <AppstoreOutlined
                style={{ fontSize: "20px", color: "#fa8c16" }}
              />
              <div>
                <Text strong style={{ fontSize: "16px" }}>
                  {category.name}
                </Text>
                {category.description && (
                  <div>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      {category.description}
                    </Text>
                  </div>
                )}
              </div>
            </Space>
          </div>

          <div>
            <Text strong style={{ color: "#ff4d4f" }}>
              คำเตือน:
            </Text>
            <Text style={{ marginLeft: "8px" }}>
              การลบหมวดหมู่นี้ไม่สามารถยกเลิกได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
            </Text>
          </div>

          <div>
            <Text>คุณต้องการลบหมวดหมู่ &quot;</Text>
            <Text strong style={{ color: "#ff4d4f" }}>
              {category.name}
            </Text>
            <Text>&quot; ใช่หรือไม่?</Text>
          </div>
        </Space>
      </div>
    </Modal>
  );
}