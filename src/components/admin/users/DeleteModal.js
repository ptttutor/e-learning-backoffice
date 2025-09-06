import { Modal, Typography, Space, Avatar } from "antd";
import { ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

export default function DeleteModal({ open, user, loading, onConfirm, onCancel }) {
  if (!user) return null;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          ยืนยันการลบผู้ใช้
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      confirmLoading={loading}
      okText="ลบผู้ใช้"
      cancelText="ยกเลิก"
      okButtonProps={{ danger: true }}
      width={500}
    >
      <div style={{ padding: "20px 0" }}>
        {/* Warning Message */}
        <div
          style={{
            background: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "6px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <Text style={{ color: "#cf1322" }}>
            <strong>คำเตือน:</strong> การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </Text>
        </div>

        {/* User Information */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Avatar
            size={64}
            src={user.image && user.image.trim() ? user.image : null}
            icon={<UserOutlined />}
            style={{
              backgroundColor: user.image && user.image.trim() ? "transparent" : "#ff4d4f",
              marginBottom: "12px",
            }}
          />
          <Title level={4} style={{ margin: "8px 0" }}>
            {user.name || "ไม่ระบุชื่อ"}
          </Title>
          <Text type="secondary">{user.email}</Text>
        </div>

        {/* Confirmation Text */}
        <div style={{ textAlign: "center" }}>
          <Text>
            คุณแน่ใจหรือไม่ที่ต้องการลบผู้ใช้ <strong>&quot;{user.name || user.email}&quot;</strong>?
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            ข้อมูลทั้งหมดของผู้ใช้จะถูกลบออกจากระบบอย่างถาวร
          </Text>
        </div>

        {/* Impact Warning */}
        <div
          style={{
            background: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: "6px",
            padding: "12px",
            marginTop: "16px",
          }}
        >
          <Text style={{ fontSize: "12px", color: "#d48806" }}>
            <strong>ข้อมูลที่จะถูกลบ:</strong>
          </Text>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li style={{ fontSize: "12px", color: "#d48806" }}>ข้อมูลผู้ใช้และโปรไฟล์</li>
            <li style={{ fontSize: "12px", color: "#d48806" }}>ประวัติการเรียน (หากมี)</li>
            <li style={{ fontSize: "12px", color: "#d48806" }}>คำสั่งซื้อที่เกี่ยวข้อง (หากมี)</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
