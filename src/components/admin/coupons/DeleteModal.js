import { Modal, Typography, Space, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export default function DeleteModal({
  open,
  onCancel,
  onConfirm,
  coupon,
  loading
}) {
  if (!coupon) return null;

  const hasUsage = coupon.usageCount > 0;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          ยืนยันการลบคูปอง
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="ลบ"
      cancelText="ยกเลิก"
      okButtonProps={{ 
        danger: true, 
        loading,
        disabled: hasUsage
      }}
      width={500}
    >
      <div style={{ padding: '16px 0' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text>คุณต้องการลบคูปองนี้หรือไม่?</Text>
          </div>

          <div style={{ 
            padding: 16, 
            background: '#f5f5f5', 
            borderRadius: 8,
            border: '1px solid #d9d9d9'
          }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong>รหัสคูปอง: </Text>
                <Tag color="blue">{coupon.code}</Tag>
              </div>
              <div>
                <Text strong>ชื่อ: </Text>
                <Text>{coupon.name}</Text>
              </div>
              <div>
                <Text strong>จำนวนการใช้งาน: </Text>
                <Text>{coupon.usageCount || 0} ครั้ง</Text>
              </div>
            </Space>
          </div>

          {hasUsage ? (
            <div style={{ 
              padding: 12, 
              background: '#fff2e8', 
              border: '1px solid #ffbb96',
              borderRadius: 6 
            }}>
              <Text type="warning">
                <ExclamationCircleOutlined /> ไม่สามารถลบคูปองที่มีการใช้งานแล้วได้
              </Text>
            </div>
          ) : (
            <div style={{ 
              padding: 12, 
              background: '#fff1f0', 
              border: '1px solid #ffccc7',
              borderRadius: 6 
            }}>
              <Text type="danger">
                <ExclamationCircleOutlined /> การลบจะไม่สามารถกู้คืนได้ กรุณายืนยันอีกครั้ง
              </Text>
            </div>
          )}
        </Space>
      </div>
    </Modal>
  );
}
