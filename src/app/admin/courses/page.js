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
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CoursesPage() {
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
      // Mock data - replace with actual API call
      const mockCourses = [
        {
          id: 1,
          title: "ฟิสิกส์ ม.6 เทอม 1",
          description: "เรียนฟิสิกส์ระดับชั้นมัธยมศึกษาปีที่ 6 เทอม 1",
          subject: "physics",
          level: "ม.6",
          price: 1500,
          status: "active",
          students: 45,
          lessons: 24,
          duration: "3 เดือน",
          createdAt: "2024-01-10",
        },
        {
          id: 2,
          title: "เคมี ม.5 เทอม 2",
          description: "เรียนเคมีระดับชั้นมัธยมศึกษาปีที่ 5 เทอม 2",
          subject: "chemistry",
          level: "ม.5",
          price: 1200,
          status: "active",
          students: 32,
          lessons: 20,
          duration: "3 เดือน",
          createdAt: "2024-01-08",
        },
        {
          id: 3,
          title: "คณิตศาสตร์ ม.4",
          description: "เรียนคณิตศาสตร์ระดับชั้นมัธยมศึกษาปีที่ 4",
          subject: "mathematics",
          level: "ม.4",
          price: 1000,
          status: "draft",
          students: 0,
          lessons: 18,
          duration: "3 เดือน",
          createdAt: "2024-01-05",
        },
      ];

      setCourses(mockCourses);
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
        // Update course
        const updatedCourses = courses.map((course) =>
          course.id === editingCourse.id ? { ...course, ...values } : course
        );
        setCourses(updatedCourses);
        message.success("อัปเดตคอร์สเรียบร้อยแล้ว");
      } else {
        // Add new course
        const newCourse = {
          id: Date.now(),
          ...values,
          students: 0,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setCourses([...courses, newCourse]);
        message.success("เพิ่มคอร์สใหม่เรียบร้อยแล้ว");
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
      const updatedCourses = courses.filter((course) => course.id !== courseId);
      setCourses(updatedCourses);
      message.success("ลบคอร์สเรียบร้อยแล้ว");
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
          <Tag color={statusMap[status]?.color}>
            {statusMap[status]?.text}
          </Tag>
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
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {/* View course logic */}}
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
  );
}