"use client";

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Form,
  message,
  Popconfirm,
  Typography,
  Spin,
  Switch,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";

const { Title } = Typography;

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm] = Form.useForm();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchChapters();
    }
    // eslint-disable-next-line
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.data.course);
      }
    } catch {}
  };

  const fetchChapters = async () => {
    setChapterLoading(true);
    try {
      const res = await fetch(`/api/admin/course-chapters?courseId=${courseId}`);
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
        const res = await fetch(`/api/admin/course-chapters/${editingChapter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (data.success) {
          message.success("อัปเดตบทเรียนเรียบร้อยแล้ว");
          fetchChapters();
        } else {
          message.error(data.message || "เกิดข้อผิดพลาดในการอัปเดตบทเรียน");
        }
      } else {
        // create
        const res = await fetch(`/api/admin/course-chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, courseId }),
        });
        const data = await res.json();
        if (data.success) {
          message.success("เพิ่มบทเรียนเรียบร้อยแล้ว");
          fetchChapters();
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
        fetchChapters();
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการลบบทเรียน");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบบทเรียน");
    }
  };

  return (
    <div>
      <Button onClick={() => router.push("/admin/courses")}>← กลับหน้าคอร์ส</Button>
      <div style={{ margin: "24px 0" }}>
        <Title level={3}>
          จัดการบทเรียน: {course ? course.title : "..."}
        </Title>
      </div>
      <Card>
        <Table
          dataSource={chapters}
          loading={chapterLoading}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: "ชื่อบทเรียน", dataIndex: "title", key: "title" },
            { title: "รายละเอียด", dataIndex: "description", key: "description" },
            { title: "ลำดับ", dataIndex: "sortOrder", key: "sortOrder" },
            { title: "สถานะ", dataIndex: "isPublished", key: "isPublished", render: (v) => v ? <Tag color="green">เผยแพร่</Tag> : <Tag color="orange">แบบร่าง</Tag> },
            {
              title: "การดำเนินการ",
              key: "actions",
              render: (_, chapter) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => handleEditChapter(chapter)} />
                  <Popconfirm title="ลบบทเรียนนี้?" onConfirm={() => handleDeleteChapter(chapter.id)} okText="ใช่" cancelText="ไม่">
                    <Button size="small" icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
        <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
          <Form
            form={chapterForm}
            layout="vertical"
            onFinish={handleChapterSubmit}
            initialValues={{ isPublished: false, sortOrder: 0 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label="ชื่อบทเรียน" rules={[{ required: true, message: "กรุณาใส่ชื่อบทเรียน" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="sortOrder" label="ลำดับ" rules={[{ required: true, message: "กรุณาใส่ลำดับ" }]}>
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="รายละเอียด">
              <Input />
            </Form.Item>
            <Form.Item name="isPublished" label="สถานะ" valuePropName="checked">
              <Switch checkedChildren="เผยแพร่" unCheckedChildren="แบบร่าง" />
            </Form.Item>
            <Form.Item style={{ textAlign: "right" }}>
              <Space>
                {editingChapter && <Button onClick={() => { setEditingChapter(null); chapterForm.resetFields(); }}>ยกเลิก</Button>}
                <Button type="primary" htmlType="submit">{editingChapter ? "อัปเดตบทเรียน" : "เพิ่มบทเรียน"}</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
}
