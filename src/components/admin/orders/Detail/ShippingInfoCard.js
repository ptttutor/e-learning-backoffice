import { Card, Space, Typography, Descriptions, Tag, Button, App } from "antd";
import {
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  FileTextOutlined,
  CopyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function ShippingInfoCard({ selectedOrder }) {
  const { message } = App.useApp();
  
  // Only render if shipping exists
  if (!selectedOrder.shipping) {
    return null;
  }

  // ฟังก์ชันรวมข้อมูลการจัดส่งทั้งหมดเป็นข้อความเดียว
  const getShippingText = () => {
    const shipping = selectedOrder.shipping;
    let lines = [];
    lines.push(`ผู้รับ: ${shipping.recipientName || "-"}`);
    lines.push(`เบอร์โทร: ${shipping.recipientPhone || "-"}`);
    lines.push(`ที่อยู่: ${shipping.address || "-"}, ${shipping.district || "-"}, ${shipping.province || "-"} ${shipping.postalCode || "-"}`);
    lines.push(`สถานะการจัดส่ง: ${shipping.status || "-"}`);
    if (shipping.trackingNumber) {
      lines.push(`เลขติดตาม: ${shipping.trackingNumber}`);
    }
    return lines.join("\n");
  };

  // ฟังก์ชัน copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShippingText());
      message.success("คัดลอกข้อมูลการจัดส่งสำเร็จ");
    } catch (e) {
      message.error("คัดลอกข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined style={{ color: "#1890ff" }} />
          <Text strong>ข้อมูลการจัดส่ง</Text>
        </Space>
      }
      extra={
        <Button
          icon={<CopyOutlined />}
          size="small"
          onClick={handleCopy}
          style={{ borderRadius: "6px" }}
        >
          คัดลอก
        </Button>
      }
      size="small"
    >
      <Descriptions column={1} size="small">
        <Descriptions.Item
          label={
            <Space size={6}>
              <UserOutlined style={{ color: "#8c8c8c" }} />
              <Text>ผู้รับ</Text>
            </Space>
          }
        >
          <Text strong>{selectedOrder.shipping.recipientName}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={6}>
              <PhoneOutlined style={{ color: "#8c8c8c" }} />
              <Text>เบอร์โทร</Text>
            </Space>
          }
        >
          <Text>{selectedOrder.shipping.recipientPhone}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={6}>
              <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
              <Text>ที่อยู่</Text>
            </Space>
          }
        >
          <Text>
            {selectedOrder.shipping.address}, {selectedOrder.shipping.district},{" "}
            {selectedOrder.shipping.province} {selectedOrder.shipping.postalCode}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label={<Text>สถานะการจัดส่ง</Text>}>
          <Tag
            color={
              selectedOrder.shipping.status === "DELIVERED"
                ? "success"
                : "processing"
            }
            style={{ borderRadius: "4px" }}
          >
            {selectedOrder.shipping.status}
          </Tag>
        </Descriptions.Item>
        {selectedOrder.shipping.trackingNumber && (
          <Descriptions.Item
            label={
              <Space size={6}>
                <FileTextOutlined style={{ color: "#8c8c8c" }} />
                <Text>เลขติดตาม</Text>
              </Space>
            }
          >
            <Text code>{selectedOrder.shipping.trackingNumber}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}