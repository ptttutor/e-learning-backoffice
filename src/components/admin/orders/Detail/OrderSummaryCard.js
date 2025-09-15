import { Card, Space, Typography, Descriptions } from "antd";
import { DollarOutlined, CalculatorOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function OrderSummaryCard({ selectedOrder, formatPrice }) {
  return (
    <Card
      title={
        <Space>
          <CalculatorOutlined style={{ color: "#1890ff" }} />
          <Text strong>สรุปยอดสั่งซื้อ</Text>
        </Space>
      }
      style={{ marginBottom: "20px" }}
      size="small"
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item
          label={
            <Space size={6}>
              <DollarOutlined style={{ color: "#8c8c8c" }} />
              <Text>ราคาสินค้า</Text>
            </Space>
          }
        >
          <Text>{formatPrice(selectedOrder.subtotal || selectedOrder.total)}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={6}>
              <DollarOutlined style={{ color: "#8c8c8c" }} />
              <Text>ค่าจัดส่ง</Text>
            </Space>
          }
        >
          <Text>{formatPrice(selectedOrder.shippingFee || 0)}</Text>
        </Descriptions.Item>
        {selectedOrder.couponDiscount > 0 && (
          <Descriptions.Item
            label={
              <Space size={6}>
                <DollarOutlined style={{ color: "#8c8c8c" }} />
                <Text>ส่วนลด</Text>
              </Space>
            }
          >
            <Text style={{ color: "#52c41a" }}>
              -{formatPrice(selectedOrder.couponDiscount)}
            </Text>
          </Descriptions.Item>
        )}
        <Descriptions.Item
          label={
            <Space size={6}>
              <DollarOutlined style={{ color: "#8c8c8c" }} />
              <Text strong>ยอดรวมทั้งสิ้น</Text>
            </Space>
          }
        >
          <Text strong style={{ fontSize: "18px", color: "#52c41a" }}>
            {formatPrice(selectedOrder.total)}
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}