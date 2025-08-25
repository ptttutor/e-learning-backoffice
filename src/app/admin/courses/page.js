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
  Image,
  Tooltip,
  Popconfirm,
  InputNumber,
  Switch,
} from "antd";
import {
  BookOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

export default function CoursesPage() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchText, statusFilter, subjectFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data || []);
      } else {
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลคอร์ส");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/admin/subjects");
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/admin/users?role=teacher");
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // กรองตามคำค้นหา
    if (searchText) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // กรองตามสถานะ
    if (statusFilter !== "all") {
      const isPublished = statusFilter === "published";
      filtered = filtered.filter(course => course.isPublished === isPublished);
    }

    // กรองตามวิชา
    if (subjectFilter !== "all") {
      filtered = filtered.filter(course => course.subjectId === subjectFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      ...course,
      price: parseFloat(course.price || 0),
      originalPrice: parseFloat(course.originalPrice || 0),
    });
    setIsModalVisible(true);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success("ลบคอร์สเรียบร้อยแล้ว");
        fetchCourses();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการลบคอร์ส");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error("เกิดข้อผิดพลาดในการลบคอร์ส");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const url = editingCourse 
        ? `/api/admin/courses/${editingCourse.id}`
        : "/api/admin/courses";
      
      const method = editingCourse ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success(editingCourse ? "แก้ไขคอร์สเรียบร้อยแล้ว" : "สร้างคอร์สเรียบร้อยแล้ว");
        setIsModalVisible(false);
        fetchCourses();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleToggleStatus = async (courseId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !currentStatus,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success("เปลี่ยนสถานะคอร์สเรียบร้อยแล้ว");
        fetchCourses();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error toggling course status:", error);
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  const columns = [
    {
      title: "คอร์ส",
      key: "course",
      render: (_, record) => (
        <Space>
          <Image
            src={record.thumbnailImage || "/placeholder-course.jpg"}
            alt={record.title}
            width={60}
            height={40}
            style={{ borderRadius: "4px", objectFit: "cover" }}
            fallback="/placeholder-course.jpg"
          />
          <div style={{ maxWidth: "200px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {record.title}
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.shortDescription}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "วิชา",
      key: "subject",
      render: (_, record) => {
        const subject = subjects.find(s => s.id === record.subjectId);
        return subject ? (
          <Tag color="blue">{subject.name}</Tag>
        ) : (
          <Text type="secondary">ไม่ระบุ</Text>
        );
      },
    },
    {
      title: "ครูผู้สอน",
      key: "teacher",
      render: (_, record) => {
        const teacher = teachers.find(t => t.id === record.teacherId);
        return teacher ? (
          <Space>
            <UserOutlined />
            <Text>{teacher.firstName} {teacher.lastName}</Text>
          </Space>
        ) : (
          <Text type="secondary">ไม่ระบุ</Text>
        );
      },
    },
    {
      title: "ราคา",
      key: "price",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ color: "#52c41a" }}>
            <DollarOutlined /> ฿{parseFloat(record.price || 0).toLocaleString()}
          </Text>
          {record.originalPrice && parseFloat(record.originalPrice) > parseFloat(record.price || 0) && (
            <Text delete type="secondary" style={{ fontSize: "12px" }}>
              ฿{parseFloat(record.originalPrice).toLocaleString()}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "ระดับ",
      dataIndex: "level",
      key: "level",
      render: (level) => {
        const levelConfig = {
          beginner: { color: "green", text: "เริ่มต้น" },
          intermediate: { color: "orange", text: "กลาง" },
          advanced: { color: "red", text: "สูง" },
        };
        return level ? (
          <Tag color={levelConfig[level]?.color}>
            {levelConfig[level]?.text || level}
          </Tag>
        ) : null;
      },
    },
    {
      title: "สถานะ",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished, record) => (
        <Switch
          checked={isPublished}
          onChange={() => handleToggleStatus(record.id, isPublished)}
          checkedChildren="เผยแพร่"
          unCheckedChildren="ร่าง"
        />
      ),
    },
    {
      title: "จำนวนบทเรียน",
      dataIndex: "totalLessons",
      key: "totalLessons",
      render: (total) => `${total || 0} บทเรียน`,
    },
    {
      title: "วันที่สร้าง",
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
                  title: "รายละเอียดคอร์ส",
                  width: 800,
                  content: (
                    <div>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div><strong>ชื่อคอร์ส:</strong> {record.title}</div>
                        <div><strong>คำอธิบาย:</strong> {record.description}</div>
                        <div><strong>ราคา:</strong> ฿{parseFloat(record.price || 0).toLocaleString()}</div>
                        <div><strong>ระยะเวลา:</strong> {record.durationHours || 0} ชั่วโมง</div>
                        <div><strong>จำนวนบทเรียน:</strong> {record.totalLessons || 0} บทเรียน</div>
                        <div><strong>ความต้องการ:</strong> {record.requirements || "ไม่ระบุ"}</div>
                        <div><strong>สิ่งที่จะได้เรียนรู้:</strong> {record.whatYouLearn || "ไม่ระบุ"}</div>
                        <div><strong>สถานะ:</strong> {record.isPublished ? "เผยแพร่" : "ร่าง"}</div>
                        <div><strong>คอร์สแนะนำ:</strong> {record.isFeatured ? "ใช่" : "ไม่"}</div>
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
              onClick={() => handleEditCourse(record)}
            />
          </Tooltip>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้?"
            onConfirm={() => handleDeleteCourse(record.id)}
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
          <BookOutlined /> จัดการคอร์ส
        </Title>
        <Text type="secondary">
          จัดการข้อมูลคอร์สเรียนทั้งหมดในระบบ
        </Text>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="ค้นหาคอร์ส..."
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="สถานะ"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="published">เผยแพร่</Option>
              <Option value="draft">ร่าง</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="วิชา"
              style={{ width: "100%" }}
              value={subjectFilter}
              onChange={setSubjectFilter}
            >
              <Option value="all">ทั้งหมด</Option>
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateCourse}
              >
                เพิ่มคอร์สใหม่
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCourses}
              >
                รีเฟรช
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredCourses}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingCourse ? "แก้ไขคอร์ส" : "เพิ่มคอร์สใหม่"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            level: "beginner",
            price: 0,
            isPublished: false,
            isFeatured: false,
          }}
        >
          <Form.Item
            name="title"
            label="ชื่อคอร์ส"
            rules={[{ required: true, message: "กรุณากรอกชื่อคอร์ส" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="shortDescription"
            label="คำอธิบายสั้น"
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="description"
            label="คำอธิบายคอร์ส"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="subjectId" label="วิชา">
                <Select placeholder="เลือกวิชา">
                  {subjects.map(subject => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teacherId" label="ครูผู้สอน">
                <Select placeholder="เลือกครูผู้สอน">
                  {teachers.map(teacher => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="level" label="ระดับความยาก">
                <Select>
                  <Option value="beginner">เริ่มต้น</Option>
                  <Option value="intermediate">กลาง</Option>
                  <Option value="advanced">สูง</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="price" label="ราคา (บาท)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="originalPrice" label="ราคาเดิม (บาท)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="durationHours" label="ระยะเวลา (ชั่วโมง)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalLessons" label="จำนวนบทเรียน">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="requirements" label="ความต้องการ">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="whatYouLearn" label="สิ่งที่จะได้เรียนรู้">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isPublished" label="เผยแพร่คอร์ส" valuePropName="checked">
                <Switch checkedChildren="เผยแพร่" unCheckedChildren="ร่าง" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isFeatured" label="คอร์สแนะนำ" valuePropName="checked">
                <Switch checkedChildren="แนะนำ" unCheckedChildren="ปกติ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}