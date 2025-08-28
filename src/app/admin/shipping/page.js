"use client";
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Card } from "antd";
import { EyeOutlined, EditOutlined, TruckOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function AdminShippingPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/admin/shipping');
      const result = await response.json();
      
      if (result.success) {
        setShipments(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (shipment) => {
    setSelectedShipment(shipment);
    setDetailModalVisible(true);
  };

  const handleUpdateShipping = (shipment) => {
    setSelectedShipment(shipment);
    form.setFieldsValue({
      shippingCompany: shipment.shippingMethod || 'PENDING',
      status: shipment.status,
      trackingNumber: shipment.trackingNumber || '',
      notes: shipment.notes || ''
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const response = await fetch(`/api/admin/shipping/${selectedShipment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('อัพเดทข้อมูลการจัดส่งสำเร็จ');
        fetchShipments();
        setUpdateModalVisible(false);
        form.resetFields();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      message.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('th-TH') : '-';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'default';
      case 'PROCESSING': return 'processing';
      case 'SHIPPED': return 'warning';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'PROCESSING': return 'กำลังเตรียม';
      case 'SHIPPED': return 'จัดส่งแล้ว';
      case 'DELIVERED': return 'ส่งถึงแล้ว';
      case 'CANCELLED': return 'ยกเลิก';
      default: return status;
    }
  };

  const getCompanyIcon = (company) => {
    switch (company) {
      case 'KERRY': return '🚚';
      case 'THAILAND_POST': return '📮';
      case 'JT_EXPRESS': return '📦';
      case 'FLASH_EXPRESS': return '⚡';
      case 'NINJA_VAN': return '🥷';
      default: return '📋';
    }
  };

  const getCompanyName = (company) => {
    switch (company) {
      case 'KERRY': return 'Kerry Express';
      case 'THAILAND_POST': return 'ไปรษณีย์ไทย';
      case 'JT_EXPRESS': return 'J&T Express';
      case 'FLASH_EXPRESS': return 'Flash Express';
      case 'NINJA_VAN': return 'Ninja Van';
      case 'PENDING': return 'รอเลือก';
      default: return company || 'ไม่ระบุ';
    }
  };

  const columns = [
    {
      title: 'รหัสคำสั่งซื้อ',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId) => `#${orderId.slice(-8)}`,
      width: 120,
    },
    {
      title: 'ผู้รับ',
      dataIndex: 'recipientName',
      key: 'recipientName',
      width: 150,
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'recipientPhone',
      key: 'recipientPhone',
      width: 120,
    },
    {
      title: 'ที่อยู่',
      key: 'address',
      render: (_, record) => (
        <div style={{ maxWidth: '200px' }}>
          <div>{record.address}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.district}, {record.province} {record.postalCode}
          </div>
        </div>
      ),
      width: 220,
    },
    {
      title: 'บริษัทขนส่ง',
      dataIndex: 'shippingMethod',
      key: 'shippingMethod',
      render: (company) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {getCompanyIcon(company)}
          <span>{getCompanyName(company)}</span>
        </div>
      ),
      width: 130,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'เลขติดตาม',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (trackingNumber) => trackingNumber || '-',
      width: 150,
    },
    {
      title: 'วันที่สร้าง',
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
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleUpdateShipping(record)}
          >
            อัพเดท
          </Button>
        </Space>
      ),
      width: 180,
      fixed: 'right',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          🚚 จัดการการจัดส่ง
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          ติดตามและอัพเดทสถานะการจัดส่งสินค้า
        </p>
      </div>

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
      />

      {/* Detail Modal */}
      <Modal
        title={`รายละเอียดการจัดส่ง #${selectedShipment?.orderId?.slice(-8)}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedShipment && (
          <div>
            <Card title="ข้อมูลผู้รับ" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div><strong>ชื่อผู้รับ:</strong> {selectedShipment.recipientName}</div>
                <div><strong>เบอร์โทร:</strong> {selectedShipment.recipientPhone}</div>
                <div><strong>ที่อยู่:</strong> {selectedShipment.address}</div>
                <div><strong>ตำบล/แขวง:</strong> {selectedShipment.district}</div>
                <div><strong>จังหวัด:</strong> {selectedShipment.province}</div>
                <div><strong>รหัสไปรษณีย์:</strong> {selectedShipment.postalCode}</div>
                <div><strong>ประเทศ:</strong> {selectedShipment.country}</div>
              </div>
            </Card>

            <Card title="ข้อมูลการจัดส่ง" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <strong>บริษัทขนส่ง:</strong>{' '}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {getCompanyIcon(selectedShipment.shippingMethod)}
                    {getCompanyName(selectedShipment.shippingMethod)}
                  </span>
                </div>
                <div>
                  <strong>สถานะ:</strong>{' '}
                  <Tag color={getStatusColor(selectedShipment.status)}>
                    {getStatusText(selectedShipment.status)}
                  </Tag>
                </div>
                <div><strong>วิธีการจัดส่ง:</strong> {selectedShipment.shippingMethod}</div>
                <div><strong>เลขติดตาม:</strong> {selectedShipment.trackingNumber || '-'}</div>
                <div><strong>วันที่จัดส่ง:</strong> {formatDate(selectedShipment.shippedAt)}</div>
                <div><strong>วันที่ส่งถึง:</strong> {formatDate(selectedShipment.deliveredAt)}</div>
                <div><strong>หมายเหตุ:</strong> {selectedShipment.notes || '-'}</div>
              </div>
            </Card>

            {selectedShipment.order && (
              <Card title="ข้อมูลคำสั่งซื้อ">
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div><strong>รหัสคำสั่งซื้อ:</strong> #{selectedShipment.order.id.slice(-8)}</div>
                  <div><strong>ลูกค้า:</strong> {selectedShipment.order.user?.name}</div>
                  <div><strong>สินค้า:</strong> {selectedShipment.order.ebook?.title || selectedShipment.order.course?.title}</div>
                  <div><strong>ยอดรวม:</strong> {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(selectedShipment.order.total)}</div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        title="อัพเดทข้อมูลการจัดส่ง"
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubmit}
        >
          <Form.Item
            name="shippingCompany"
            label="บริษัทขนส่ง"
            rules={[{ required: true, message: 'กรุณาเลือกบริษัทขนส่ง' }]}
          >
            <Select placeholder="เลือกบริษัทขนส่ง">
              <Option value="KERRY">🚚 Kerry Express</Option>
              <Option value="THAILAND_POST">📮 ไปรษณีย์ไทย</Option>
              <Option value="JT_EXPRESS">📦 J&T Express</Option>
              <Option value="FLASH_EXPRESS">⚡ Flash Express</Option>
              <Option value="NINJA_VAN">🥷 Ninja Van</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="สถานะการจัดส่ง"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Option value="PENDING">รอดำเนินการ</Option>
              <Option value="PROCESSING">กำลังเตรียม</Option>
              <Option value="SHIPPED">จัดส่งแล้ว</Option>
              <Option value="DELIVERED">ส่งถึงแล้ว</Option>
              <Option value="CANCELLED">ยกเลิก</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="trackingNumber"
            label="เลขติดตาม"
          >
            <Input placeholder="ใส่เลขติดตามพัสดุ" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="หมายเหตุ"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<TruckOutlined />}>
                อัพเดท
              </Button>
              <Button onClick={() => {
                setUpdateModalVisible(false);
                form.resetFields();
              }}>
                ยกเลิก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}