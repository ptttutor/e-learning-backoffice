"use client";
import { Modal, Space, Typography, Button } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import CustomerInfoCard from "./CustomerInfoCard";
import ProductInfoCard from "./ProductInfoCard";
import CourseInfoCard from "./CourseInfoCard";
import PaymentInfoCard from "./PaymentInfoCard";
import CouponInfoCard from "./CouponInfoCard";
import OrderSummaryCard from "./OrderSummaryCard";
import ShippingInfoCard from "./ShippingInfoCard";

const { Text } = Typography;

export default function OrderDetailModal({
  visible,
  loading,
  selectedOrder,
  slipAnalysis,
  analyzingSlip,
  onCancel,
  onConfirmPayment,
  onRejectPayment,
  onAnalyzeSlip,
  formatPrice,
  formatDate,
  getPaymentStatusColor,
  getPaymentStatusText,
}) {
  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <Text strong>
            รายละเอียดคำสั่งซื้อ #{selectedOrder?.id?.slice(-8) || "..."}
          </Text>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
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
                onCancel();
                onConfirmPayment(selectedOrder);
              }}
            >
              ยืนยันการชำระเงิน
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                const reason = prompt("เหตุผลการปฏิเสธ:");
                if (reason) {
                  onCancel();
                  onRejectPayment(selectedOrder);
                }
              }}
            >
              ปฏิเสธการชำระเงิน
            </Button>
            <Button onClick={onCancel}>ปิด</Button>
          </Space>
        ) : (
          <Button onClick={onCancel}>ปิด</Button>
        )
      }
      width={1000}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
      loading={loading}
    >
      {selectedOrder ? (
        <div>
          <CustomerInfoCard selectedOrder={selectedOrder} />
          
          <ProductInfoCard 
            selectedOrder={selectedOrder} 
            formatPrice={formatPrice} 
          />
          
          {/* Course Specific Information */}
          {selectedOrder.orderType === "COURSE" && selectedOrder.course && (
            <CourseInfoCard
              selectedOrder={selectedOrder}
              formatPrice={formatPrice}
            />
          )}
          
          <PaymentInfoCard
            selectedOrder={selectedOrder}
            slipAnalysis={slipAnalysis}
            analyzingSlip={analyzingSlip}
            onAnalyzeSlip={onAnalyzeSlip}
            formatPrice={formatPrice}
            formatDate={formatDate}
            getPaymentStatusColor={getPaymentStatusColor}
            getPaymentStatusText={getPaymentStatusText}
          />
          
          <CouponInfoCard 
            selectedOrder={selectedOrder} 
            formatPrice={formatPrice} 
          />
          
          <OrderSummaryCard 
            selectedOrder={selectedOrder} 
            formatPrice={formatPrice} 
          />
          
          <ShippingInfoCard selectedOrder={selectedOrder} />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Space direction="vertical" size={16}>
            <Text type="secondary">ไม่สามารถโหลดข้อมูลได้</Text>
          </Space>
        </div>
      )}
    </Modal>
  );
}