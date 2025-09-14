"use client";
import React from "react";
import { Modal, Typography, Space, Button } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  AppstoreOutlined,
  TagOutlined,
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
          <Text strong>ยืนยันการลบหมวดหมู่ eBook</Text>
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
              padding: "16px",
              backgroundColor: "#fff2e8",
              borderRadius: "8px",
              border: "1px solid #ffec3d",
            }}
          >
            <Space size={12}>
              <AppstoreOutlined
                style={{ fontSize: "24px", color: "#fa8c16" }}
              />
              <div>
                <Text strong style={{ fontSize: "16px", color: "#fa8c16" }}>
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
            <Text style={{ fontSize: "16px" }}>
              คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ eBook นี้?
            </Text>
            <div style={{ marginTop: "12px" }}>
              <Space direction="vertical" size={8}>
                {category._count?.ebooks > 0 && (
                  <div style={{ color: "#ff4d4f" }}>
                    <Text type="danger">
                      <BookOutlined style={{ marginRight: "8px" }} />
                      หมวดหมู่นี้มี eBook อยู่ {category._count.ebooks} เล่ม
                    </Text>
                  </div>
                )}
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  <TagOutlined style={{ marginRight: "8px" }} />
                  การลบหมวดหมู่นี้จะไม่สามารถย้อนกลับได้
                </Text>
              </Space>
            </div>
          </div>
        </Space>
      </div>
    </Modal>
  );
}