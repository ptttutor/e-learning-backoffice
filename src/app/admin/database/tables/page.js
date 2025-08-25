"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Tag,
  Modal,
  Form,
  message,
  Tabs,
  Alert,
  Tooltip,
} from "antd";
import {
  DatabaseOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TableOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export default function DatabaseTablesPage() {
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState("users");
  const [tableData, setTableData] = useState([]);
  const [tableStats, setTableStats] = useState({});
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // รายการตารางในฐานข้อมูล
  const databaseTables = [
    { key: "users", name: "ผู้ใช้", icon: "👤", description: "ข้อมูลผู้ใช้ทั้งหมด" },
    { key: "courses", name: "คอร์ส", icon: "📚", description: "ข้อมูลคอร์สเรียน" },
    { key: "orders", name: "คำสั่งซื้อ", icon: "🛒", description: "ข้อมูลการสั่งซื้อ" },
    { key: "course_enrollments", name: "การลงทะเบียน", icon: "📝", description: "ข้อมูลการลงทะเบียนเรียน" },
    { key: "course_reviews", name: "รีวิว", icon: "⭐", description: "ข้อมูลรีวิวคอร์ส" },
    { key: "categories", name: "หมวดหมู่", icon: "📁", description: "หมวดหมู่คอร์ส" },
    { key: "subjects", name: "วิชา", icon: "📖", description: "รายวิชา" },
    { key: "articles", name: "บทความ", icon: "📄", description: "บทความและเนื้อหา" },
    { key: "announcements", name: "ประกาศ", icon: "📢", description: "ประกาศต่างๆ" },
    { key: "promotions", name: "โปรโมชั่น", icon: "🎁", description: "โปรโมชั่นและส่วนลด" },
    { key: "notifications", name: "การแจ้งเตือน", icon: "🔔", description: "การแจ้งเตือนผู้ใช้" },
    { key: "activity_logs", name: "บันทึกกิจกรรม", icon: "📊", description: "บันทึกการใช้งานระบบ" },
  ];

  useEffect(() => {
    fetchTableData();
    fetchTableStats();
  }, [selectedTable, pagination.current, pagination.pageSize, searchText]);

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.pageSize,
        ...(searchText && { search: searchText }),
      });

      const response = await fetch(`/api/admin/${selectedTable}?${params}`);
      const data = await response.json();

      if (data.success) {
        setTableData(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableStats = async () => {
    try {
      const response = await fetch(`/api/admin/${selectedTable}/stats`);
      const data = await response.json();
      if (data.success) {
        setTableStats(data.data || {});
      }
    } catch (error) {
      console.error("Error fetching table stats:", error);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleRefresh = () => {
    fetchTableData();
    fetchTableStats();
    message.success("รีเฟรชข้อมูลเรียบร้อย");
  };

  // สร้าง columns สำหรับแต่ละตาราง
  const getTableColumns = (tableName) => {
    const commonColumns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 280,
        render: (text) => (
          <Text code style={{ fontSize: "11px" }}>
            {text}
          </Text>
        ),
      },
    ];

    const specificColumns = {
      users: [
        {
          title: "อีเมล",
          dataIndex: "email",
          key: "email",
        },
        {
          title: "ชื่อ-นามสกุล",
          key: "fullName",
          render: (record) => `${record.firstName || ""} ${record.lastName || ""}`,
        },
        {
          title: "บทบาท",
          dataIndex: "role",
          key: "role",
          render: (role) => (
            <Tag color={role === "admin" ? "red" : role === "teacher" ? "blue" : "green"}>
              {role}
            </Tag>
          ),
        },
        {
          title: "สถานะ",
          dataIndex: "isActive",
          key: "isActive",
          render: (isActive) => (
            <Tag color={isActive ? "green" : "red"}>
              {isActive ? "ใช้งาน" : "ปิดใช้งาน"}
            </Tag>
          ),
        },
      ],
      courses: [
        {
          title: "ชื่อคอร์ส",
          dataIndex: "title",
          key: "title",
        },
        {
          title: "ราคา",
          dataIndex: "price",
          key: "price",
          render: (price) => `฿${parseFloat(price || 0).toLocaleString()}`,
        },
        {
          title: "สถานะ",
          dataIndex: "isPublished",
          key: "isPublished",
          render: (isPublished) => (
            <Tag color={isPublished ? "green" : "orange"}>
              {isPublished ? "เผยแพร่" : "ร่าง"}
            </Tag>
          ),
        },
      ],
      orders: [
        {
          title: "หมายเลขคำสั่งซื้อ",
          dataIndex: "orderNumber",
          key: "orderNumber",
        },
        {
          title: "จำนวนเงิน",
          dataIndex: "finalAmount",
          key: "finalAmount",
          render: (amount) => `฿${parseFloat(amount || 0).toLocaleString()}`,
        },
        {
          title: "สถานะ",
          dataIndex: "status",
          key: "status",
          render: (status) => {
            const statusConfig = {
              pending: { color: "orange", text: "รอชำระ" },
              processing: { color: "blue", text: "กำลังดำเนินการ" },
              paid: { color: "green", text: "ชำระแล้ว" },
              cancelled: { color: "red", text: "ยกเลิก" },
            };
            return (
              <Tag color={statusConfig[status]?.color}>
                {statusConfig[status]?.text || status}
              </Tag>
            );
          },
        },
      ],
    };

    const actionColumn = {
      title: "การดำเนินการ",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewRecord(record)}
            />
          </Tooltip>
          <Tooltip title="แก้ไข">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditRecord(record)}
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeleteRecord(record)}
            />
          </Tooltip>
        </Space>
      ),
    };

    return [
      ...commonColumns,
      ...(specificColumns[tableName] || []),
      {
        title: "วันที่สร้าง",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => new Date(date).toLocaleDateString("th-TH"),
      },
      actionColumn,
    ];
  };

  const handleViewRecord = (record) => {
    Modal.info({
      title: "รายละเอียดข้อมูล",
      width: 600,
      content: (
        <pre style={{ background: "#f6f8fa", padding: "16px", borderRadius: "6px" }}>
          {JSON.stringify(record, null, 2)}
        </pre>
      ),
    });
  };

  const handleEditRecord = (record) => {
    message.info("ฟีเจอร์แก้ไขข้อมูลจะเปิดใช้งานในเร็วๆ นี้");
  };

  const handleDeleteRecord = (record) => {
    Modal.confirm({
      title: "ยืนยันการลบ",
      content: "คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk() {
        message.success("ลบข้อมูลเรียบร้อย");
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <DatabaseOutlined /> จัดการฐานข้อมูล
        </Title>
        <Text type="secondary">
          ดูและจัดการข้อมูลในตารางต่างๆ ของระบบ
        </Text>
      </div>

      <Alert
        message="คำเตือน"
        description="การแก้ไขข้อมูลในฐานข้อมูลโดยตรงอาจส่งผลกระทบต่อระบบ กรุณาใช้ความระมัดระวัง"
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Card title="ตารางข้อมูล" size="small">
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {databaseTables.map((table) => (
                <div
                  key={table.key}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    marginBottom: "4px",
                    background: selectedTable === table.key ? "#e6f7ff" : "transparent",
                    border: selectedTable === table.key ? "1px solid #91d5ff" : "1px solid transparent",
                  }}
                  onClick={() => setSelectedTable(table.key)}
                >
                  <Space>
                    <span style={{ fontSize: "16px" }}>{table.icon}</span>
                    <div>
                      <div style={{ fontWeight: selectedTable === table.key ? "bold" : "normal" }}>
                        {table.name}
                      </div>
                      <Text type="secondary" style={{ fontSize: "11px" }}>
                        {table.description}
                      </Text>
                    </div>
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          <Card
            title={
              <Space>
                <TableOutlined />
                {databaseTables.find(t => t.key === selectedTable)?.name || selectedTable}
              </Space>
            }
            extra={
              <Space>
                <Search
                  placeholder="ค้นหาข้อมูล..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: 200 }}
                />
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                  รีเฟรช
                </Button>
                <Button type="primary" icon={<PlusOutlined />}>
                  เพิ่มข้อมูล
                </Button>
              </Space>
            }
          >
            {/* สถิติตาราง */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic
                  title="จำนวนรายการ"
                  value={pagination.total}
                  prefix={<BarChartOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="หน้าปัจจุบัน"
                  value={pagination.current}
                  suffix={`/ ${Math.ceil(pagination.total / pagination.pageSize)}`}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="แสดงต่อหน้า"
                  value={pagination.pageSize}
                  suffix="รายการ"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="ตาราง"
                  value={selectedTable}
                  valueStyle={{ fontSize: "14px" }}
                />
              </Col>
            </Row>

            <Table
              dataSource={tableData}
              columns={getTableColumns(selectedTable)}
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} จาก ${total} รายการ`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}