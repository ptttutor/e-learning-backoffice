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
  TreeSelect,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Use useCallback to memoize the function
  const filterCategories = useCallback(() => {
    let filtered = categories;

    if (searchText) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchText.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((category) => category.isActive === isActive);
    }

    setFilteredCategories(filtered);
  }, [categories, searchText, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [filterCategories]);

  const fetchCategories = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const showModal = (category = null) => {
    setEditingCategory(category);
    setIsModalVisible(true);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      // สร้าง slug จาก name
      const slug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const categoryData = {
        ...values,
        slug,
      };

      if (editingCategory) {
        // Update category (PUT)
        const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });
        const result = await response.json();
        if (result.success) {
          message.success("อัปเดตหมวดหมู่เรียบร้อยแล้ว");
          fetchCategories();
        } else {
          message.error(result.message || "เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่");
        }
      } else {
        // Add new category (POST)
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });
        const result = await response.json();
        if (result.success) {
          message.success("เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว");
          fetchCategories();
        } else {
          message.error(result.message || "เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
        }
      }

      setIsModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        message.success("ลบหมวดหมู่เรียบร้อยแล้ว");
        fetchCategories();
      } else {
        message.error(result.message || "เกิดข้อผิดพลาดในการลบหมวดหมู่");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบหมวดหมู่");
      console.error("Error deleting category:", error);
    }
  };

  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const result = await response.json();
      if (result.success) {
        message.success("เปลี่ยนสถานะหมวดหมู่เรียบร้อยแล้ว");
        fetchCategories();
      } else {
        message.error(result.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะหมวดหมู่");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะหมวดหมู่");
      console.error("Error toggling status:", error);
    }
  };

  // สร้าง tree data สำหรับ TreeSelect
  const buildTreeData = (categories, parentId = null) => {
    if (!Array.isArray(categories)) return [];

    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        title: cat.name,
        value: cat.id,
        children: buildTreeData(categories, cat.id),
      }));
  };

  const treeData = buildTreeData(categories);

  const columns = [
    {
      title: "หมวดหมู่",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Space>
            {record.parentId ? <FolderOutlined /> : <AppstoreOutlined />}
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
      title: "หมวดหมู่หลัก",
      key: "parent",
      render: (_, record) => {
        if (!record.parentId) return <Tag color="blue">หมวดหมู่หลัก</Tag>;
        if (!Array.isArray(categories)) return "-";
        const parent = categories.find((cat) => cat.id === record.parentId);
        return parent ? <Tag color="green">{parent.name}</Tag> : "-";
      },
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
                title: "รายละเอียดหมวดหมู่",
                width: 600,
                content: (
                  <div>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div>
                        <strong>ชื่อ:</strong> {record.name}
                      </div>
                      <div>
                        <strong>Slug:</strong> {record.slug}
                      </div>
                      <div>
                        <strong>คำอธิบาย:</strong>{" "}
                        {record.description || "ไม่มี"}
                      </div>
                      <div>
                        <strong>ลำดับ:</strong> {record.sortOrder}
                      </div>
                      <div>
                        <strong>สถานะ:</strong>{" "}
                        {record.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                      </div>
                      <div>
                        <strong>จำนวนหมวดหมู่ย่อย:</strong>{" "}
                        {record.children?.length || 0}
                      </div>
                    </Space>
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
            title="คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?"
            description="การลบหมวดหมู่จะส่งผลต่อหมวดหมู่ย่อยและคอร์สที่เกี่ยวข้อง"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <AppstoreOutlined /> จัดการหมวดหมู่
        </Title>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="ค้นหาหมวดหมู่..."
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
          <Col xs={24} sm={12} md={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              เพิ่มหมวดหมู่ใหม่
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={
            Array.isArray(filteredCategories) ? filteredCategories : []
          }
          loading={loading}
          rowKey="id"
          scroll={{ x: true }}
          pagination={{
            total: Array.isArray(filteredCategories)
              ? filteredCategories.length
              : 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="ชื่อหมวดหมู่"
            name="name"
            rules={[{ required: true, message: "กรุณาใส่ชื่อหมวดหมู่" }]}
          >
            <Input placeholder="เช่น วิทยาศาสตร์" />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <TextArea rows={3} placeholder="คำอธิบายเกี่ยวกับหมวดหมู่นี้" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="หมวดหมู่หลัก" name="parentId">
                <TreeSelect
                  style={{ width: "100%" }}
                  styles={{
                    popup: {
                      root: { maxHeight: 400, overflow: "auto" },
                    },
                  }}
                  treeData={treeData}
                  placeholder="เลือกหมวดหมู่หลัก (ไม่บังคับ)"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="ลำดับการแสดง" name="sortOrder" initialValue={0}>
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
                {editingCategory ? "อัปเดต" : "เพิ่มหมวดหมู่"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
