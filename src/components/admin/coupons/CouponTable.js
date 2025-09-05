import { Table, Card, Tag, Button, Space, Progress, Tooltip, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PoweroffOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function CouponTable({
  coupons,
  loading,
  pagination,
  onTableChange,
  onEdit,
  onDelete,
  onToggleStatus
}) {
  const columns = [
    {
      title: 'รหัสคูปอง',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => (
        <Text strong style={{ fontFamily: 'monospace' }}>{code}</Text>
      ),
    },
    {
      title: 'ชื่อคูปอง',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeConfig = {
          PERCENTAGE: { text: 'ส่วนลด %', color: 'blue' },
          FIXED_AMOUNT: { text: 'จำนวนคงที่', color: 'green' },
          FREE_SHIPPING: { text: 'ฟรีค่าส่ง', color: 'orange' },
        };
        const config = typeConfig[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'ค่าส่วนลด',
      key: 'value',
      width: 120,
      render: (_, record) => {
        if (record.type === 'PERCENTAGE') {
          return `${record.value}%`;
        } else if (record.type === 'FIXED_AMOUNT') {
          return `฿${record.value?.toLocaleString()}`;
        } else {
          return 'ฟรีค่าส่ง';
        }
      },
    },
    {
      title: 'จำกัดใช้งาน',
      key: 'usage',
      width: 150,
      render: (_, record) => {
        if (!record.usageLimit) {
          return <Text type="secondary">ไม่จำกัด</Text>;
        }
        
        const percentage = record.usagePercentage || 0;
        return (
          <div>
            <div style={{ fontSize: '12px', marginBottom: 4 }}>
              {record.usageCount}/{record.usageLimit}
            </div>
            <Progress
              percent={percentage}
              size="small"
              status={percentage >= 90 ? 'exception' : percentage >= 70 ? 'active' : 'normal'}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'วันที่หมดอายุ',
      key: 'expires',
      width: 150,
      render: (_, record) => {
        const isExpired = record.isExpired;
        const daysLeft = record.daysLeft;
        
        return (
          <div>
            <div style={{ color: isExpired ? '#ff4d4f' : undefined }}>
              {new Date(record.validUntil).toLocaleDateString('th-TH')}
            </div>
            {isExpired ? (
              <Text type="danger" style={{ fontSize: '12px' }}>หมดอายุแล้ว</Text>
            ) : (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                อีก {daysLeft} วัน
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive, record) => {
        if (record.isExpired) {
          return <Tag color="red">หมดอายุ</Tag>;
        }
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'ใช้งานได้' : 'ไม่ใช้งาน'}
          </Tag>
        );
      },
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="แก้ไข">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title={record.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}>
            <Button
              type={record.isActive ? 'default' : 'primary'}
              ghost
              icon={<PoweroffOutlined />}
              onClick={() => onToggleStatus(record)}
              size="small"
              disabled={record.isExpired}
            />
          </Tooltip>
          
          <Tooltip title="ลบ">
            <Button
              danger
              ghost
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
              size="small"
              disabled={record.usageCount > 0}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card title="รายการคูปอง">
      <Table
        columns={columns}
        dataSource={coupons}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={onTableChange}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </Card>
  );
}
