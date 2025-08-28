"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Card,
  Typography,
  Avatar,
  Descriptions,
  Spin,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  TruckOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CarOutlined,
  SendOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  InboxOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const { Option } = Select;

export default function AdminShippingPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch("/api/admin/shipping");
      const result = await response.json();

      if (result.success) {
        setShipments(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (shipment) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    setSelectedShipment(null);

    try {
      const response = await fetch(`/api/admin/shipping/${shipment.id}`);
      const result = await response.json();

      if (result.success) {
        setSelectedShipment(result.data);
      } else {
        message.error(result.error || "เกิดข้อผิดพลาดในการโหลดรายละเอียด");
        setDetailModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching shipment detail:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดรายละเอียด");
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateShipping = (shipment) => {
    setSelectedShipment(shipment);
    form.setFieldsValue({
      shippingCompany: shipment.shippingMethod || "PENDING",
      status: shipment.status,
      trackingNumber: shipment.trackingNumber || "",
      notes: shipment.notes || "",
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const response = await fetch(
        `/api/admin/shipping/${selectedShipment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success("อัพเดทข้อมูลการจัดส่งสำเร็จ");
        fetchShipments();
        setUpdateModalVisible(false);
        form.resetFields();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error updating shipment:", error);
      message.error("เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
    }
  };

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

  const columns = [
    {
      title: "รหัสคำสั่งซื้อ",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId) => `#${orderId.slice(-8)}`,
      width: 120,
    },
    {
      title: "ผู้รับ",
      dataIndex: "recipientName",
      key: "recipientName",
      render: (name, record) => (
        <Space size={12}>
          <Avatar icon={<UserOutlined />} size="default" />
          <div>
            <div>
              <Text strong>{name}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <PhoneOutlined style={{ marginRight: "4px" }} />
                {record.recipientPhone}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: 200,
    },

    {
      title: "ที่อยู่",
      key: "address",
      render: (_, record) => (
        <Space size={8}>
          <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
          <div style={{ maxWidth: "200px" }}>
            <div>
              <Text style={{ fontSize: "14px" }}>{record.address}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.district}, {record.province} {record.postalCode}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: 220,
    },
    {
      title: "บริษัทขนส่ง",
      dataIndex: "shippingMethod",
      key: "shippingMethod",
      render: (company) => (
        <Space size={8}>
          <span style={{ fontSize: "16px" }}>{getCompanyIcon(company)}</span>
          <Text style={{ fontSize: "13px" }}>{getCompanyName(company)}</Text>
        </Space>
      ),
      width: 130,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 120,
    },
    {
      title: "เลขติดตาม",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      render: (trackingNumber) =>
        trackingNumber ? (
          <Text code style={{ fontSize: "12px" }}>
            {trackingNumber}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
      width: 150,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
            style={{ borderRadius: "6px" }}
          >
            ดูรายละเอียด
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleUpdateShipping(record)}
            style={{ borderRadius: "6px" }}
          >
            อัพเดท
          </Button>
        </Space>
      ),
      width: 180,
      fixed: "right",
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <TruckOutlined style={{ marginRight: "8px" }} />
            จัดการการจัดส่ง
          </Title>
          <Text type="secondary">ติดตามและอัพเดทสถานะการจัดส่งสินค้า</Text>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={shipments}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <Text strong>
              รายละเอียดการจัดส่ง #
              {selectedShipment?.orderId?.slice(-8) || "..."}
            </Text>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedShipment(null);
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px", fontSize: "16px", color: "#666" }}>
              กำลังโหลดรายละเอียด...
            </div>
          </div>
        ) : selectedShipment ? (
          <div>
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
                  <Text strong>{selectedShipment.recipientName}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <PhoneOutlined style={{ color: "#8c8c8c" }} />
                      <Text>เบอร์โทร</Text>
                    </Space>
                  }
                >
                  <Text>{selectedShipment.recipientPhone}</Text>
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
                  <Text>{selectedShipment.address}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>ตำบล/แขวง</Text>}>
                  <Text>{selectedShipment.district}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>จังหวัด</Text>}>
                  <Text>{selectedShipment.province}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>รหัสไปรษณีย์</Text>}>
                  <Text>{selectedShipment.postalCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>ประเทศ</Text>}>
                  <Text>{selectedShipment.country}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

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
                      {getCompanyIcon(selectedShipment.shippingMethod)}
                    </span>
                    <Text>
                      {getCompanyName(selectedShipment.shippingMethod)}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>สถานะ</Text>}>
                  <Tag
                    color={getStatusColor(selectedShipment.status)}
                    style={{ borderRadius: "4px" }}
                  >
                    {getStatusText(selectedShipment.status)}
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
                  {selectedShipment.trackingNumber ? (
                    <Text code>{selectedShipment.trackingNumber}</Text>
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
                  <Text>{formatDate(selectedShipment.shippedAt)}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <CalendarOutlined style={{ color: "#8c8c8c" }} />
                      <Text>วันที่ส่งถึง</Text>
                    </Space>
                  }
                >
                  <Text>{formatDate(selectedShipment.deliveredAt)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>หมายเหตุ</Text>}>
                  <Text>{selectedShipment.notes || "-"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedShipment.order && (
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
                    <Text code>#{selectedShipment.order.id.slice(-8)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <UserOutlined style={{ color: "#8c8c8c" }} />
                        <Text>ลูกค้า</Text>
                      </Space>
                    }
                  >
                    <Text strong>{selectedShipment.order.user?.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text>สินค้า</Text>} span={2}>
                    <Text>
                      {selectedShipment.order.ebook?.title ||
                        selectedShipment.order.course?.title}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <DollarOutlined style={{ color: "#52c41a" }} />
                        <Text>ยอดรวม</Text>
                      </Space>
                    }
                  >
                    <Text strong style={{ color: "#52c41a" }}>
                      {new Intl.NumberFormat("th-TH", {
                        style: "currency",
                        currency: "THB",
                      }).format(selectedShipment.order.total)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Space direction="vertical" size={16}>
              <Text type="secondary">ไม่สามารถโหลดข้อมูลได้</Text>
            </Space>
          </div>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <Text strong>อัพเดทข้อมูลการจัดส่ง</Text>
          </Space>
        }
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item
            name="shippingCompany"
            label="บริษัทขนส่ง"
            rules={[{ required: true, message: "กรุณาเลือกบริษัทขนส่ง" }]}
          >
            <Select placeholder="เลือกบริษัทขนส่ง">
              <Option value="KERRY">
                <Space>
                  <TruckOutlined style={{ color: "#52c41a" }} />
                  Kerry Express
                </Space>
              </Option>
              <Option value="THAILAND_POST">
                <Space>
                  <SendOutlined style={{ color: "#1890ff" }} />
                  ไปรษณีย์ไทย
                </Space>
              </Option>
              <Option value="JT_EXPRESS">
                <Space>
                  <InboxOutlined style={{ color: "#722ed1" }} />
                  J&T Express
                </Space>
              </Option>
              <Option value="FLASH_EXPRESS">
                <Space>
                  <ThunderboltOutlined style={{ color: "#fa8c16" }} />
                  Flash Express
                </Space>
              </Option>
              <Option value="NINJA_VAN">
                <Space>
                  <RocketOutlined style={{ color: "#eb2f96" }} />
                  Ninja Van
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="สถานะการจัดส่ง"
            rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Option value="PENDING">รอดำเนินการ</Option>
              <Option value="PROCESSING">กำลังเตรียม</Option>
              <Option value="SHIPPED">จัดส่งแล้ว</Option>
              <Option value="DELIVERED">ส่งถึงแล้ว</Option>
              <Option value="CANCELLED">ยกเลิก</Option>
            </Select>
          </Form.Item>

          <Form.Item name="trackingNumber" label="เลขติดตาม">
            <Input placeholder="ใส่เลขติดตามพัสดุ" />
          </Form.Item>

          <Form.Item name="notes" label="หมายเหตุ">
            <Input.TextArea rows={3} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<TruckOutlined />}
                style={{ borderRadius: "6px" }}
              >
                อัพเดท
              </Button>
              <Button
                onClick={() => {
                  setUpdateModalVisible(false);
                  form.resetFields();
                }}
                style={{ borderRadius: "6px" }}
              >
                ยกเลิก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
