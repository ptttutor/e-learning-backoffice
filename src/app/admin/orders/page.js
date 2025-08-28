"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Tag, message, Image, Descriptions, Card } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, DownloadOutlined } from "@ant-design/icons";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleConfirmPayment = (order) => {
    setSelectedOrder(order);
    setActionType('confirm');
    setConfirmModalVisible(true);
  };

  const handleRejectPayment = (order) => {
    setSelectedOrder(order);
    setActionType('reject');
    setConfirmModalVisible(true);
  };

  const executeAction = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionType,
          paymentStatus: actionType === 'confirm' ? 'COMPLETED' : 'FAILED',
          orderStatus: actionType === 'confirm' ? 'COMPLETED' : 'CANCELLED'
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success(
          actionType === 'confirm' 
            ? 'ยืนยันการชำระเงินสำเร็จ' 
            : 'ปฏิเสธการชำระเงินสำเร็จ'
        );
        fetchOrders();
        setConfirmModalVisible(false);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('เกิดข้อผิดพลาดในการอัพเดทคำสั่งซื้อ');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING_PAYMENT': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING_VERIFICATION': return 'processing';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'รหัสคำสั่งซื้อ',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.slice(-8)}`,
      width: 120,
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'user',
      key: 'customer',
      render: (user) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'สินค้า',
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {record.ebook?.coverImageUrl ? (
              <Image
                src={record.ebook.coverImageUrl}
                alt={record.ebook.title}
                width={40}
                height={40}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                preview={false}
              />
            ) : (
              <span style={{ fontSize: '16px' }}>
                {record.orderType === 'EBOOK' ? '📚' : '🎓'}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {record.ebook?.title || record.course?.title}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.orderType === 'EBOOK' ? 'หนังสือ' : 'คอร์ส'}
            </div>
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: 'ยอดรวม',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {formatPrice(total)}
        </span>
      ),
      width: 120,
    },
    {
      title: 'สถานะคำสั่งซื้อ',
      dataIndex: 'status',
      key: 'orderStatus',
      render: (status) => (
        <Tag color={getOrderStatusColor(status)}>
          {status === 'COMPLETED' ? 'สำเร็จ' :
           status === 'PENDING_PAYMENT' ? 'รอตรวจสอบ' :
           status === 'CANCELLED' ? 'ยกเลิก' : status}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'สถานะการชำระเงิน',
      dataIndex: 'payment',
      key: 'paymentStatus',
      render: (payment) => (
        <Tag color={getPaymentStatusColor(payment?.status)}>
          {payment?.status === 'COMPLETED' ? 'ชำระแล้ว' :
           payment?.status === 'PENDING_VERIFICATION' ? 'รอตรวจสอบ' :
           payment?.status === 'FAILED' ? 'ไม่สำเร็จ' : 'รอชำระ'}
        </Tag>
      ),
      width: 130,
    },
    {
      title: 'วันที่สั่งซื้อ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      width: 150,
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            ดูรายละเอียด
          </Button>
          
          {record.payment?.status === 'PENDING_VERIFICATION' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                style={{ backgroundColor: '#52c41a' }}
                onClick={() => handleConfirmPayment(record)}
              >
                ยืนยัน
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handleRejectPayment(record)}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
        </Space>
      ),
      width: 200,
      fixed: 'right',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          📋 จัดการคำสั่งซื้อ
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          ตรวจสอบและอนุมัติการชำระเงิน
        </p>
      </div>

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
      />

      {/* Detail Modal */}
      <Modal
        title={`รายละเอียดคำสั่งซื้อ #${selectedOrder?.id?.slice(-8)}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Card title="ข้อมูลลูกค้า" style={{ marginBottom: '16px' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="ชื่อ">{selectedOrder.user.name}</Descriptions.Item>
                <Descriptions.Item label="อีเมล">{selectedOrder.user.email}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="ข้อมูลสินค้า" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedOrder.ebook?.coverImageUrl ? (
                    <Image
                      src={selectedOrder.ebook.coverImageUrl}
                      alt={selectedOrder.ebook.title}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <span style={{ fontSize: '32px' }}>
                      {selectedOrder.orderType === 'EBOOK' ? '📚' : '🎓'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>
                    {selectedOrder.ebook?.title || selectedOrder.course?.title}
                  </h3>
                  <p style={{ margin: '0 0 4px 0', color: '#666' }}>
                    ประเภท: {selectedOrder.orderType === 'EBOOK' ? 'หนังสือ' : 'คอร์ส'}
                  </p>
                  {selectedOrder.ebook?.author && (
                    <p style={{ margin: '0 0 4px 0', color: '#666' }}>
                      ผู้แต่ง: {selectedOrder.ebook.author}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    ราคา: {formatPrice(selectedOrder.total)}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="ข้อมูลการชำระเงิน" style={{ marginBottom: '16px' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="วิธีการชำระ">
                  {selectedOrder.payment?.method === 'bank_transfer' ? 'โอนเงินผ่านธนาคาร' : selectedOrder.payment?.method}
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ">
                  <Tag color={getPaymentStatusColor(selectedOrder.payment?.status)}>
                    {selectedOrder.payment?.status === 'COMPLETED' ? 'ชำระแล้ว' :
                     selectedOrder.payment?.status === 'PENDING_VERIFICATION' ? 'รอตรวจสอบ' :
                     selectedOrder.payment?.status === 'FAILED' ? 'ไม่สำเร็จ' : 'รอชำระ'}
                  </Tag>
                </Descriptions.Item>
                {selectedOrder.payment?.ref && (
                  <Descriptions.Item label="เลขอ้างอิง">{selectedOrder.payment.ref}</Descriptions.Item>
                )}
                {selectedOrder.payment?.paidAt && (
                  <Descriptions.Item label="วันที่ชำระ">
                    {formatDate(selectedOrder.payment.paidAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Transfer Slip Preview (if available) */}
              {selectedOrder.payment?.method === 'bank_transfer' && (
                <div style={{ marginTop: '16px' }}>
                  <h4>หลักฐานการโอนเงิน:</h4>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, color: '#666' }}>
                      📄 สลิปการโอนเงิน (ฟีเจอร์แสดงรูปจะพัฒนาในขั้นตอนถัดไป)
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {selectedOrder.shipping && (
              <Card title="ข้อมูลการจัดส่ง">
                <Descriptions column={2}>
                  <Descriptions.Item label="ผู้รับ">{selectedOrder.shipping.recipientName}</Descriptions.Item>
                  <Descriptions.Item label="เบอร์โทร">{selectedOrder.shipping.recipientPhone}</Descriptions.Item>
                  <Descriptions.Item label="ที่อยู่" span={2}>
                    {selectedOrder.shipping.address}, {selectedOrder.shipping.district}, {selectedOrder.shipping.province} {selectedOrder.shipping.postalCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="สถานะการจัดส่ง">
                    <Tag color={selectedOrder.shipping.status === 'DELIVERED' ? 'success' : 'processing'}>
                      {selectedOrder.shipping.status}
                    </Tag>
                  </Descriptions.Item>
                  {selectedOrder.shipping.trackingNumber && (
                    <Descriptions.Item label="เลขติดตาม">{selectedOrder.shipping.trackingNumber}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        title={actionType === 'confirm' ? 'ยืนยันการชำระเงิน' : 'ปฏิเสธการชำระเงิน'}
        open={confirmModalVisible}
        onOk={executeAction}
        onCancel={() => setConfirmModalVisible(false)}
        okText={actionType === 'confirm' ? 'ยืนยัน' : 'ปฏิเสธ'}
        cancelText="ยกเลิก"
        okButtonProps={{
          danger: actionType === 'reject',
          style: actionType === 'confirm' ? { backgroundColor: '#52c41a' } : undefined
        }}
      >
        <p>
          {actionType === 'confirm' 
            ? `ต้องการยืนยันการชำระเงินสำหรับคำสั่งซื้อ #${selectedOrder?.id?.slice(-8)} หรือไม่?`
            : `ต้องการปฏิเสธการชำระเงินสำหรับคำสั่งซื้อ #${selectedOrder?.id?.slice(-8)} หรือไม่?`
          }
        </p>
        {actionType === 'confirm' && (
          <p style={{ color: '#52c41a' }}>
            ✅ ลูกค้าจะสามารถเข้าถึงเนื้อหาได้ทันที
          </p>
        )}
        {actionType === 'reject' && (
          <p style={{ color: '#ff4d4f' }}>
            ❌ คำสั่งซื้อจะถูกยกเลิกและลูกค้าจะได้รับแจ้งเตือน
          </p>
        )}
      </Modal>
    </div>
  );
}