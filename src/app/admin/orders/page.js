"use client";
import { useEffect, useState, useCallback } from "react";
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
  Input,
  Select,
  Row,
  Col,
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
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  RobotOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [slipAnalysis, setSlipAnalysis] = useState(null);
  const [analyzingSlip, setAnalyzingSlip] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    orderType: '',
    search: ''
  });

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        let filteredOrders = result.data;
        
        // Client-side filtering for orderType and search
        if (filters.orderType) {
          filteredOrders = filteredOrders.filter(order => order.orderType === filters.orderType);
        }
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            order.user.name.toLowerCase().includes(searchTerm) ||
            order.user.email.toLowerCase().includes(searchTerm) ||
            (order.ebook?.title || order.course?.title || '').toLowerCase().includes(searchTerm)
          );
        }
        
        setOrders(filteredOrders);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      orderType: '',
      search: ''
    });
  };

  const handleViewDetail = async (order) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    setSelectedOrder(null);
    setSlipAnalysis(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`);
      const result = await response.json();

      if (result.success) {
        setSelectedOrder(result.data);
        
        // Load slip analysis if payment exists
        if (result.data.payment?.id) {
          loadSlipAnalysis(result.data.payment.id);
        }
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

  const loadSlipAnalysis = async (paymentId) => {
    try {
      const response = await fetch(`/api/admin/payments/analyze-slip?paymentId=${paymentId}`);
      const result = await response.json();
      
      if (result.success) {
        setSlipAnalysis(result.data);
      }
    } catch (error) {
      console.error("Error loading slip analysis:", error);
    }
  };

  const handleAnalyzeSlip = async () => {
    if (!selectedOrder?.payment?.id) {
      message.error('ไม่พบข้อมูลการชำระเงิน');
      return;
    }

    setAnalyzingSlip(true);
    try {
      const response = await fetch('/api/admin/payments/analyze-slip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: selectedOrder.payment.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('วิเคราะห์สลิปเสร็จสิ้น');
        setSlipAnalysis(result.data);
      } else {
        message.error(result.error || 'เกิดข้อผิดพลาดในการวิเคราะห์สลิป');
      }
    } catch (error) {
      console.error('Error analyzing slip:', error);
      message.error('เกิดข้อผิดพลาดในการวิเคราะห์สลิป');
    } finally {
      setAnalyzingSlip(false);
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

  const handleBulkAction = async (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('กรุณาเลือกคำสั่งซื้อที่ต้องการดำเนินการ');
      return;
    }

    const actionText = {
      'confirm_payment': 'ยืนยันการชำระเงิน',
      'reject_payment': 'ปฏิเสธการชำระเงิน',
      'cancel_orders': 'ยกเลิกคำสั่งซื้อ'
    };

    Modal.confirm({
      title: `${actionText[action]}`,
      content: `ต้องการ${actionText[action]}จำนวน ${selectedRowKeys.length} รายการหรือไม่?`,
      okText: 'ดำเนินการ',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        setBulkActionLoading(true);
        try {
          const response = await fetch('/api/admin/orders/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderIds: selectedRowKeys,
              action: action,
              notes: `${actionText[action]}แบบกลุ่ม`
            }),
          });

          const result = await response.json();

          if (result.success) {
            message.success(result.message);
            setSelectedRowKeys([]);
            fetchOrders();
          } else {
            message.error(result.error);
          }
        } catch (error) {
          console.error('Bulk action error:', error);
          message.error('เกิดข้อผิดพลาดในการดำเนินการ');
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
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
          notes: actionType === "reject" ? "ตรวจสอบแล้วพบว่าหลักฐานการโอนเงินไม่ถูกต้อง" : "ตรวจสอบแล้วถูกต้อง",
          rejectionReason: actionType === "reject" ? "หลักฐานการโอนเงินไม่ถูกต้องหรือไม่ชัดเจน" : null
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        
        // Show additional info for course enrollment
        if (actionType === "confirm" && result.enrollment) {
          message.info("ลูกค้าสามารถเข้าเรียนคอร์สได้แล้ว", 3);
        }
        
        fetchOrders();
        setConfirmModalVisible(false);
        
        // Close detail modal if open
        if (detailModalVisible) {
          setDetailModalVisible(false);
        }
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

      {/* Filters */}
      <Card style={{ marginBottom: "16px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="ค้นหาคำสั่งซื้อ, ลูกค้า, สินค้า"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="สถานะคำสั่งซื้อ"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="PENDING">รอชำระเงิน</Option>
              <Option value="PENDING_VERIFICATION">รอตรวจสอบ</Option>
              <Option value="COMPLETED">สำเร็จ</Option>
              <Option value="CANCELLED">ยกเลิก</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="สถานะการชำระเงิน"
              value={filters.paymentStatus}
              onChange={(value) => handleFilterChange('paymentStatus', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="PENDING">รอชำระ</Option>
              <Option value="PENDING_VERIFICATION">รอตรวจสอบ</Option>
              <Option value="COMPLETED">ชำระแล้ว</Option>
              <Option value="REJECTED">ปฏิเสธ</Option>
              <Option value="FREE">ฟรี</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="ประเภทสินค้า"
              value={filters.orderType}
              onChange={(value) => handleFilterChange('orderType', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="COURSE">คอร์สเรียน</Option>
              <Option value="EBOOK">หนังสือ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchOrders}
                loading={loading}
              >
                รีเฟรช
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={resetFilters}
              >
                ล้างตัวกรอง
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: '#f6ffed', 
            border: '1px solid #b7eb8f',
            borderRadius: '6px'
          }}>
            <Space wrap>
              <Text strong>เลือกแล้ว {selectedRowKeys.length} รายการ</Text>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                loading={bulkActionLoading}
                onClick={() => handleBulkAction('confirm_payment')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                ยืนยันการชำระเงิน
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                loading={bulkActionLoading}
                onClick={() => handleBulkAction('reject_payment')}
              >
                ปฏิเสธการชำระเงิน
              </Button>
              <Button
                icon={<CloseOutlined />}
                size="small"
                loading={bulkActionLoading}
                onClick={() => handleBulkAction('cancel_orders')}
              >
                ยกเลิกคำสั่งซื้อ
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedRowKeys([])}
              >
                ยกเลิกการเลือก
              </Button>
            </Space>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.status === 'COMPLETED' && record.payment?.status === 'COMPLETED',
            }),
          }}
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
        footer={
          selectedOrder?.payment?.status === "PENDING_VERIFICATION" ? (
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleConfirmPayment(selectedOrder);
                }}
              >
                ยืนยันการชำระเงิน
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleRejectPayment(selectedOrder);
                }}
              >
                ปฏิเสธการชำระเงิน
              </Button>
              <Button onClick={() => setDetailModalVisible(false)}>
                ปิด
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setDetailModalVisible(false)}>
              ปิด
            </Button>
          )
        }
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
              {/* Payment Status Summary */}
              <div style={{ 
                marginBottom: "16px", 
                padding: "12px", 
                backgroundColor: selectedOrder.payment?.status === 'PENDING_VERIFICATION' ? '#fff3cd' : 
                                selectedOrder.payment?.status === 'COMPLETED' ? '#d4edda' : 
                                selectedOrder.payment?.status === 'REJECTED' ? '#f8d7da' : '#f8f9fa',
                border: `1px solid ${selectedOrder.payment?.status === 'PENDING_VERIFICATION' ? '#ffeaa7' : 
                                    selectedOrder.payment?.status === 'COMPLETED' ? '#c3e6cb' : 
                                    selectedOrder.payment?.status === 'REJECTED' ? '#f5c6cb' : '#dee2e6'}`,
                borderRadius: "6px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Text strong style={{ fontSize: "16px" }}>
                      {selectedOrder.payment?.status === 'PENDING_VERIFICATION' ? '⏳ รอการตรวจสอบ' :
                       selectedOrder.payment?.status === 'COMPLETED' ? '✅ ตรวจสอบแล้ว' :
                       selectedOrder.payment?.status === 'REJECTED' ? '❌ ปฏิเสธแล้ว' : 
                       selectedOrder.payment?.status || 'ไม่ระบุสถานะ'}
                    </Text>
                    <div style={{ marginTop: "4px" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {selectedOrder.payment?.slipUrl ? 'มีสลิปการโอนเงิน' : 'ยังไม่มีสลิปการโอนเงิน'}
                      </Text>
                    </div>
                  </div>
                  <Tag
                    color={getPaymentStatusColor(selectedOrder.payment?.status)}
                    style={{ borderRadius: "4px", fontSize: "14px", padding: "4px 12px" }}
                  >
                    {getPaymentStatusText(selectedOrder.payment?.status)}
                  </Tag>
                </div>
              </div>

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
                    {selectedOrder.payment?.method === "BANK_TRANSFER" || selectedOrder.payment?.method === "bank_transfer"
                      ? "โอนเงินผ่านธนาคาร"
                      : selectedOrder.payment?.method === "FREE"
                      ? "ฟรี"
                      : selectedOrder.payment?.method || "ไม่ระบุ"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text>สถานะรายละเอียด</Text>}>
                  <div>
                    <Tag
                      color={getPaymentStatusColor(selectedOrder.payment?.status)}
                      style={{ borderRadius: "4px" }}
                    >
                      {getPaymentStatusText(selectedOrder.payment?.status)}
                    </Tag>
                    {selectedOrder.payment?.slipUrl && (
                      <Tag color="blue" style={{ marginLeft: "4px" }}>
                        มีสลิป
                      </Tag>
                    )}
                  </div>
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
                {selectedOrder.payment?.uploadedAt && (
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <CalendarOutlined style={{ color: "#8c8c8c" }} />
                        <Text>วันที่อัพโหลดสลิป</Text>
                      </Space>
                    }
                  >
                    <Text>{formatDate(selectedOrder.payment.uploadedAt)}</Text>
                  </Descriptions.Item>
                )}
                {selectedOrder.payment?.verifiedAt && (
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <CalendarOutlined style={{ color: "#8c8c8c" }} />
                        <Text>วันที่ตรวจสอบ</Text>
                      </Space>
                    }
                  >
                    <Text>{formatDate(selectedOrder.payment.verifiedAt)}</Text>
                  </Descriptions.Item>
                )}
                {selectedOrder.payment?.verifiedBy && (
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <UserOutlined style={{ color: "#8c8c8c" }} />
                        <Text>ตรวจสอบโดย</Text>
                      </Space>
                    }
                  >
                    <Text>{selectedOrder.payment.verifiedBy}</Text>
                  </Descriptions.Item>
                )}
                {selectedOrder.payment?.rejectionReason && (
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <CloseOutlined style={{ color: "#ff4d4f" }} />
                        <Text>เหตุผลการปฏิเสธ</Text>
                      </Space>
                    }
                    span={2}
                  >
                    <Text style={{ color: "#ff4d4f" }}>
                      {selectedOrder.payment.rejectionReason}
                    </Text>
                  </Descriptions.Item>
                )}
                {selectedOrder.payment?.notes && (
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <FileTextOutlined style={{ color: "#8c8c8c" }} />
                        <Text>หมายเหตุ</Text>
                      </Space>
                    }
                    span={2}
                  >
                    <Text>{selectedOrder.payment.notes}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item
                  label={
                    <Space size={6}>
                      <DollarOutlined style={{ color: "#8c8c8c" }} />
                      <Text>จำนวนเงิน</Text>
                    </Space>
                  }
                >
                  <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                    {formatPrice(selectedOrder.payment?.amount || selectedOrder.total)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Transfer Slip Preview (if available) */}
              {(selectedOrder.payment?.method === "BANK_TRANSFER" || selectedOrder.payment?.method === "bank_transfer") && (
                <div style={{ marginTop: "20px" }}>
                  <Divider style={{ margin: "16px 0" }} />
                  <Title level={5} style={{ marginBottom: "12px" }}>
                    <FileTextOutlined
                      style={{ color: "#1890ff", marginRight: "8px" }}
                    />
                    หลักฐานการโอนเงิน
                  </Title>

                  {selectedOrder.payment?.slipUrl ? (
                    <div>
                      <Card
                        style={{
                          textAlign: "center",
                          borderRadius: "8px",
                          overflow: "hidden",
                          marginBottom: "16px"
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
                            คลิกที่รูปเพื่อดูขนาดเต็ม • อัพโหลดเมื่อ {formatDate(selectedOrder.payment.uploadedAt)}
                          </Text>
                        </div>
                      </Card>
                      
                      {/* Slip Information */}
                      <Card
                        size="small"
                        style={{
                          backgroundColor: "#f6ffed",
                          border: "1px solid #b7eb8f"
                        }}
                      >
                        <Space direction="vertical" size={8} style={{ width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text strong style={{ color: "#389e0d" }}>
                              📄 ข้อมูลสลิปการโอนเงิน
                            </Text>
                            <Tag color="success" style={{ margin: 0 }}>
                              อัพโหลดแล้ว
                            </Tag>
                          </div>
                          
                          {selectedOrder.payment?.uploadedAt && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text type="secondary">วันที่อัพโหลด:</Text>
                              <Text>{formatDate(selectedOrder.payment.uploadedAt)}</Text>
                            </div>
                          )}
                          
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text type="secondary">ขนาดไฟล์:</Text>
                            <Text>ไม่ระบุ</Text>
                          </div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text type="secondary">การดำเนินการ:</Text>
                            <Space size={8}>
                              <a 
                                href={selectedOrder.payment.slipUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  backgroundColor: "#1890ff",
                                  color: "white",
                                  borderRadius: "4px",
                                  textDecoration: "none"
                                }}
                              >
                                🔗 เปิดในแท็บใหม่
                              </a>
                              <a 
                                href={selectedOrder.payment.slipUrl} 
                                download={`slip_${selectedOrder.id}.jpg`}
                                style={{ 
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  backgroundColor: "#52c41a",
                                  color: "white",
                                  borderRadius: "4px",
                                  textDecoration: "none"
                                }}
                              >
                                💾 ดาวน์โหลด
                              </a>
                            </Space>
                          </div>
                        </Space>
                      </Card>
                      
                      {/* EasySlip Analysis */}
                      {selectedOrder.payment?.slipUrl && (
                        <Card
                          size="small"
                          style={{
                            backgroundColor: "#f6ffed",
                            border: "1px solid #b7eb8f",
                            marginTop: "12px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <Text strong style={{ color: "#389e0d" }}>
                              🤖 การตรวจสอบสลิปอัตโนมัติ (EasySlip)
                            </Text>
                            <Button
                              size="small"
                              type="primary"
                              loading={analyzingSlip}
                              onClick={handleAnalyzeSlip}
                              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                            >
                              {slipAnalysis ? 'วิเคราะห์ใหม่' : 'วิเคราะห์สลิป'}
                            </Button>
                          </div>
                          
                          {slipAnalysis ? (
                            <div>
                              {slipAnalysis.summary?.canReadSlip ? (
                                <div style={{ marginBottom: "12px" }}>
                                  <Tag color="success" style={{ marginBottom: "8px" }}>
                                    ✅ อ่านสลิปได้สำเร็จ
                                  </Tag>
                                  <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
                                    <div><strong>จำนวนเงินที่ตรวจพบ:</strong> {slipAnalysis.summary.detectedAmount || 'ไม่พบ'} บาท</div>
                                    <div><strong>วันที่โอนเงิน:</strong> {slipAnalysis.summary.detectedDate || 'ไม่พบ'}</div>
                                    <div><strong>การตรวจสอบ:</strong> {slipAnalysis.summary.validationScore}</div>
                                    <div>
                                      <strong>จำนวนเงินถูกต้อง:</strong> 
                                      {slipAnalysis.summary.amountMatches ? (
                                        <Tag color="success" size="small" style={{ marginLeft: "4px" }}>ถูกต้อง</Tag>
                                      ) : (
                                        <Tag color="error" size="small" style={{ marginLeft: "4px" }}>ไม่ตรงกัน</Tag>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <Tag color="warning" style={{ marginBottom: "8px" }}>
                                    ⚠️ ไม่สามารถอ่านสลิปได้
                                  </Tag>
                                  <div style={{ fontSize: "12px", color: "#d46b08" }}>
                                    {slipAnalysis.easySlipResult?.error || 'ไม่สามารถประมวลผลสลิปได้'}
                                  </div>
                                </div>
                              )}
                              
                              {/* Validation Details */}
                              {slipAnalysis.validation?.validations && (
                                <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "#fff", borderRadius: "4px", border: "1px solid #d9f7be" }}>
                                  <Text strong style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>
                                    รายละเอียดการตรวจสอบ:
                                  </Text>
                                  {slipAnalysis.validation.validations.map((validation, index) => (
                                    <div key={index} style={{ fontSize: "11px", marginBottom: "2px" }}>
                                      {validation.status === 'pass' && '✅ '}
                                      {validation.status === 'fail' && '❌ '}
                                      {validation.status === 'warning' && '⚠️ '}
                                      {validation.message}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              คลิก วิเคราะห์สลิป เพื่อตรวจสอบสลิปอัตโนมัติด้วย AI
                            </div>
                          )}
                        </Card>
                      )}

                      {/* Admin Guidelines */}
                      {selectedOrder.payment?.status === 'PENDING_VERIFICATION' && (
                        <Card
                          size="small"
                          style={{
                            backgroundColor: "#e6f7ff",
                            border: "1px solid #91d5ff",
                            marginTop: "12px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ fontSize: "20px" }}>💡</div>
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ color: "#0050b3", display: "block", marginBottom: "8px" }}>
                                คำแนะนำการตรวจสอบสลิป
                              </Text>
                              <div style={{ fontSize: "12px", color: "#096dd9", lineHeight: "1.5" }}>
                                <div>✓ ตรวจสอบจำนวนเงินให้ตรงกับยอดรวม ({formatPrice(selectedOrder.total)})</div>
                                <div>✓ ตรวจสอบวันที่และเวลาการโอนเงิน</div>
                                <div>✓ ตรวจสอบหมายเลขบัญชีปลายทาง</div>
                                <div>✓ ตรวจสอบความชัดเจนของสลิป</div>
                                <div>✓ ใช้การตรวจสอบอัตโนมัติเป็นข้อมูลเสริม</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card
                      style={{
                        textAlign: "center",
                        backgroundColor: "#fff2e8",
                        border: "1px dashed #ffbb96",
                        borderRadius: "8px",
                      }}
                      bodyStyle={{ padding: "24px" }}
                    >
                      <Space direction="vertical" size={12}>
                        <FileTextOutlined
                          style={{ fontSize: "48px", color: "#fa8c16" }}
                        />
                        <Text style={{ fontSize: "16px", color: "#d46b08", fontWeight: "500" }}>
                          ⚠️ ไม่มีหลักฐานการโอนเงิน
                        </Text>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          ลูกค้ายังไม่ได้อัพโหลดสลิปการโอนเงิน
                        </Text>
                        <div style={{
                          padding: "8px 16px",
                          backgroundColor: "#fff7e6",
                          borderRadius: "4px",
                          border: "1px solid #ffd591"
                        }}>
                          <Text style={{ fontSize: "12px", color: "#ad6800" }}>
                            💡 กรุณารอให้ลูกค้าอัพโหลดสลิปการโอนเงินก่อนดำเนินการตรวจสอบ
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  )}
                </div>
              )}
            </Card>

            {/* Coupon Information */}
            {selectedOrder.coupon && (
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
                    <Text strong style={{ color: "#52c41a" }}>
                      {selectedOrder.coupon.type === 'PERCENTAGE' 
                        ? `${selectedOrder.coupon.value}%`
                        : selectedOrder.coupon.type === 'FIXED_AMOUNT'
                        ? formatPrice(selectedOrder.coupon.value)
                        : 'ฟรีค่าจัดส่ง'
                      }
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space size={6}>
                        <DollarOutlined style={{ color: "#8c8c8c" }} />
                        <Text>จำนวนส่วนลด</Text>
                      </Space>
                    }
                  >
                    <Text strong style={{ color: "#52c41a" }}>
                      {formatPrice(selectedOrder.couponDiscount || 0)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Order Summary */}
            <Card
              title={
                <Space>
                  <DollarOutlined style={{ color: "#1890ff" }} />
                  <Text strong>สรุปการสั่งซื้อ</Text>
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
                  <Text>{formatPrice(selectedOrder.subtotal)}</Text>
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
