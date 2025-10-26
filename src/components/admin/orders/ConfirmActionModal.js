"use client";
import { Modal, Space, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function ConfirmActionModal({
  visible,
  actionType,
  selectedOrder,
  loading = false,
  onOk,
  onCancel,
}) {
  // Debug logging
  console.log("ConfirmActionModal props:", {
    visible,
    actionType,
    selectedOrder,
    loading
  });

  return (
    <Modal
      title={
        <Space>
          {actionType === "confirm" ? (
            <CheckOutlined style={{ color: "#52c41a" }} />
          ) : (
            <CloseOutlined style={{ color: "#ff4d4f" }} />
          )}
          <Text strong>
            {actionType === "confirm"
              ? "ยืนยันการชำระเงิน"
              : "ปฏิเสธการชำระเงิน"}
          </Text>
        </Space>
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={actionType === "confirm" ? "ยืนยัน" : "ปฏิเสธ"}
      cancelText="ยกเลิก"
      okButtonProps={{
        loading: loading,
        danger: actionType === "reject",
        style: {
          backgroundColor: actionType === "confirm" ? "#52c41a" : undefined,
          borderColor: actionType === "confirm" ? "#52c41a" : undefined,
          borderRadius: "6px",
        },
      }}
      cancelButtonProps={{
        disabled: loading,
        style: { borderRadius: "6px" },
      }}
    >
      <div style={{ padding: "16px 0" }}>
        <Text style={{ fontSize: "16px" }}>
          {actionType === "confirm"
            ? `ต้องการยืนยันการชำระเงินสำหรับคำสั่งซื้อ #${
                selectedOrder?.id ? selectedOrder.id.slice(-8) : "N/A"
              } หรือไม่?`
            : `ต้องการปฏิเสธการชำระเงินสำหรับคำสั่งซื้อ #${
                selectedOrder?.id ? selectedOrder.id.slice(-8) : "N/A"
              } หรือไม่?`}
        </Text>

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f6f6f6",
            borderRadius: "6px",
          }}
        >
          {actionType === "confirm" && (
            <Space>
              <CheckOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
              <Text style={{ color: "#52c41a" }}>
                ลูกค้าจะสามารถเข้าถึงเนื้อหาได้ทันที
              </Text>
            </Space>
          )}
          {actionType === "reject" && (
            <Space>
              <CloseOutlined style={{ color: "#ff4d4f", fontSize: "16px" }} />
              <Text style={{ color: "#ff4d4f" }}>
                คำสั่งซื้อจะถูกยกเลิกและลูกค้าจะได้รับแจ้งเตือน
              </Text>
            </Space>
          )}
        </div>
      </div>
    </Modal>
  );
}