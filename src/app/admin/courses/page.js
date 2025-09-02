"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Card,
  Typography,
  Tag,
  Upload,
  Image,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
  TagOutlined,
  DollarOutlined,
  UploadOutlined,
  PictureOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instLoading, setInstLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Server-side filtering and pagination states
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    instructorId: "",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchInput, setSearchInput] = useState(""); // Separate state for search input
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Fetch courses with server-side filtering and pagination
  const fetchCourses = async (customFilters = {}, customPagination = {}) => {
    setLoading(true);
    try {
      const currentFilters = { ...filters, ...customFilters };
      const currentPagination = { ...pagination, ...customPagination };

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPagination.page.toString(),
        pageSize: currentPagination.pageSize.toString(),
        search: currentFilters.search,
        status: currentFilters.status,
        instructorId: currentFilters.instructorId,
        categoryId: currentFilters.categoryId,
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
      });

      // Add price filters if they exist
      if (currentFilters.minPrice)
        params.append("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);

      const res = await fetch(`/api/admin/courses?${params}`);
      const data = await res.json();

      if (data.success) {
        setCourses(data.data || []);
        setPagination(data.pagination);
        setFilters(currentFilters);
      } else {
        message.error(data.error || "โหลดข้อมูลคอร์สไม่สำเร็จ");
      }
    } catch (e) {
      console.error("Fetch courses error:", e);
      message.error("โหลดข้อมูลคอร์สไม่สำเร็จ");
    }
    setLoading(false);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    fetchCourses(newFilters, { page: 1 }); // Reset to first page when filtering
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    fetchCourses({}, { page, pageSize });
  };

  // Handle table change (sorting, pagination)
  const handleTableChange = (paginationInfo, filtersInfo, sorter) => {
    const newFilters = { ...filters };
    const newPagination = {
      page: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    };

    // Handle sorting
    if (sorter.field) {
      newFilters.sortBy = sorter.field;
      newFilters.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }

    fetchCourses(newFilters, newPagination);
  };

  // Fetch categories
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setCatLoading(false);
  };

  // Fetch instructors
  const fetchInstructors = async () => {
    setInstLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=INSTRUCTOR");
      const data = await res.json();
      setInstructors((data.data || []).filter((u) => u.role === "INSTRUCTOR"));
    } catch (e) {
      message.error("โหลดข้อมูลผู้สอนไม่สำเร็จ");
    }
    setInstLoading(false);
  };

  // Initial load only
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await fetchInstructors();
      await fetchCourses({}, { page: 1, pageSize: 10 });
    };
    loadInitialData();
  }, []); // Empty dependency array for initial load only

  // Debounce search - separate effect for search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Update filters with search term and trigger fetch
      const newFilters = { ...filters, search: searchInput };
      setFilters(newFilters);
      fetchCourses(newFilters, { page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]); // Only depend on search input

  // Handle cover image upload
  const handleCoverUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setCoverImageUrl(result.url);
        form.setFieldsValue({
          coverImageUrl: result.url,
          coverPublicId: result.public_id,
        });
        message.success("อัพโหลดรูปปกสำเร็จ");
      } else {
        message.error(result.error || "อัพโหลดรูปปกไม่สำเร็จ");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการอัพโหลด");
    }
    setUploading(false);
    return false;
  };

  // Handle cover image removal
  const handleRemoveCover = () => {
    setCoverImageUrl("");
    form.setFieldsValue({
      coverImageUrl: "",
      coverPublicId: "",
    });
    message.success("ลบรูปปกสำเร็จ");
  };

  // Create or update course
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const courseData = {
        ...values,
        coverImageUrl: coverImageUrl || values.coverImageUrl,
        price: parseFloat(values.price) || 0,
      };

      let res;
      if (editing) {
        res = await fetch(`/api/admin/courses/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });
      }

      const data = await res.json();

      if (data.success) {
        message.success(editing ? "แก้ไขคอร์สสำเร็จ" : "สร้างคอร์สสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        setCoverImageUrl("");
        fetchCourses();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  // Enhanced delete function with better error handling
  const handleDelete = (record) => {
    console.log("handleDelete called with record:", record);
    setCourseToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm soft delete function
  const confirmDelete = async () => {
    if (!courseToDelete?.id) {
      message.error("ไม่พบ ID ของคอร์ส");
      return;
    }

    setDeleting(true);

    try {
      console.log("Soft deleting course with ID:", courseToDelete.id);

      // Use PUT method to update status instead of DELETE
      const response = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseToDelete,
          status: "DELETED", // Set status to DELETED for soft delete
          deletedAt: new Date().toISOString(),
        }),
      });

      console.log("Soft delete response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Soft delete response data:", data);

      if (data.success) {
        message.success("ลบคอร์สสำเร็จ");
        setDeleteModalOpen(false);
        setCourseToDelete(null);
        await fetchCourses(); // Refresh the course list
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบคอร์ส");
      }
    } catch (error) {
      console.error("Soft delete course error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete function
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    setCoverImageUrl("");
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);

    if (record) {
      const formData = {
        title: record.title,
        description: record.description,
        price: record.price,
        status: record.status,
        instructorId: record.instructorId,
        categoryId: record.categoryId,
        coverImageUrl: record.coverImageUrl,
        coverPublicId: record.coverPublicId,
      };

      setTimeout(() => {
        form.setFieldsValue(formData);
        setCoverImageUrl(record.coverImageUrl || "");
      }, 100);
    } else {
      form.resetFields();
      setCoverImageUrl("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PUBLISHED":
        return "success";
      case "CLOSED":
        return "error";
      case "DELETED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DRAFT":
        return "ฉบับร่าง";
      case "PUBLISHED":
        return "เผยแพร่";
      case "CLOSED":
        return "ปิด";
      case "DELETED":
        return "ถูกลบ";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "รูปปก",
      dataIndex: "coverImageUrl",
      key: "coverImageUrl",
      render: (coverImageUrl) => (
        <div
          style={{ width: 60, height: 40, overflow: "hidden", borderRadius: 4 }}
        >
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt="Course Cover"
              width={60}
              height={40}
              style={{ objectFit: "cover" }}
              fallback="/placeholder-course.svg"
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 40,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
              }}
            >
              <PictureOutlined style={{ color: "#d9d9d9" }} />
            </div>
          )}
        </div>
      ),
      width: 80,
    },
    {
      title: "ชื่อคอร์ส",
      dataIndex: "title",
      key: "title",
      sorter: true,
      sortOrder:
        filters.sortBy === "title"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (title) => (
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <Text strong>{title}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      sorter: true,
      sortOrder:
        filters.sortBy === "price"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (price) => (
        <Space>
          <DollarOutlined style={{ color: "#52c41a" }} />
          <Text strong style={{ color: "#52c41a" }}>
            {new Intl.NumberFormat("th-TH", {
              style: "currency",
              currency: "THB",
            }).format(price || 0)}
          </Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortOrder:
        filters.sortBy === "status"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 120,
    },
    {
      title: "ผู้สอน",
      dataIndex: ["instructor", "name"],
      key: "instructor",
      sorter: true,
      sortOrder:
        filters.sortBy === "instructor"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (name) => (
        <Space>
          <UserOutlined style={{ color: "#8c8c8c" }} />
          <Text>{name || "-"}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "หมวดหมู่",
      dataIndex: ["category", "name"],
      key: "category",
      sorter: true,
      sortOrder:
        filters.sortBy === "category"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (name) => (
        <Space>
          <TagOutlined style={{ color: "#8c8c8c" }} />
          <Text>{name || "-"}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => {
              console.log("Delete button clicked for record:", record);
              console.log("Record ID:", record.id);
              handleDelete(record);
            }}
            style={{ borderRadius: "6px" }}
          >
            ลบ
          </Button>
          <Button
            icon={<SettingOutlined />}
            size="small"
            type="link"
            onClick={() =>
              (window.location.href = `/admin/courses/chapter/${record.id}`)
            }
            style={{ borderRadius: "6px" }}
          >
            จัดการ Chapter
          </Button>
        </Space>
      ),
      width: 280,
      fixed: "right",
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <BookOutlined style={{ marginRight: "8px" }} />
            จัดการคอร์สเรียน
          </Title>
          <Text type="secondary">สร้างและจัดการคอร์สเรียนออนไลน์</Text>
        </Space>
      </Card>

      {/* Filter Section */}
      <Card style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(null)}
            style={{ borderRadius: "6px" }}
          >
            สร้างคอร์สใหม่
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "end",
          }}
        >
          {/* Search */}
          <div style={{ minWidth: "200px" }}>
            <Text strong>ค้นหา:</Text>
            <Input
              placeholder="ค้นหาชื่อคอร์สหรือรายละเอียด"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              allowClear
              style={{ marginTop: "4px" }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: "150px" }}>
            <Text strong>สถานะ:</Text>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="เลือกสถานะ"
            >
              <Option value="ALL">ทั้งหมด</Option>
              <Option value="ACTIVE">ใช้งานอยู่</Option>
              <Option value="DRAFT">ฉบับร่าง</Option>
              <Option value="PUBLISHED">เผยแพร่</Option>
              <Option value="CLOSED">ปิด</Option>
              <Option value="DELETED">ถูกลบ</Option>
            </Select>
          </div>

          {/* Instructor Filter */}
          <div style={{ minWidth: "180px" }}>
            <Text strong>ผู้สอน:</Text>
            <Select
              value={filters.instructorId}
              onChange={(value) => handleFilterChange("instructorId", value)}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="เลือกผู้สอน"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {instructors.map((instructor) => (
                <Option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: "150px" }}>
            <Text strong>หมวดหมู่:</Text>
            <Select
              value={filters.categoryId}
              onChange={(value) => handleFilterChange("categoryId", value)}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="เลือกหมวดหมู่"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Price Range */}
          <div style={{ minWidth: "120px" }}>
            <Text strong>ราคาต่ำสุด:</Text>
            <InputNumber
              value={filters.minPrice}
              onChange={(value) => handleFilterChange("minPrice", value || "")}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="0"
              min={0}
              formatter={(value) =>
                value ? `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
            />
          </div>

          <div style={{ minWidth: "120px" }}>
            <Text strong>ราคาสูงสุด:</Text>
            <InputNumber
              value={filters.maxPrice}
              onChange={(value) => handleFilterChange("maxPrice", value || "")}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="ไม่จำกัด"
              min={0}
              formatter={(value) =>
                value ? `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
            />
          </div>

          {/* Clear Filters */}
          <div>
            <Button
              onClick={() => {
                const resetFilters = {
                  search: "",
                  status: "ALL",
                  instructorId: "",
                  categoryId: "",
                  minPrice: "",
                  maxPrice: "",
                  sortBy: "createdAt",
                  sortOrder: "desc",
                };
                fetchCourses(resetFilters, { page: 1 });
              }}
              style={{ borderRadius: "6px" }}
            >
              ล้างตัวกรอง
            </Button>
          </div>
        </div>

        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <Text type="secondary">
            แสดง {courses.length} จาก {pagination.totalCount} รายการ
          </Text>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          rowClassName={(record) =>
            record.status === "DELETED" ? "deleted-row" : ""
          }
          onChange={handleTableChange}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          size="middle"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editing ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>{editing ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}</Text>
          </Space>
        }
        open={modalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        style={{ top: 20 }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOk}
          preserve={false}
        >
          <Form.Item
            name="title"
            label="ชื่อคอร์ส"
            rules={[{ required: true, message: "กรุณากรอกชื่อคอร์ส" }]}
          >
            <Input placeholder="ใส่ชื่อคอร์ส" />
          </Form.Item>

          <Form.Item name="description" label="รายละเอียด">
            <Input.TextArea rows={3} placeholder="รายละเอียดคอร์ส" />
          </Form.Item>

          <Form.Item name="coverImageUrl" label="รูปปกคอร์ส">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Upload
                beforeUpload={handleCoverUpload}
                showUploadList={false}
                accept="image/*"
                disabled={uploading}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  style={{ borderRadius: "6px" }}
                >
                  {uploading ? "กำลังอัพโหลด..." : "อัพโหลดรูปปก"}
                </Button>
              </Upload>
              {coverImageUrl && (
                <div style={{ marginTop: 8 }}>
                  <Image
                    src={coverImageUrl}
                    alt="Course Cover Preview"
                    width={200}
                    height={120}
                    style={{
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #d9d9d9",
                    }}
                  />
                  <div style={{ marginTop: 4 }}>
                    <Button
                      size="small"
                      danger
                      type="link"
                      onClick={handleRemoveCover}
                    >
                      ลบรูปปก
                    </Button>
                  </div>
                </div>
              )}
            </Space>
          </Form.Item>

          <Form.Item name="price" label="ราคา">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="0"
              formatter={(value) =>
                `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Option value="DRAFT">
                <Space>
                  <Tag color="default">ฉบับร่าง</Tag>
                </Space>
              </Option>
              <Option value="PUBLISHED">
                <Space>
                  <Tag color="success">เผยแพร่</Tag>
                </Space>
              </Option>
              <Option value="CLOSED">
                <Space>
                  <Tag color="error">ปิด</Tag>
                </Space>
              </Option>
              <Option value="DELETED">
                <Space>
                  <Tag color="red">ถูกลบ</Tag>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="instructorId"
            label="ผู้สอน"
            rules={[{ required: true, message: "กรุณาเลือกผู้สอน" }]}
          >
            <Select
              loading={instLoading}
              placeholder="เลือกผู้สอน"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {instructors.map((instructor) => (
                <Option key={instructor.id} value={instructor.id}>
                  <Space>
                    <UserOutlined style={{ color: "#8c8c8c" }} />
                    {instructor.name} ({instructor.email})
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="categoryId" label="หมวดหมู่">
            <Select
              loading={catLoading}
              placeholder="เลือกหมวดหมู่"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  <Space>
                    <TagOutlined style={{ color: "#8c8c8c" }} />
                    {cat.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={editing ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editing ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={handleModalClose}
                style={{ borderRadius: "6px" }}
              >
                ยกเลิก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <Space>
            <DeleteOutlined style={{ color: "#ff4d4f" }} />
            <Text strong>ยืนยันการลบคอร์ส</Text>
          </Space>
        }
        open={deleteModalOpen}
        onCancel={cancelDelete}
        footer={[
          <Button key="cancel" onClick={cancelDelete}>
            ยกเลิก
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deleting}
            onClick={confirmDelete}
          >
            ลบคอร์ส
          </Button>,
        ]}
        width={500}
      >
        {courseToDelete && (
          <div>
            <p>คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้?</p>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
                marginTop: "12px",
              }}
            >
              <Text strong>ชื่อคอร์ส: </Text>
              <Text>{courseToDelete.title}</Text>
              <br />
              <Text strong>ราคา: </Text>
              <Text>
                {new Intl.NumberFormat("th-TH", {
                  style: "currency",
                  currency: "THB",
                }).format(courseToDelete.price || 0)}
              </Text>
            </div>
            <p style={{ color: "#ff4d4f", marginTop: "12px", marginBottom: 0 }}>
              ⚠️ การดำเนินการนี้ไม่สามารถยกเลิกได้
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
