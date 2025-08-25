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
  Tag,
  Modal,
  Form,
  message,
  Avatar,
  Tooltip,
  Popconfirm,
  DatePicker,
  Switch,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, roleFilter, statusFilter, filterUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
      } else {
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // กรองตามคำค้นหา
    if (searchText) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // กรองตามบทบาท
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // กรองตามสถานะ
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success("ลบผู้ใช้เรียบร้อยแล้ว");
        fetchUsers();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการลบผู้ใช้");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";
      
      const method = editingUser ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success(editingUser ? "แก้ไขผู้ใช้เรียบร้อยแล้ว" : "สร้างผู้ใช้เรียบร้อยแล้ว");
        setIsModalVisible(false);
        fetchUsers();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success("เปลี่ยนสถานะผู้ใช้เรียบร้อยแล้ว");
        fetchUsers();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  const columns = [
    {
      title: "ผู้ใช้",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.profileImage} 
            icon={<UserOutlined />}
            size="large"
          />
          <div>
            <div style={{ fontWeight: "bold" }}>
              {record.firstName} {record.lastName}
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              <MailOutlined /> {record.email}
            </Text>
            {record.phone && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <PhoneOutlined /> {record.phone}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "บทบาท",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const roleConfig = {
          admin: { color: "red", text: "ผู้ดูแลระบบ" },
          teacher: { color: "blue", text: "ครู" },
          student: { color: "green", text: "นักเรียน" },
        };
        return (
          <Tag color={roleConfig[role]?.color}>
            {roleConfig[role]?.text || role}
          </Tag>
        );
      },
    },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id, isActive)}
          checkedChildren="ใช้งาน"
          unCheckedChildren="ปิด"
        />
      ),
    },
    {
      title: "การยืนยันอีเมล",
      dataIndex: "emailVerified",
      key: "emailVerified",
      render: (verified) => (
        <Tag color={verified ? "green" : "orange"}>
          {verified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
        </Tag>
      ),
    },
    {
      title: "เข้าสู่ระบบล่าสุด",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => date ? new Date(date).toLocaleString("th-TH") : "ไม่เคย",
    },
    {
      title: "วันที่สมัคร",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString("th-TH")}>
          <Text>
            <CalendarOutlined /> {new Date(date).toLocaleDateString("th-TH")}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: "รายละเอียดผู้ใช้",
                  width: 600,
                  content: (
                    <div>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div><strong>ID:</strong> {record.id}</div>
                        <div><strong>อีเมล:</strong> {record.email}</div>
                        <div><strong>ชื่อ:</strong> {record.firstName} {record.lastName}</div>
                        <div><strong>เบอร์โทร:</strong> {record.phone || "ไม่ระบุ"}</div>
                        <div><strong>วันเกิด:</strong> {record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString("th-TH") : "ไม่ระบุ"}</div>
                        <div><strong>เพศ:</strong> {record.gender || "ไม่ระบุ"}</div>
                        <div><strong>บทบาท:</strong> {record.role}</div>
                        <div><strong>สถานะ:</strong> {record.isActive ? "ใช้งาน" : "ปิดใช้งาน"}</div>
                        <div><strong>ยืนยันอีเมล:</strong> {record.emailVerified ? "แล้ว" : "ยังไม่"}</div>
                      </Space>
                    </div>
                  ),
                });
              }}
            />
          </Tooltip>
          <Tooltip title="แก้ไข">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
          >
            <Tooltip title="ลบ">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UserOutlined /> จัดการผู้ใช้
        </Title>
        <Text type="secondary">
          จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ
        </Text>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="ค้นหาผู้ใช้..."
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="บทบาท"
              style={{ width: "100%" }}
              value={roleFilter}
              onChange={setRoleFilter}
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="admin">ผู้ดูแลระบบ</Option>
              <Option value="teacher">ครู</Option>
              <Option value="student">นักเรียน</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="สถานะ"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="active">ใช้งาน</Option>
              <Option value="inactive">ปิดใช้งาน</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUser}
              >
                เพิ่มผู้ใช้ใหม่
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
              >
                รีเฟรช
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredUsers}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            role: "student",
            isActive: true,
            emailVerified: false,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="ชื่อ"
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="นามสกุล"
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล" },
              { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
            ]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="รหัสผ่าน"
              rules={[
                { required: true, message: "กรุณากรอกรหัสผ่าน" },
                { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="เบอร์โทรศัพท์">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="เพศ">
                <Select placeholder="เลือกเพศ">
                  <Option value="male">ชาย</Option>
                  <Option value="female">หญิง</Option>
                  <Option value="other">อื่นๆ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="บทบาท">
                <Select>
                  <Option value="student">นักเรียน</Option>
                  <Option value="teacher">ครู</Option>
                  <Option value="admin">ผู้ดูแลระบบ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="วันเกิด">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isActive" label="สถานะการใช้งาน" valuePropName="checked">
                <Switch checkedChildren="ใช้งาน" unCheckedChildren="ปิด" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="emailVerified" label="ยืนยันอีเมล" valuePropName="checked">
                <Switch checkedChildren="ยืนยันแล้ว" unCheckedChildren="ยังไม่ยืนยัน" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}