"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Empty,
  Space,
  Tag,
  Spin,
} from "antd";
import {
  BookOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/app/contexts/AuthContext";

const { Title, Paragraph, Text } = Typography;

async function getCourses() {
  const res = await fetch("/api/courses", { cache: "no-store" });
  const data = await res.json();
  return data.data || [];
}

async function checkEnrollment(userId, courseId) {
  if (!userId || !courseId) return null;
  try {
    const res = await fetch(
      `/api/enrollments?userId=${userId}&courseId=${courseId}`
    );
    const data = await res.json();
    return data.enrollment;
  } catch (error) {
    console.error("Failed to check enrollment:", error);
    return null;
  }
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCoursesAndEnrollments = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);

        // Check enrollments for authenticated users
        if (isAuthenticated && user && coursesData.length > 0) {
          const enrollmentPromises = coursesData.map((course) =>
            checkEnrollment(user.id, course.id)
          );
          const enrollmentResults = await Promise.all(enrollmentPromises);

          const enrollmentMap = {};
          coursesData.forEach((course, index) => {
            if (enrollmentResults[index]) {
              enrollmentMap[course.id] = enrollmentResults[index];
            }
          });
          setEnrollments(enrollmentMap);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndEnrollments();
  }, [isAuthenticated, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "green";
      case "DRAFT":
        return "orange";
      case "CLOSED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "เผยแพร่";
      case "DRAFT":
        return "ฉบับร่าง";
      case "CLOSED":
        return "ปิด";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Spin size="large" style={{ color: "white" }} />
        <div style={{ marginTop: 16, color: "white", fontSize: "16px" }}>
          กำลังโหลดคอร์ส...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "60px 24px 40px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "32px",
            }}
          >
            <Link href="/">
              <Button
                icon={<ArrowLeftOutlined />}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                }}
              >
                กลับหน้าหลัก
              </Button>
            </Link>
          </div>

          <Title
            level={1}
            style={{
              color: "white",
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "16px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <BookOutlined style={{ marginRight: 16 }} />
            คอร์สเรียนทั้งหมด
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.1rem",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            เลือกคอร์สที่คุณสนใจและเริ่มเรียนรู้ไปกับเรา
          </Paragraph>
        </div>
      </div>

      {/* Content Section */}
      <div
        style={{
          background: "#f8fafc",
          padding: "60px 24px",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {courses.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "60px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <Empty
                description={
                  <div>
                    <Text style={{ fontSize: "18px", color: "#64748b" }}>
                      ไม่มีคอร์สในขณะนี้
                    </Text>
                    <br />
                    <Text style={{ color: "#94a3b8" }}>
                      กรุณาติดตามคอร์สใหม่ในเร็วๆ นี้
                    </Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {courses.map((course) => (
                <Col xs={24} sm={12} lg={8} key={course.id}>
                  <Card
                    hoverable
                    className="feature-card"
                    style={{
                      height: "100%",
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                    styles={{
                      body: {
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      },
                    }}
                  >
                    {/* Course Header */}
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <Tag
                          color={getStatusColor(course.status)}
                          style={{
                            borderRadius: "12px",
                            padding: "4px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {getStatusText(course.status)}
                        </Tag>
                        {course.isFree ? (
                          <Tag
                            color="success"
                            style={{
                              borderRadius: "12px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            ฟรี
                          </Tag>
                        ) : (
                          <Text
                            strong
                            style={{
                              color: "#1890ff",
                              fontSize: "16px",
                            }}
                          >
                            ฿{course.price?.toLocaleString() || "0"}
                          </Text>
                        )}
                      </div>

                      <Title
                        level={4}
                        style={{
                          marginBottom: "8px",
                          color: "#1a202c",
                          lineHeight: 1.3,
                        }}
                      >
                        {course.title}
                      </Title>
                    </div>

                    {/* Course Description */}
                    <div style={{ flex: 1, marginBottom: "20px" }}>
                      <Paragraph
                        ellipsis={{ rows: 3, expandable: false }}
                        style={{
                          color: "#64748b",
                          marginBottom: "16px",
                          lineHeight: 1.6,
                        }}
                      >
                        {course.description || "ไม่มีรายละเอียด"}
                      </Paragraph>
                    </div>

                    {/* Course Info */}
                    <div style={{ marginBottom: "20px" }}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "#64748b",
                          }}
                        >
                          <UserOutlined style={{ marginRight: "8px" }} />
                          <Text style={{ color: "#64748b" }}>
                            {course.instructor?.name || "ไม่ระบุผู้สอน"}
                          </Text>
                        </div>

                        {course.duration && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              color: "#64748b",
                            }}
                          >
                            <ClockCircleOutlined
                              style={{ marginRight: "8px" }}
                            />
                            <Text style={{ color: "#64748b" }}>
                              {course.duration} ชั่วโมง
                            </Text>
                          </div>
                        )}

                        {course.category && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              color: "#64748b",
                            }}
                          >
                            <BookOutlined style={{ marginRight: "8px" }} />
                            <Text style={{ color: "#64748b" }}>
                              {course.category.name}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </div>

                    {/* Action Button */}
                    {enrollments[course.id] ? (
                      // Already enrolled - go to course content
                      <Link href={`/courses/${course.id}`}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<CheckCircleOutlined />}
                          block
                          style={{
                            background:
                              "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                            borderColor: "transparent",
                            borderRadius: "12px",
                            height: "48px",
                            fontSize: "16px",
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(82, 196, 26, 0.4)",
                          }}
                        >
                          เข้าเรียน (ลงทะเบียนแล้ว)
                        </Button>
                      </Link>
                    ) : (
                      // Not enrolled - go to purchase page
                      <Link href={`/courses/detail/${course.id}`}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<PlayCircleOutlined />}
                          block
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderColor: "transparent",
                            borderRadius: "12px",
                            height: "48px",
                            fontSize: "16px",
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                          }}
                        >
                          ดูรายละเอียด/ชำระเงิน
                        </Button>
                      </Link>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}
