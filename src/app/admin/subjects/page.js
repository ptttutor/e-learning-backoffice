"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
  Switch,
  ColorPicker,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();

  // Use useCallback to memoize the function
  const filterSubjects = useCallback(() => {
    let filtered = subjects;

    if (searchText) {
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchText.toLowerCase()) ||
          subject.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((subject) => subject.isActive === isActive);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((subject) => subject.categoryId === categoryFilter);
    }

    setFilteredSubjects(filtered);
  }, [subjects, searchText, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchSubjects();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [filterSubjects]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/subjects");
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data.subjects || []);
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลวิชา");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลวิชา");
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories || []);
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่");
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value);
  };

  const showModal = (subject = null) => {
    setEditingSubject(subject);
    setIsModalVisible(true);
    if (subject) {
      form.setFieldsValue({
        ...subject,
        color: subject.color || "#1890ff",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        color: "#1890ff",
        sortOrder: 0,
        isActive: true,
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSubject(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      // สร้าง slug จาก name
      const slug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const subjectData = {
        ...values,
        slug,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || "#1890ff",
      };

      if (editingSubject) {
        // Update subject (PUT)
        const response = await fetch(`/api/admin/subjects/${editingSubject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subjectData),
        });
        const result = await response.json();
        if (result.success) {
          message.success("อัปเดตวิชาเรียบร้อยแล้ว");
          fetchSubjects();
        } else {
          message.error(result.message || "เกิดข้อผิดพลาดในการอัปเดตวิชา");
        }
      } else {
        // Add new subject (POST)
        const response = await fetch("/api/admin/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subjectData),
        });
        const result = await response.json();
        if (result.success) {
          message.success("เพิ่มวิชาใหม่เรียบร้อยแล้ว");
          fetchSubjects();
        } else {
          message.error(result.message || "เกิดข้อผิดพลาดในการเพิ่มวิชา");
        }
      }
      setIsModalVisible(false);
      setEditingSubject(null);
      form.resetFields();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error("Error saving subject:", error);
    }
  };

  const handleDelete = async (subjectId) => {
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        message.success("ลบวิชาเรียบร้อยแล้ว");
        fetchSubjects();
      } else {
        message.error(result.message || "เกิดข้อผิดพลาดในการลบวิชา");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบวิชา");
      console.error("Error deleting subject:", error);
    }
  };

  const handleToggleStatus = async (subjectId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const result = await response.json();
      if (result.success) {
        message.success("เปลี่ยนสถานะวิชาเรียบร้อยแล้ว");
        fetchSubjects();
      } else {
        message.error(result.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะวิชา");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะวิชา");
      console.error("Error toggling status:", error);
    }
  };

  const columns = [
    {
      title: "วิชา",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Space>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: record.color || "#1890ff",
              }}
            />
            <div>
              <div style={{ fontWeight: "bold" }}>{text}</div>
              <div style={{ color: "#666", fontSize: "12px" }}>
                {record.slug}
              </div>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "หมวดหมู่",
      key: "category",
      render: (_, record) => {
        if (!Array.isArray(categories)) return "-";
        const category = categories.find(cat => cat.id === record.categoryId);
        return category ? <Tag color="blue">{category.name}</Tag> : "-";
      },
    },
    {
      title: "จำนวนคอร์ส",
      dataIndex: "coursesCount",
      key: "coursesCount",
      render: (count) => (
        <Tag color={count > 0 ? "green" : "default"}>
          {count} คอร์ส
        </Tag>
      ),
      sorter: (a, b) => a.coursesCount - b.coursesCount,
    },
    {
      title: "ลำดับ",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 80,
      sorter: (a, b) => a.sortOrder - b.sortOrder,
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
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              Modal.info({
                title: "รายละเอียดวิชา",
                content: (
                  <div>
                    <p>ชื่อ: {record.name}</p>
                    <p>รายละเอียด: {record.description}</p>
                    <p>หมวดหมู่: {categories.find((c) => c.id === record.categoryId)?.name || "-"}</p>
                  </div>
                ),
              });
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="คุณแน่ใจหรือไม่ว่าต้องการลบวิชานี้?"
            description="การลบวิชาจะส่งผลต่อคอร์สที่เกี่ยวข้อง"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BookOutlined /> จัดการวิชา
        </Title>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="ค้นหาวิชา..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="สถานะ"
              style={{ width: "100%" }}
              onChange={handleStatusFilter}
              defaultValue="all"
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="active">ใช้งาน</Option>
              <Option value="inactive">ปิดใช้งาน</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="หมวดหมู่"
              style={{ width: "100%" }}
              onChange={handleCategoryFilter}
              defaultValue="all"
            >
              <Option value="all">ทั้งหมด</Option>
              {Array.isArray(categories) && categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={10} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              เพิ่มวิชาใหม่
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={Array.isArray(filteredSubjects) ? filteredSubjects : []}
          loading={loading}
          rowKey="id"
          scroll={{ x: true }}
          pagination={{
            total: Array.isArray(filteredSubjects) ? filteredSubjects.length : 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      <Modal
        title={editingSubject ? "แก้ไขวิชา" : "เพิ่มวิชาใหม่"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="ชื่อวิชา"
            name="name"
            rules={[{ required: true, message: "กรุณาใส่ชื่อวิชา" }]}
          >
            <Input placeholder="เช่น ฟิสิกส์" />
          </Form.Item>

          <Form.Item
            label="คำอธิบาย"
            name="description"
          >
            <TextArea rows={3} placeholder="คำอธิบายเกี่ยวกับวิชานี้" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="หมวดหมู่"
                name="categoryId"
              >
                <Select placeholder="เลือกหมวดหมู่">
                  {Array.isArray(categories) && categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="สีประจำวิชา"
                name="color"
              >
                <ColorPicker
                  showText
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="ไอคอน"
                name="icon"
              >
                <Select placeholder="เลือกไอคอน">
                  <Option value="BookOutlined">📚 หนังสือ</Option>
                  <Option value="ExperimentOutlined">🧪 การทดลอง</Option>
                  <Option value="CalculatorOutlined">🔢 เครื่องคิดเลข</Option>
                  <Option value="GlobalOutlined">🌍 โลก</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="ลำดับการแสดง"
                name="sortOrder"
                initialValue={0}
              >
                <Input type="number" min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="สถานะ"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="ใช้งาน" unCheckedChildren="ปิดใช้งาน" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCancel}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit">
                {editingSubject ? "อัปเดต" : "เพิ่มวิชา"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}