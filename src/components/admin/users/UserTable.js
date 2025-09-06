import { Table, Card, Button, Space, Tag, Avatar, Typography, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined, SwapOutlined } from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

const { Text, Paragraph } = Typography;

export default function UserTable({
  users,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onTableChange,
}) {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: th,
      });
    } catch (error) {
      return "-";
    }
  };

  // Get role display
  const getRoleDisplay = (role) => {
    const roleConfig = {
      STUDENT: { text: "นักเรียน", color: "green" },
      INSTRUCTOR: { text: "ผู้สอน", color: "orange" },
      ADMIN: { text: "ผู้ดูแลระบบ", color: "red" },
    };
    return roleConfig[role] || { text: role, color: "default" };
  };

  // Get status display
  const getStatusDisplay = (user) => {
    // You can add custom logic here based on user properties
    // For now, assuming all users are active
    const isActive = true; // All users are considered active since no status field
    return isActive ? 
      { text: "เปิดใช้งาน", color: "success" } : 
      { text: "ปิดใช้งาน", color: "error" };
  };

  const columns = [
    {
      title: "ผู้ใช้งาน",
      key: "user",
      width: 300,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={40}
            src={record.image && record.image.trim() ? record.image : null}
            icon={<UserOutlined />}
            style={{
              backgroundColor: record.image && record.image.trim() ? "transparent" : "#1890ff",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              {record.name || "ไม่ระบุชื่อ"}
            </div>
            <Paragraph
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#666",
              }}
              ellipsis={{ rows: 1, tooltip: record.email }}
            >
              {record.email}
            </Paragraph>
            {record.lineId && (
              <Text
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                LINE: {record.lineId.substring(0, 10)}...
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "บทบาท",
      key: "role",
      width: 150,
      sorter: true,
      render: (_, record) => {
        const roleDisplay = getRoleDisplay(record.role);
        return <Tag color={roleDisplay.color}>{roleDisplay.text}</Tag>;
      },
    },
    {
      title: "สถานะ",
      key: "status",
      width: 130,
      render: (_, record) => {
        const statusDisplay = getStatusDisplay(record);
        return <Tag color={statusDisplay.color}>{statusDisplay.text}</Tag>;
      },
    },
    {
      title: "LINE ID",
      dataIndex: "lineId",
      key: "lineId",
      width: 150,
      render: (lineId) => (
        <Text style={{ fontSize: "12px", color: "#666" }}>
          {lineId ? `${lineId.substring(0, 10)}...` : "ไม่เชื่อมต่อ"}
        </Text>
      ),
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      sorter: true,
      render: (createdAt) => (
        <Tooltip title={new Date(createdAt).toLocaleString('th-TH')}>
          <Text style={{ fontSize: "12px", color: "#666" }}>
            {formatDate(createdAt)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "จัดการ",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          
          <Tooltip title={
            record.role === 'STUDENT' ? "เปลี่ยนเป็นผู้สอน" : 
            record.role === 'INSTRUCTOR' ? "เปลี่ยนเป็นนักเรียน" :
            "เปลี่ยนบทบาท"
          }>
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => onToggleStatus(record)}
              style={{ color: "#fa8c16" }}
              disabled={record.role === 'ADMIN'} // Don't allow changing admin role
            />
          </Tooltip>

          <Tooltip title="ลบ">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
              disabled={record.role === 'ADMIN'} // Protect admin accounts
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={
        <Space>
          รายการผู้ใช้งาน
          <Tag color="blue" style={{ marginLeft: "8px" }}>
            {pagination.total} รายการ
          </Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `แสดง ${range[0]}-${range[1]} จาก ${total} รายการ`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={onTableChange}
        scroll={{ x: 1000 }}
        size="middle"
      />
    </Card>
  );
}
