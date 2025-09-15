import { Card, Descriptions, Space, Typography } from "antd";
import { UserOutlined, FileTextOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function CustomerInfoCard({ selectedOrder }) {
  const user = selectedOrder?.user;
  return (
    <Card
      title={
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text strong>ข้อมูลลูกค้า</Text>
        </Space>
      }
      style={{ marginBottom: "20px" }}
      size="small"
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item
          label={
            <Space size={6}>
              <UserOutlined style={{ color: "#8c8c8c" }} />
              <Text>ชื่อ</Text>
            </Space>
          }
        >
          <Text strong>{user?.name || 'ไม่ระบุ'}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={6}>
              <FileTextOutlined style={{ color: "#8c8c8c" }} />
              <Text>อีเมล</Text>
            </Space>
          }
        >
          <Text>{user?.email || 'ไม่ระบุ'}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}