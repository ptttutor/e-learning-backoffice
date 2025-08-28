"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Tag,
  message,
  Image,
  Descriptions,
  Card,
  Typography,
  Avatar,
  Divider,
  Spin,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  DollarOutlined,
  CalendarOutlined,
  BankOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (order) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    setSelectedOrder(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`);
      const result = await response.json();

      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        message.error(result.error || "เกิดข้อผิดพลาดในการโหลดรายละเอียด");
        setDetailModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดรายละเอียด");
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmPayment = (order) => {
    setSelectedOrder(order);
    setActionType("confirm");
    setConfirmModalVisible(true);
  };

  const handleRejectPayment = (order) => {
    setSelectedOrder(order);
    setActionType("reject");
    setConfirmModalVisible(true);
  };

  const executeAction = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionType,
          paymentStatus: actionType === "confirm" ? "COMPLETED" : "FAILED",
          orderStatus: actionType === "confirm" ? "COMPLETED" : "CANCELLED",
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success(
          actionType === "confirm"
            ? "ยืนยันการชำระเงินสำเร็จ"
            : "ปฏิเสธการชำระเงินสำเร็จ"
        );
        fetchOrders();
        setConfirmModalVisible(false);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("เกิดข้อผิดพลาดในการอัพเดทคำสั่งซื้อ");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH");
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING_PAYMENT":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING_VERIFICATION":
        return "processing";
      case "FAILED":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "รหัสคำสั่งซื้อ",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id.slice(-8)}`,
      width: 120,
    },
    {
      title: "ลูกค้า",
      dataIndex: "user",
      key: "customer",
      render: (user) => (
        <Space size={12}>
          <Avatar icon={<UserOutlined />} size="default" />
          <div>
            <div>
              <Text strong>{user.name}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {user.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: 200,
    },
    {
      title: "สินค้า",
      key: "product",
      render: (_, record) => (
        <Space size={12}>
          {record.ebook?.coverImageUrl ? (
            <Image
              src={record.ebook.coverImageUrl}
              alt={record.ebook.title}
              width={40}
              height={40}
              style={{ objectFit: "cover", borderRadius: "6px" }}
              preview={false}
            />
          ) : (
            <Avatar
              icon={
                record.orderType === "EBOOK" ? (
                  <ReadOutlined />
                ) : (
                  <BookOutlined />
                )
              }
              size={40}
              style={{ backgroundColor: "#1890ff" }}
            />
          )}
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {record.ebook?.title || record.course?.title}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.orderType === "EBOOK" ? "หนังสือ" : "คอร์ส"}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: 250,
    },
    {
      title: "ยอดรวม",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <Space size={8}>
          <DollarOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
          <Text strong style={{ color: "#52c41a", fontSize: "14px" }}>
            {formatPrice(total)}
          </Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: "สถานะคำสั่งซื้อ",
      dataIndex: "status",
      key: "orderStatus",
      render: (status) => (
        <Tag color={getOrderStatusColor(status)}>
          {status === "COMPLETED"
            ? "สำเร็จ"
            : status === "PENDING_PAYMENT"
            ? "รอตรวจสอบ"
            : status === "CANCELLED"
            ? "ยกเลิก"
            : status}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "สถานะการชำระเงิน",
      dataIndex: "payment",
      key: "paymentStatus",
      render: (payment) => (
        <Tag color={getPaymentStatusColor(payment?.status)}>
          {payment?.status === "COMPLETED"
            ? "ชำระแล้ว"
            : payment?.status === "PENDING_VERIFICATION"
            ? "รอตรวจสอบ"
            : payment?.status === "FAILED"
            ? "ไม่สำเร็จ"
            : "รอชำระ"}
        </Tag>
      ),
      width: 130,
    },
    {
      title: "วันที่สั่งซื้อ",
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

          {record.payment?.status === "PENDING_VERIFICATION" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  borderRadius: "6px",
                }}
                onClick={() => handleConfirmPayment(record)}
              >
                ยืนยัน
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                style={{ borderRadius: "6px" }}
                onClick={() => handleRejectPayment(record)}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
        </Space>
      ),
      width: 200,
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
            <ShoppingCartOutlined style={{ marginRight: "8px" }} />
            จัดการคำสั่งซื้อ
          </Title>
          <Text type="secondary">ตรวจสอบและอนุมัติการชำระเงิน</Text>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
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
              รายละเอียดคำสั่งซื้อ #{selectedOrder?.id?.slice(-8) || "..."}
            </Text>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={900}
        style={{ top: 20 }}
        loading={detailLoading}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px", fontSize: "16px", color: "#666" }}>
              กำลังโหลดรายละเอียด...
            </div>
          </div>
        ) : selectedOrder ? (
          <div>
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
                  <Text strong>{selectedOrder.user.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <FileTextOutlined style={{ color: "#8c8c8c" }} />
                      <Text>อีเมล</Text>
                    </Space>
                  }
                >
                  <Text>{selectedOrder.user.email}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

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
                      {selectedOrder.orderType === "EBOOK"
                        ? "หนังสือ"
                        : "คอร์ส"}
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

            <Card
              title={
                <Space>
                  <BankOutlined style={{ color: "#1890ff" }} />
                  <Text strong>ข้อมูลการชำระเงิน</Text>
                </Space>
              }
              style={{ marginBottom: "20px" }}
              size="small"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <BankOutlined style={{ color: "#8c8c8c" }} />
                      <Text>วิธีการชำระ</Text>
                    </Space>
                  }
                >
                  <Text>
                    {selectedOrder.payment?.method === "bank_transfer"
                      ? "โอนเงินผ่านธนาคาร"
                      : selectedOrder.payment?.method}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>สถานะ</Text>}>
                  <Tag
                    color={getPaymentStatusColor(selectedOrder.payment?.status)}
                    style={{ borderRadius: "4px" }}
                  >
                    {selectedOrder.payment?.status === "COMPLETED"
                      ? "ชำระแล้ว"
                      : selectedOrder.payment?.status === "PENDING_VERIFICATION"
                      ? "รอตรวจสอบ"
                      : selectedOrder.payment?.status === "FAILED"
                      ? "ไม่สำเร็จ"
                      : "รอชำระ"}
                  </Tag>
                </Descriptions.Item>
                {selectedOrder.payment?.ref && (
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <FileTextOutlined style={{ color: "#8c8c8c" }} />
                        <Text>เลขอ้างอิง</Text>
                      </Space>
                    }
                  >
                    <Text code>{selectedOrder.payment.ref}</Text>
                  </Descriptions.Item>
                )}
                {selectedOrder.payment?.paidAt && (
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <CalendarOutlined style={{ color: "#8c8c8c" }} />
                        <Text>วันที่ชำระ</Text>
                      </Space>
                    }
                  >
                    <Text>{formatDate(selectedOrder.payment.paidAt)}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Transfer Slip Preview (if available) */}
              {selectedOrder.payment?.method === "bank_transfer" && (
                <div style={{ marginTop: "20px" }}>
                  <Divider style={{ margin: "16px 0" }} />
                  <Title level={5} style={{ marginBottom: "12px" }}>
                    <FileTextOutlined
                      style={{ color: "#1890ff", marginRight: "8px" }}
                    />
                    หลักฐานการโอนเงิน
                  </Title>

                  {selectedOrder.payment?.slipUrl ? (
                    <Card
                      style={{
                        textAlign: "center",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Image
                        src={selectedOrder.payment.slipUrl}
                        alt="หลักฐานการโอนเงิน"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "400px",
                          borderRadius: "6px",
                          border: "1px solid #f0f0f0",
                        }}
                        preview={{
                          mask: (
                            <Space direction="vertical" align="center">
                              <EyeOutlined style={{ fontSize: "24px" }} />
                              <Text style={{ color: "white" }}>ดูรูปเต็ม</Text>
                            </Space>
                          ),
                        }}
                      />
                      <div style={{ marginTop: "12px" }}>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          คลิกที่รูปเพื่อดูขนาดเต็ม
                        </Text>
                      </div>
                    </Card>
                  ) : (
                    <Card
                      style={{
                        textAlign: "center",
                        backgroundColor: "#fafafa",
                        border: "1px dashed #d9d9d9",
                        borderRadius: "8px",
                      }}
                      bodyStyle={{ padding: "24px" }}
                    >
                      <Space direction="vertical" size={12}>
                        <FileTextOutlined
                          style={{ fontSize: "48px", color: "#d9d9d9" }}
                        />
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          ไม่มีหลักฐานการโอนเงิน
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          ลูกค้ายังไม่ได้อัพโหลดสลิปการโอนเงิน
                        </Text>
                      </Space>
                    </Card>
                  )}
                </div>
              )}
            </Card>

            {selectedOrder.shipping && (
              <Card
                title={
                  <Space>
                    <EnvironmentOutlined style={{ color: "#1890ff" }} />
                    <Text strong>ข้อมูลการจัดส่ง</Text>
                  </Space>
                }
                size="small"
              >
                <Descriptions column={2} size="small">
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
                    span={2}
                  >
                    <Text>
                      {selectedOrder.shipping.address},{" "}
                      {selectedOrder.shipping.district},{" "}
                      {selectedOrder.shipping.province}{" "}
                      {selectedOrder.shipping.postalCode}
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

      {/* Confirm Action Modal */}
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
        open={confirmModalVisible}
        onOk={executeAction}
        onCancel={() => setConfirmModalVisible(false)}
        okText={actionType === "confirm" ? "ยืนยัน" : "ปฏิเสธ"}
        cancelText="ยกเลิก"
        okButtonProps={{
          danger: actionType === "reject",
          style: {
            backgroundColor: actionType === "confirm" ? "#52c41a" : undefined,
            borderColor: actionType === "confirm" ? "#52c41a" : undefined,
            borderRadius: "6px",
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: "6px" },
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text style={{ fontSize: "16px" }}>
            {actionType === "confirm"
              ? `ต้องการยืนยันการชำระเงินสำหรับคำสั่งซื้อ #${selectedOrder?.id?.slice(
                  -8
                )} หรือไม่?`
              : `ต้องการปฏิเสธการชำระเงินสำหรับคำสั่งซื้อ #${selectedOrder?.id?.slice(
                  -8
                )} หรือไม่?`}
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
    </div>
  );
}
