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
  Spin,
  Switch,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useRef } from "react";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CoursesPage() {
  // State สำหรับจัดการ chapters (must be inside the component)
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm] = Form.useForm();

  // ฟังก์ชัน CRUD สำหรับ chapters
  const openChapterModal = async (course) => {
    setSelectedCourse(course);
    setChapterModalVisible(true);
    setEditingChapter(null);
    chapterForm.resetFields();
    await fetchChapters(course.id);
  };

  const closeChapterModal = () => {
    setChapterModalVisible(false);
    setSelectedCourse(null);
    setChapters([]);
    setEditingChapter(null);
    chapterForm.resetFields();
  };

  const fetchChapters = async (courseId) => {
    setChapterLoading(true);
    try {
      const res = await fetch(
        `/api/admin/course-chapters?courseId=${courseId}`
      );
      const data = await res.json();
      if (data.success) {
        setChapters(data.data.chapters || []);
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการโหลด chapters");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลด chapters");
    } finally {
      setChapterLoading(false);
    }
  };

  const handleChapterSubmit = async (values) => {
    try {
      if (editingChapter) {
        // update
        const res = await fetch(
          `/api/admin/course-chapters/${editingChapter.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          }
        );
        const data = await res.json();
        if (data.success) {
          message.success("อัปเดตบทเรียนเรียบร้อยแล้ว");
          fetchChapters(selectedCourse.id);
        } else {
          message.error(data.message || "เกิดข้อผิดพลาดในการอัปเดตบทเรียน");
        }
      } else {
        // create
        const res = await fetch(`/api/admin/course-chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, courseId: selectedCourse.id }),
        });
        const data = await res.json();
        if (data.success) {
          message.success("เพิ่มบทเรียนเรียบร้อยแล้ว");
          fetchChapters(selectedCourse.id);
        } else {
          message.error(data.message || "เกิดข้อผิดพลาดในการเพิ่มบทเรียน");
        }
      }
      setEditingChapter(null);
      chapterForm.resetFields();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกบทเรียน");
    }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    chapterForm.setFieldsValue(chapter);
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      const res = await fetch(`/api/admin/course-chapters/${chapterId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("ลบบทเรียนเรียบร้อยแล้ว");
        fetchChapters(selectedCourse.id);
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการลบบทเรียน");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบบทเรียน");
    }
  };
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  // Use useCallback to memoize the function
  const filterCourses = useCallback(() => {
    let filtered = courses;

    if (searchText) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchText.toLowerCase()) ||
          course.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((course) => course.status === statusFilter);
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter((course) => course.subject === subjectFilter);
    }

    setFilteredCourses(filtered);
  }, [courses, searchText, statusFilter, subjectFilter]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]); // Now only depend on the memoized function

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.courses.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          subject: course.subject?.slug || course.subjectId || "",
          level: course.level,
          price: course.price,
          status: course.isPublished ? "active" : "draft",
          students: course._count?.enrollments || 0,
          lessons:
            course.chapters?.reduce(
              (sum, ch) => sum + (ch.lessons?.length || 0),
              0
            ) || 0,
          duration: course.durationHours
            ? `${course.durationHours} ชั่วโมง`
            : "-",
          createdAt: course.createdAt?.split("T")[0] || "",
        }));
        setCourses(mapped);
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลคอร์ส");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลคอร์ส");
      console.error("Error fetching courses:", error);
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

  const handleSubjectFilter = (value) => {
    setSubjectFilter(value);
  };

  const showModal = (course = null) => {
    setEditingCourse(course);
    setIsModalVisible(true);
    if (course) {
      form.setFieldsValue(course);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCourse(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCourse) {
        // Update course (PUT)
        const res = await fetch(`/api/admin/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (data.success) {
          message.success("อัปเดตคอร์สเรียบร้อยแล้ว");
          fetchCourses();
        } else {
          message.error(data.message || "เกิดข้อผิดพลาดในการอัปเดตคอร์ส");
        }
      } else {
        // Add new course (POST)
        const res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (data.success) {
          message.success("เพิ่มคอร์สใหม่เรียบร้อยแล้ว");
          fetchCourses();
        } else {
          message.error(data.message || "เกิดข้อผิดพลาดในการเพิ่มคอร์ส");
        }
      }
      setIsModalVisible(false);
      setEditingCourse(null);
      form.resetFields();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (courseId) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("ลบคอร์สเรียบร้อยแล้ว");
        fetchCourses();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการลบคอร์ส");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบคอร์ส");
    }
  };

  const columns = [
    {
      title: "ชื่อคอร์ส",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>
            {record.level} - {record.duration}
          </div>
        </div>
      ),
    },
    {
      title: "วิชา",
      dataIndex: "subject",
      key: "subject",
      render: (subject) => {
        const subjectMap = {
          physics: { color: "blue", text: "ฟิสิกส์" },
          chemistry: { color: "green", text: "เคมี" },
          mathematics: { color: "orange", text: "คณิตศาสตร์" },
        };
        return (
          <Tag color={subjectMap[subject]?.color}>
            {subjectMap[subject]?.text}
          </Tag>
        );
      },
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      render: (price) => `฿${price?.toLocaleString()}`,
    },
    {
      title: "นักเรียน",
      dataIndex: "students",
      key: "students",
      render: (students) => `${students} คน`,
    },
    {
      title: "บทเรียน",
      dataIndex: "lessons",
      key: "lessons",
      render: (lessons) => `${lessons} บทเรียน`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          active: { color: "green", text: "เผยแพร่แล้ว" },
          draft: { color: "orange", text: "แบบร่าง" },
          archived: { color: "red", text: "เก็บถาวร" },
        };
        return (
          <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
        );
      },
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<AppstoreOutlined />}
            size="small"
            href={`/admin/courses/chapter/${record.id}`}
            style={{ padding: 0 }}
          >
            จัดการบทเรียน
          </Button>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              /* View course logic */
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สนี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
    // ...existing code...

    // ...existing code...
  ];

  return (
    <>
      <Modal
        title={
          selectedCourse
            ? `จัดการบทเรียน: ${selectedCourse.title}`
            : "จัดการบทเรียน"
        }
        open={chapterModalVisible}
        onCancel={closeChapterModal}
        footer={null}
        width={700}
      >
        <Table
          dataSource={chapters}
          loading={chapterLoading}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: "ชื่อบทเรียน", dataIndex: "title", key: "title" },
            {
              title: "รายละเอียด",
              dataIndex: "description",
              key: "description",
            },
            { title: "ลำดับ", dataIndex: "sortOrder", key: "sortOrder" },
            {
              title: "สถานะ",
              dataIndex: "isPublished",
              key: "isPublished",
              render: (v) =>
                v ? (
                  <Tag color="green">เผยแพร่</Tag>
                ) : (
                  <Tag color="orange">แบบร่าง</Tag>
                ),
            },
            {
              title: "การดำเนินการ",
              key: "actions",
              render: (_, chapter) => (
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditChapter(chapter)}
                  />
                  <Popconfirm
                    title="ลบบทเรียนนี้?"
                    onConfirm={() => handleDeleteChapter(chapter.id)}
                    okText="ใช่"
                    cancelText="ไม่"
                  >
                    <Button size="small" icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
        <div
          style={{ marginTop: 24, borderTop: "1px solid #eee", paddingTop: 16 }}
        >
          <Form
            form={chapterForm}
            layout="vertical"
            onFinish={handleChapterSubmit}
            initialValues={{ isPublished: false, sortOrder: 0 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="ชื่อบทเรียน"
                  rules={[{ required: true, message: "กรุณาใส่ชื่อบทเรียน" }]}
                >
                  {" "}
                  <Input />{" "}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sortOrder"
                  label="ลำดับ"
                  rules={[{ required: true, message: "กรุณาใส่ลำดับ" }]}
                >
                  {" "}
                  <Input type="number" />{" "}
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="รายละเอียด">
              {" "}
              <Input />{" "}
            </Form.Item>
            <Form.Item name="isPublished" label="สถานะ" valuePropName="checked">
              {" "}
              <Switch
                checkedChildren="เผยแพร่"
                unCheckedChildren="แบบร่าง"
              />{" "}
            </Form.Item>
            <Form.Item style={{ textAlign: "right" }}>
              <Space>
                {editingChapter && (
                  <Button
                    onClick={() => {
                      setEditingChapter(null);
                      chapterForm.resetFields();
                    }}
                  >
                    ยกเลิก
                  </Button>
                )}
                <Button type="primary" htmlType="submit">
                  {editingChapter ? "อัปเดตบทเรียน" : "เพิ่มบทเรียน"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>จัดการคอร์ส</Title>
        </div>

        <Card>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="ค้นหาคอร์ส..."
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
                <Option value="active">เผยแพร่แล้ว</Option>
                <Option value="draft">แบบร่าง</Option>
                <Option value="archived">เก็บถาวร</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="วิชา"
                style={{ width: "100%" }}
                onChange={handleSubjectFilter}
                defaultValue="all"
              >
                <Option value="all">ทั้งหมด</Option>
                <Option value="physics">ฟิสิกส์</Option>
                <Option value="chemistry">เคมี</Option>
                <Option value="mathematics">คณิตศาสตร์</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                เพิ่มคอร์สใหม่
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredCourses}
            loading={loading}
            rowKey="id"
            scroll={{ x: true }}
            pagination={{
              total: filteredCourses.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} จาก ${total} รายการ`,
            }}
          />
        </Card>

        <Modal
          title={editingCourse ? "แก้ไขคอร์ส" : "เพิ่มคอร์สใหม่"}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="ชื่อคอร์ส"
                  name="title"
                  rules={[{ required: true, message: "กรุณาใส่ชื่อคอร์ส" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="วิชา"
                  name="subject"
                  rules={[{ required: true, message: "กรุณาเลือกวิชา" }]}
                >
                  <Select>
                    <Option value="physics">ฟิสิกส์</Option>
                    <Option value="chemistry">เคมี</Option>
                    <Option value="mathematics">คณิตศาสตร์</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="ระดับชั้น"
                  name="level"
                  rules={[{ required: true, message: "กรุณาใส่ระดับชั้น" }]}
                >
                  <Select>
                    <Option value="ม.4">ม.4</Option>
                    <Option value="ม.5">ม.5</Option>
                    <Option value="ม.6">ม.6</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="ราคา (บาท)"
                  name="price"
                  rules={[{ required: true, message: "กรุณาใส่ราคา" }]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="สถานะ"
                  name="status"
                  rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
                >
                  <Select>
                    <Option value="draft">แบบร่าง</Option>
                    <Option value="active">เผยแพร่แล้ว</Option>
                    <Option value="archived">เก็บถาวร</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="จำนวนบทเรียน"
                  name="lessons"
                  rules={[{ required: true, message: "กรุณาใส่จำนวนบทเรียน" }]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="ระยะเวลา"
                  name="duration"
                  rules={[{ required: true, message: "กรุณาใส่ระยะเวลา" }]}
                >
                  <Input placeholder="เช่น 3 เดือน" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="คำอธิบาย"
              name="description"
              rules={[{ required: true, message: "กรุณาใส่คำอธิบาย" }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancel}>ยกเลิก</Button>
                <Button type="primary" htmlType="submit">
                  {editingCourse ? "อัปเดต" : "เพิ่มคอร์ส"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}
