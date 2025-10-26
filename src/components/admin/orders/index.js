"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Space,
  Tag,
  Card,
  Typography,
  App,
} from "antd";
import OrderTable from "./OrderTable";
import ConfirmActionModal from "./ConfirmActionModal";
import OrderFilters from "./OrderFilters";
import {
  ShoppingCartOutlined,
} from "@ant-design/icons";
import OrderDetailModal from "./Detail/OrderDetailModal";

const { Title, Text } = Typography;

// Global error handler for unhandled fetch errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Unexpected token')) {
      console.error('Caught unhandled JSON parsing error:', event.reason);
      event.preventDefault(); // Prevent console error
    }
  });
}

export default function OrdersManagement() {
  return (
    <App>
      <OrdersManagementContent />
    </App>
  );
}

function OrdersManagementContent() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [slipAnalysis, setSlipAnalysis] = useState(null);
  const [analyzingSlip, setAnalyzingSlip] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    orderType: '',
    search: ''
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true); // เพิ่ม loading state เมื่อเริ่มเรียก API
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}. Response status: ${response.status}`);
      }
      
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
            order.user?.name?.toLowerCase().includes(searchTerm) ||
            order.user?.email?.toLowerCase().includes(searchTerm) ||
            (order.ebook?.title || order.course?.title || '').toLowerCase().includes(searchTerm)
          );
        }
        
        setOrders(filteredOrders);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, message]);

  useEffect(() => {
    // Add small delay to ensure API routes are ready
    const timer = setTimeout(() => {
      fetchOrders();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setLoading(true); // เพิ่ม loading เมื่อมีการเปลี่ยน filter
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setLoading(true); // เพิ่ม loading เมื่อ reset filters
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
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}. Response status: ${response.status}`);
      }
      
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
      message.error(`เกิดข้อผิดพลาดในการโหลดรายละเอียด: ${error.message}`);
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadSlipAnalysis = async (paymentId) => {
    try {
      const response = await fetch(`/api/admin/payments/analyze-slip?paymentId=${paymentId}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Slip analysis API returned ${contentType} instead of JSON`);
        return; // Skip analysis if not JSON
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSlipAnalysis(result.data);
      }
    } catch (error) {
      console.error("Error loading slip analysis:", error);
      // Don't show user error for optional slip analysis
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

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}. Response status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        message.success('วิเคราะห์สลิปเสร็จสิ้น');
        setSlipAnalysis(result.data);
      } else {
        message.error(result.error || 'เกิดข้อผิดพลาดในการวิเคราะห์สลิป');
      }
    } catch (error) {
      console.error('Error analyzing slip:', error);
      message.error(`เกิดข้อผิดพลาดในการวิเคราะห์สลิป: ${error.message}`);
    } finally {
      setAnalyzingSlip(false);
    }
  };

  const handleConfirmPayment = (order) => {
    console.log("handleConfirmPayment called with:", order);
    if (!order || !order.id) {
      console.error("Invalid order object:", order);
      message.error("ไม่พบข้อมูลคำสั่งซื้อ");
      return;
    }
    setSelectedOrder(order);
    setActionType("confirm");
    setConfirmModalVisible(true);
  };

  const handleRejectPayment = (order) => {
    console.log("handleRejectPayment called with:", order);
    if (!order || !order.id) {
      console.error("Invalid order object:", order);
      message.error("ไม่พบข้อมูลคำสั่งซื้อ");
      return;
    }
    setSelectedOrder(order);
    setActionType("reject");
    setConfirmModalVisible(true);
  };

  const executeAction = async () => {
    console.log("executeAction called with selectedOrder:", selectedOrder);
    if (!selectedOrder || !selectedOrder.id) {
      console.error("No selectedOrder or selectedOrder.id:", selectedOrder);
      message.error("ไม่พบข้อมูลคำสั่งซื้อที่เลือก");
      setConfirmModalVisible(false);
      return;
    }

    setActionLoading(true); // เพิ่ม loading เมื่อทำการอัปเดต order
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

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}. Response status: ${response.status}`);
      }

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
      message.error(`เกิดข้อผิดพลาดในการอัพเดทคำสั่งซื้อ: ${error.message}`);
    } finally {
      setActionLoading(false); // ปิด loading เมื่อเสร็จสิ้น
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
      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        onRefresh={fetchOrders}
        loading={loading}
      />

      <Card>
        <OrderTable
          orders={orders}
          loading={loading}
          actionLoading={actionLoading}
          onViewDetail={handleViewDetail}
          onConfirmPayment={handleConfirmPayment}
          onRejectPayment={handleRejectPayment}
        />
      </Card>

      {/* Detail Modal */}
      <OrderDetailModal
        visible={detailModalVisible}
        loading={detailLoading}
        selectedOrder={selectedOrder}
        slipAnalysis={slipAnalysis}
        analyzingSlip={analyzingSlip}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        onConfirmPayment={handleConfirmPayment}
        onRejectPayment={handleRejectPayment}
        onAnalyzeSlip={handleAnalyzeSlip}
        formatPrice={formatPrice}
        formatDate={formatDate}
        getPaymentStatusColor={getPaymentStatusColor}
        getPaymentStatusText={getPaymentStatusText}
      />

      {/* Confirm Action Modal */}
      <ConfirmActionModal
        visible={confirmModalVisible}
        actionType={actionType}
        selectedOrder={selectedOrder}
        loading={actionLoading}
        onOk={executeAction}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </div>
  );
}