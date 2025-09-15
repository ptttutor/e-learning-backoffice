import { Card, Space, Typography, Descriptions } from "antd";
import { FileTextOutlined, DollarOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function CouponInfoCard({ selectedOrder, formatPrice }) {
  // Only render if coupon exists
  if (!selectedOrder.coupon) {
    return null;
  }

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <Text strong>ข้อมูลคูปองส่วนลด</Text>
        </Space>
      }
      style={{ marginBottom: "20px" }}
      size="small"
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item
          label={
            <Space size={6}>
              <FileTextOutlined style={{ color: "#8c8c8c" }} />
              <Text>รหัสคูปอง</Text>
            </Space>
          }
        >
          <Text code>{selectedOrder.couponCode}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={6}>
              <FileTextOutlined style={{ color: "#8c8c8c" }} />
              <Text>ชื่อคูปอง</Text>
            </Space>
          }
        >
          <Text>{selectedOrder.coupon.name}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={6}>
              <DollarOutlined style={{ color: "#8c8c8c" }} />
              <Text>ส่วนลด</Text>
            </Space>
          }
        >
          <Text style={{ color: "#52c41a" }}>
            {selectedOrder.coupon.type === "PERCENTAGE"
              ? `${selectedOrder.coupon.value}%`
              : formatPrice(selectedOrder.coupon.value)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={6}>
              <DollarOutlined style={{ color: "#8c8c8c" }} />
              <Text>จำนวนเงินที่ลด</Text>
            </Space>
          }
        >
          <Text style={{ color: "#52c41a" }}>
            -{formatPrice(selectedOrder.couponDiscount)}
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}