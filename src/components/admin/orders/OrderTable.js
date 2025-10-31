"use client";
import {
  Table,
  Button,
  Space,
  Tag,
  Image,
  Avatar,
  Typography,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function OrderTable({
  orders,
  loading,
  actionLoading = false,
  onViewDetail,
  onConfirmPayment,
  onRejectPayment,
}) {
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
      case "PENDING":
        return "warning";
      case "PENDING_VERIFICATION":
        return "processing";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "สำเร็จ";
      case "PENDING":
        return "รอชำระเงิน";
      case "PENDING_VERIFICATION":
        return "รอตรวจสอบ";
      case "CANCELLED":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING":
        return "warning";
      case "PENDING_VERIFICATION":
        return "processing";
      case "REJECTED":
        return "error";
      case "FREE":
        return "cyan";
      default:
        return "default";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "ชำระแล้ว";
      case "PENDING":
        return "รอชำระ";
      case "PENDING_VERIFICATION":
        return "รอตรวจสอบ";
      case "REJECTED":
        return "ปฏิเสธ";
      case "FREE":
        return "ฟรี";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "รหัสคำสั่งซื้อ",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id.slice(-8)}`,
      width: "10%",
      ellipsis: true,
    },
    {
      title: "ลูกค้า",
      dataIndex: "user",
      key: "customer",
      render: (user) => (
        <Space size={8}>
          <Avatar icon={<UserOutlined />} size="small" />
          <div style={{ minWidth: 0 }}>
            <div>
              <Text strong style={{ fontSize: "13px" }} ellipsis>
                {user.name}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "11px" }} ellipsis>
                {user.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: "20%",
      ellipsis: true,
    },
    {
      title: "สินค้า",
      key: "product",
      render: (_, record) => {
        // Display items from OrderItem array if available, otherwise fallback to course/ebook
        const items = record.items && record.items.length > 0 ? record.items : [
          {
            title: record.ebook?.title || record.course?.title,
            itemType: record.orderType,
            quantity: 1,
            unitPrice: record.total
          }
        ];

        return (
          <div style={{ minWidth: 0 }}>
            {items.map((item, index) => (
              <div key={index} style={{ marginBottom: index < items.length - 1 ? "4px" : 0 }}>
                <Space size={6}>
                  <Avatar
                    icon={
                      item.itemType === "EBOOK" ? (
                        <ReadOutlined />
                      ) : (
                        <BookOutlined />
                      )
                    }
                    size={24}
                    style={{ backgroundColor: item.itemType === "EBOOK" ? "#722ed1" : "#1890ff" }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div>
                      <Text strong style={{ fontSize: "12px" }} ellipsis title={item.title}>
                        {item.title}
                      </Text>
                      {item.quantity > 1 && (
                        <Text type="secondary" style={{ fontSize: "11px", marginLeft: "4px" }}>
                          x{item.quantity}
                        </Text>
                      )}
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: "10px" }}>
                        {item.itemType === "EBOOK" ? "หนังสือ" : "คอร์ส"}
                        {item.unitPrice && (
                          <span style={{ marginLeft: "4px" }}>
                            {formatPrice(item.unitPrice)}
                          </span>
                        )}
                      </Text>
                    </div>
                  </div>
                </Space>
              </div>
            ))}
            {items.length > 1 && (
              <div style={{ marginTop: "4px", paddingTop: "4px", borderTop: "1px solid #f0f0f0" }}>
                <Text type="secondary" style={{ fontSize: "10px" }}>
                  รวม {items.length} รายการ
                </Text>
              </div>
            )}
          </div>
        );
      },
      width: "25%",
      ellipsis: true,
    },
    {
      title: "ยอดรวม",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <div>
          <DollarOutlined style={{ color: "#52c41a", fontSize: "14px", marginRight: "4px" }} />
          <Text strong style={{ color: "#52c41a", fontSize: "13px" }}>
            {formatPrice(total)}
          </Text>
        </div>
      ),
      width: "12%",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "orderStatus",
      render: (status) => (
        <Tag color={getOrderStatusColor(status)} style={{ fontSize: "11px" }}>
          {getOrderStatusText(status)}
        </Tag>
      ),
      width: "10%",
    },
    {
      title: "การชำระ",
      dataIndex: "payment",
      key: "paymentStatus",
      render: (payment) => (
        <div>
          <Tag color={getPaymentStatusColor(payment?.status)} style={{ fontSize: "11px" }}>
            {getPaymentStatusText(payment?.status)}
          </Tag>
          {payment?.slipUrl && (
            <div style={{ marginTop: "2px" }}>
              <Tag color="blue" size="small" style={{ fontSize: "10px" }}>
                <FileDoneOutlined style={{ fontSize: "10px" }}/> สลิป
              </Tag>
            </div>
          )}
        </div>
      ),
      width: "10%",
    },
    {
      title: "วันที่",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div>
          <CalendarOutlined style={{ color: "#8c8c8c", fontSize: "12px", marginRight: "4px" }} />
          <Text style={{ fontSize: "12px" }}>{formatDate(date)}</Text>
        </div>
      ),
      width: "13%",
      ellipsis: true,
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space size={4} wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            disabled={actionLoading}
            onClick={() => onViewDetail(record)}
            style={{ borderRadius: "4px" }}
          >
            ดู
          </Button>

          {record.payment?.status === "PENDING_VERIFICATION" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                disabled={actionLoading}
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  borderRadius: "4px",
                }}
                onClick={() => onConfirmPayment(record)}
              >
                ยืนยัน
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                disabled={actionLoading}
                style={{ borderRadius: "4px" }}
                onClick={() => onRejectPayment(record)}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
        </Space>
      ),
      width: "20%",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} จาก ${total} รายการ`,
      }}
      size="middle"
      tableLayout="fixed"
    />
  );
}