import { Card, Space, Typography, Image, Avatar } from "antd";
import { BookOutlined, ReadOutlined, DollarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ProductInfoCard({ selectedOrder, formatPrice }) {
  return (
    <Card
      title={
        <Space>
          {selectedOrder.orderType === "EBOOK" ? (
            <ReadOutlined style={{ color: "#1890ff" }} />
          ) : (
            <BookOutlined style={{ color: "#1890ff" }} />
          )}
          <Text strong>ข้อมูลสินค้า</Text>
        </Space>
      }
      style={{ marginBottom: "20px" }}
      size="small"
    >
      <Space align="start" size={20}>
        {selectedOrder.ebook?.coverImageUrl ? (
          <Image
            src={selectedOrder.ebook.coverImageUrl}
            alt={selectedOrder.ebook.title}
            width={100}
            height={100}
            style={{
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
            }}
          />
        ) : (
          <Avatar
            icon={
              selectedOrder.orderType === "EBOOK" ? (
                <ReadOutlined />
              ) : (
                <BookOutlined />
              )
            }
            size={100}
            style={{ backgroundColor: "#1890ff" }}
          />
        )}
        <div style={{ flex: 1 }}>
          <Title
            level={4}
            style={{ margin: "0 0 12px 0", color: "#262626" }}
          >
            {selectedOrder.ebook?.title || selectedOrder.course?.title}
          </Title>
          <Space direction="vertical" size={6}>
            <Text type="secondary">
              ประเภท:{" "}
              {selectedOrder.orderType === "EBOOK" ? "หนังสือ" : "คอร์ส"}
            </Text>
            {selectedOrder.ebook?.author && (
              <Text type="secondary">
                ผู้แต่ง: {selectedOrder.ebook.author}
              </Text>
            )}
            <Space size={8}>
              <DollarOutlined
                style={{ color: "#52c41a", fontSize: "18px" }}
              />
              <Text
                strong
                style={{ fontSize: "20px", color: "#52c41a" }}
              >
                {formatPrice(selectedOrder.total)}
              </Text>
            </Space>
          </Space>
        </div>
      </Space>
    </Card>
  );
}