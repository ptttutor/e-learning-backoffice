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
} from "@ant-design/icons";

const { Text } = Typography;

export default function OrderTable({
  orders,
  loading,
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
          {getOrderStatusText(status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "สถานะการชำระเงิน",
      dataIndex: "payment",
      key: "paymentStatus",
      render: (payment) => (
        <div>
          <Tag color={getPaymentStatusColor(payment?.status)}>
            {getPaymentStatusText(payment?.status)}
          </Tag>
          {payment?.slipUrl && (
            <div style={{ marginTop: "2px" }}>
              <Tag color="blue" size="small">
                📄 มีสลิป
              </Tag>
            </div>
          )}
        </div>
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
            onClick={() => onViewDetail(record)}
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
                onClick={() => onConfirmPayment(record)}
              >
                ยืนยัน
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                style={{ borderRadius: "6px" }}
                onClick={() => onRejectPayment(record)}
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
  );
}