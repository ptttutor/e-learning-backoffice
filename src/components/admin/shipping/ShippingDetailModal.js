"use client";
import {
  Modal,
  Descriptions,
  Card,
  Space,
  Typography,
  Tag,
  Spin,
  Button,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  SendOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  InboxOutlined,
  CarOutlined,
  CopyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function ShippingDetailModal({
  open,
  onClose,
  shipment,
  loading,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "default";
      case "PROCESSING":
        return "processing";
      case "SHIPPED":
        return "warning";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "รอดำเนินการ";
      case "PROCESSING":
        return "กำลังเตรียม";
      case "SHIPPED":
        return "จัดส่งแล้ว";
      case "DELIVERED":
        return "ส่งถึงแล้ว";
      case "CANCELLED":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const getCompanyIcon = (company) => {
    switch (company) {
      case "KERRY":
        return <TruckOutlined style={{ color: "#52c41a" }} />;
      case "THAILAND_POST":
        return <SendOutlined style={{ color: "#1890ff" }} />;
      case "JT_EXPRESS":
        return <InboxOutlined style={{ color: "#722ed1" }} />;
      case "FLASH_EXPRESS":
        return <ThunderboltOutlined style={{ color: "#fa8c16" }} />;
      case "NINJA_VAN":
        return <RocketOutlined style={{ color: "#eb2f96" }} />;
      default:
        return <CarOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getCompanyName = (company) => {
    switch (company) {
      case "KERRY":
        return "Kerry Express";
      case "THAILAND_POST":
        return "ไปรษณีย์ไทย";
      case "JT_EXPRESS":
        return "J&T Express";
      case "FLASH_EXPRESS":
        return "Flash Express";
      case "NINJA_VAN":
        return "Ninja Van";
      case "PENDING":
        return "รอเลือก";
      default:
        return company || "ไม่ระบุ";
    }
  };

  // ฟังก์ชันรวมข้อมูลทั้งหมดเป็นข้อความเดียว
  const getAllShippingText = () => {
    if (!shipment) return "";
    let lines = [];
    lines.push(`ชื่อผู้รับ: ${shipment.recipientName || "-"}`);
    lines.push(`เบอร์โทร: ${shipment.recipientPhone || "-"}`);
    lines.push(`ที่อยู่: ${shipment.address || "-"}`);
    lines.push(`ตำบล/แขวง: ${shipment.district || "-"}`);
    lines.push(`จังหวัด: ${shipment.province || "-"}`);
    lines.push(`รหัสไปรษณีย์: ${shipment.postalCode || "-"}`);
    lines.push(`ประเทศ: ${shipment.country || "-"}`);
    lines.push(`บริษัทขนส่ง: ${getCompanyName(shipment.shippingMethod)}`);
    lines.push(`สถานะ: ${getStatusText(shipment.status)}`);
    lines.push(`เลขติดตาม: ${shipment.trackingNumber || "-"}`);
    lines.push(`วันที่จัดส่ง: ${formatDate(shipment.shippedAt)}`);
    lines.push(`วันที่ส่งถึง: ${formatDate(shipment.deliveredAt)}`);
    lines.push(`หมายเหตุ: ${shipment.notes || "-"}`);
    if (shipment.order) {
      lines.push(`รหัสคำสั่งซื้อ: #${shipment.order.id?.slice(-8)}`);
      lines.push(`ลูกค้า: ${shipment.order.user?.name || "-"}`);
      lines.push(
        `สินค้า: ${shipment.order.ebook?.title || shipment.order.course?.title || "-"}`
      );
      lines.push(
        `ประเภท: ${
          shipment.order.ebook
            ? "E-book"
            : shipment.order.course
            ? "Course"
            : "อื่นๆ"
        }`
      );
      lines.push(`วันที่สั่งซื้อ: ${formatDate(shipment.order.createdAt)}`);
      lines.push(`สถานะคำสั่งซื้อ: ${shipment.order.status || "-"}`);
    }
    return lines.join("\n");
  };

  // ฟังก์ชัน copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getAllShippingText());
    } catch (e) {
      alert("คัดลอกข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <Text strong>
            รายละเอียดการจัดส่ง #{shipment?.orderId?.slice(-8) || "..."}{" "}
          </Text>
          {/* ปุ่มคัดลอก */}
          {shipment && (
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={handleCopy}
              style={{ marginLeft: 8 }}
            >
              คัดลอกข้อมูล
            </Button>
          )}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px", fontSize: "16px", color: "#666" }}>
            กำลังโหลดรายละเอียด...
          </div>
        </div>
      ) : shipment ? (
        <div>
          {/* Recipient Information */}
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: "#1890ff" }} />
                <Text strong>ข้อมูลผู้รับ</Text>
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
                    <Text>ชื่อผู้รับ</Text>
                  </Space>
                }
              >
                <Text strong>{shipment.recipientName}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <PhoneOutlined style={{ color: "#8c8c8c" }} />
                    <Text>เบอร์โทร</Text>
                  </Space>
                }
              >
                <Text>{shipment.recipientPhone}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                    <Text>ที่อยู่</Text>
                  </Space>
                }
                span={2}
              >
                <Text>{shipment.address}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text>ตำบล/แขวง</Text>}>
                <Text>{shipment.district}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text>จังหวัด</Text>}>
                <Text>{shipment.province}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text>รหัสไปรษณีย์</Text>}>
                <Text>{shipment.postalCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text>ประเทศ</Text>}>
                <Text>{shipment.country}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Shipping Information */}
          <Card
            title={
              <Space>
                <TruckOutlined style={{ color: "#1890ff" }} />
                <Text strong>ข้อมูลการจัดส่ง</Text>
              </Space>
            }
            style={{ marginBottom: "20px" }}
            size="small"
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <TruckOutlined style={{ color: "#8c8c8c" }} />
                    <Text>บริษัทขนส่ง</Text>
                  </Space>
                }
              >
                <Space size={8}>
                  <span style={{ fontSize: "16px" }}>
                    {getCompanyIcon(shipment.shippingMethod)}
                  </span>
                  <Text>
                    {getCompanyName(shipment.shippingMethod)}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={<Text>สถานะ</Text>}>
                <Tag
                  color={getStatusColor(shipment.status)}
                  style={{ borderRadius: "4px" }}
                >
                  {getStatusText(shipment.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <FileTextOutlined style={{ color: "#8c8c8c" }} />
                    <Text>เลขติดตาม</Text>
                  </Space>
                }
              >
                {shipment.trackingNumber ? (
                  <Text code>{shipment.trackingNumber}</Text>
                ) : (
                  <Text type="secondary">-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <CalendarOutlined style={{ color: "#8c8c8c" }} />
                    <Text>วันที่จัดส่ง</Text>
                  </Space>
                }
              >
                <Text>{formatDate(shipment.shippedAt)}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <CalendarOutlined style={{ color: "#8c8c8c" }} />
                    <Text>วันที่ส่งถึง</Text>
                  </Space>
                }
              >
                <Text>{formatDate(shipment.deliveredAt)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text>หมายเหตุ</Text>}>
                <Text>{shipment.notes || "-"}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Order Information */}
          {shipment.order && (
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined style={{ color: "#1890ff" }} />
                  <Text strong>ข้อมูลคำสั่งซื้อ</Text>
                </Space>
              }
              size="small"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <FileTextOutlined style={{ color: "#8c8c8c" }} />
                      <Text>รหัสคำสั่งซื้อ</Text>
                    </Space>
                  }
                >
                  <Text code>#{shipment.order.id.slice(-8)}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <UserOutlined style={{ color: "#8c8c8c" }} />
                      <Text>ลูกค้า</Text>
                    </Space>
                  }
                >
                  <Text strong>{shipment.order.user?.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>สินค้า</Text>} span={2}>
                  <Space direction="vertical" size={4}>
                    <Space size={8}>
                      <Text strong>
                        {shipment.order.ebook?.title ||
                          shipment.order.course?.title}
                      </Text>
                      <Tag
                        color={
                          shipment.order.ebook
                            ? "blue"
                            : shipment.order.course
                            ? "green"
                            : "default"
                        }
                        style={{ fontSize: "11px" }}
                      >
                        {shipment.order.ebook
                          ? "📚 E-book"
                          : shipment.order.course
                          ? "🎓 Course"
                          : "อื่นๆ"}
                      </Tag>
                    </Space>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <CalendarOutlined style={{ color: "#8c8c8c" }} />
                      <Text>วันที่สั่งซื้อ</Text>
                    </Space>
                  }
                >
                  <Text>{formatDate(shipment.order.createdAt)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>สถานะคำสั่งซื้อ</Text>}>
                  <Tag color="success">{shipment.order.status}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Text type="secondary">ไม่พบข้อมูล</Text>
        </div>
      )}
    </Modal>
  );
}