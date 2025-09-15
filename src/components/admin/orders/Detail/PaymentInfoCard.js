import {
  Card,
  Space,
  Typography,
  Tag,
  Descriptions,
  Divider,
  Image,
  Button,
  Flex,
} from "antd";
import {
  BankOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  CloseOutlined,
  DollarOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LineHeightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function PaymentInfoCard({
  selectedOrder,
  slipAnalysis,
  analyzingSlip,
  onAnalyzeSlip,
  formatPrice,
  formatDate,
  getPaymentStatusColor,
  getPaymentStatusText,
}) {
  return (
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
      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          backgroundColor:
            selectedOrder.payment?.status === "PENDING_VERIFICATION"
              ? "#fff3cd"
              : selectedOrder.payment?.status === "COMPLETED"
              ? "#d4edda"
              : selectedOrder.payment?.status === "REJECTED"
              ? "#f8d7da"
              : "#f8f9fa",
          border: `1px solid ${
            selectedOrder.payment?.status === "PENDING_VERIFICATION"
              ? "#ffeaa7"
              : selectedOrder.payment?.status === "COMPLETED"
              ? "#c3e6cb"
              : selectedOrder.payment?.status === "REJECTED"
              ? "#f5c6cb"
              : "#dee2e6"
          }`,
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Text strong style={{ fontSize: "16px" }}>
              {selectedOrder.payment?.status === "PENDING_VERIFICATION" ? (
                <Flex gap={8} align="center" style={{ color: "#856404" }}>
                  <WarningOutlined />
                  รอการตรวจสอบ
                </Flex>
              ) : selectedOrder.payment?.status === "COMPLETED" ? (
                <Flex gap={8} align="center" style={{ color: "#155724" }}>
                  <CheckCircleOutlined />
                  ตรวจสอบแล้ว
                </Flex>
              ) : selectedOrder.payment?.status === "REJECTED" ? (
                <Flex gap={8} align="center" style={{ color: "#721c24" }}>
                  <CloseOutlined />
                  ปฏิเสธแล้ว
                </Flex>
              ) : (
                selectedOrder.payment?.status || "ไม่ระบุสถานะ"
              )}
            </Text>
            <div style={{ marginTop: "4px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {selectedOrder.payment?.slipUrl
                  ? "มีสลิปการโอนเงิน"
                  : "ยังไม่มีสลิปการโอนเงิน"}
              </Text>
            </div>
          </div>
          <Tag
            color={getPaymentStatusColor(selectedOrder.payment?.status)}
            style={{
              borderRadius: "4px",
              fontSize: "14px",
              padding: "4px 12px",
            }}
          >
            {getPaymentStatusText(selectedOrder.payment?.status)}
          </Tag>
        </div>
      </div>

      <Descriptions column={1} size="small">
        <Descriptions.Item
          label={
            <Space size={6}>
              <BankOutlined style={{ color: "#8c8c8c" }} />
              <Text>วิธีการชำระ</Text>
            </Space>
          }
        >
          <Text>
            {selectedOrder.payment?.method === "BANK_TRANSFER" ||
            selectedOrder.payment?.method === "bank_transfer"
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
      {(selectedOrder.payment?.method === "BANK_TRANSFER" ||
        selectedOrder.payment?.method === "bank_transfer") && (
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
                  marginBottom: "16px",
                }}
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
                    คลิกที่รูปเพื่อดูขนาดเต็ม • อัพโหลดเมื่อ{" "}
                    {formatDate(selectedOrder.payment.uploadedAt)}
                  </Text>
                </div>
              </Card>

              {/* Admin Guidelines */}
              {selectedOrder.payment?.status === "PENDING_VERIFICATION" && (
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#e6f7ff",
                    border: "1px solid #91d5ff",
                    marginTop: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}><LineHeightOutlined/></div>
                    <div style={{ flex: 1 }}>
                      <Text
                        strong
                        style={{
                          color: "#0050b3",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        คำแนะนำการตรวจสอบสลิป
                      </Text>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#096dd9",
                          lineHeight: "1.5",
                        }}
                      >
                        <div>
                          ✓ ตรวจสอบจำนวนเงินให้ตรงกับยอดรวม (
                          {formatPrice(selectedOrder.total)})
                        </div>
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
            >
              <Space direction="vertical" size={12}>
                <FileTextOutlined
                  style={{ fontSize: "48px", color: "#fa8c16" }}
                />
                <Text
                  style={{
                    fontSize: "16px",
                    color: "#d46b08",
                    fontWeight: "500",
                  }}
                >
                  <WarningOutlined/> ไม่มีหลักฐานการโอนเงิน
                </Text>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  ลูกค้ายังไม่ได้อัพโหลดสลิปการโอนเงิน
                </Text>
                <div
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#fff7e6",
                    borderRadius: "4px",
                    border: "1px solid #ffd591",
                  }}
                >
                  <Text style={{ fontSize: "12px", color: "#ad6800" }}>
                    <LineHeightOutlined /> กรุณารอให้ลูกค้าอัพโหลดสลิปการโอนเงินก่อนดำเนินการตรวจสอบ
                  </Text>
                </div>
              </Space>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
}
